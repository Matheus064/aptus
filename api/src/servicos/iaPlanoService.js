const Anthropic = require('@anthropic-ai/sdk');
const { executar, buscar, listar } = require('../config/conexaoBanco');

const client = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Gera um plano alimentar completo com receitas usando IA
 * @param {Object} parametros - Parâmetros para gerar o plano
 * @returns {Promise<Object>} - Plano gerado com receitas
 */
async function gerarPlanoComIA(parametros) {
  const {
    objetivo, // 'emagrecimento', 'ganho_massa', 'manutencao'
    diasDuracao = 7,
    calorias,
    alergias = [],
    preferencias = [],
    restricoes = [],
    usuarioId = null,
  } = parametros;

  const prompt = `Você é um nutricionista expert. Gere um plano alimentar de ${diasDuracao} dias com o objetivo de ${objetivo}.

Requisitos:
- Calorias diárias alvo: ${calorias || 'não especificado'}
- Alergias/Restrições: ${alergias.join(', ') || 'nenhuma'}
- Preferências: ${preferencias.join(', ') || 'nenhuma'}
- Restrições adicionais: ${restricoes.join(', ') || 'nenhuma'}

Para CADA dia do plano, forneça EXATAMENTE 4 refeições no seguinte formato JSON puro (sem markdown):

{
  "plano": {
    "titulo": "Plano de ${objetivo} - ${diasDuracao} dias",
    "descricao": "Descrição detalhada do plano",
    "calorias_alvo": ${calorias || 2000},
    "dias": [
      {
        "dia": 1,
        "refeicoes": [
          {
            "nome": "Café da Manhã",
            "horario": "07:00",
            "receita": {
              "titulo": "Nome da Receita",
              "descricao": "Descrição breve",
              "modo_preparo": "Passo 1\\nPasso 2\\nPasso 3",
              "tempo_preparo": 15,
              "porcoes": 1,
              "calorias": 400,
              "proteina": 15,
              "carboidrato": 50,
              "gordura": 10,
              "fibra": 5,
              "ingredientes": [
                {"nome": "Ovo", "quantidade": 2, "unidade": "unidades", "calorias_por_100g": 155},
                {"nome": "Pão integral", "quantidade": 2, "unidade": "fatias", "calorias_por_100g": 265}
              ],
              "dificuldade": "fácil",
              "categoria": "café_da_manha"
            }
          },
          {
            "nome": "Lanche da Manhã",
            "horario": "10:00",
            "receita": { /* mesma estrutura */ }
          },
          {
            "nome": "Almoço",
            "horario": "12:30",
            "receita": { /* mesma estrutura */ }
          },
          {
            "nome": "Lanche da Tarde",
            "horario": "15:00",
            "receita": { /* mesma estrutura */ }
          }
        ]
      },
      // ... mais dias aqui
    ]
  }
}

Importante:
- RETORNE APENAS JSON VÁLIDO
- Cada receita deve ter ingredientes com nome, quantidade e unidade
- Inclua macronutrientes precisos
- As receitas devem ser realistas e deliciosas
- Respeite as alergias e preferências do usuário`;

  // Log para DEBUG
  console.log('🤖 Gerando plano com IA...');
  console.log('Parâmetros:', parametros);

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const resposta = message.content[0].type === 'text' ? message.content[0].text : '';

  // Extrai JSON da resposta
  const jsonMatch = resposta.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Não foi possível extrair o plano da resposta da IA');
  }

  const planoGerado = JSON.parse(jsonMatch[0]);

  // Salva no banco de dados
  if (usuarioId) {
    await executar(
      `INSERT INTO planos_gerados_ia (usuario_id, parametros, resultado_texto, status) 
       VALUES (?, ?, ?, ?)`,
      [usuarioId, JSON.stringify(parametros), resposta, 'completo']
    );
  }

  return planoGerado;
}

/**
 * Gera receitas detalhadas com fotos usando Unsplash
 * @param {Object} receita - Dados da receita
 * @returns {Promise<Object>} - Receita com URL de foto
 */
async function enriquecerReceitaComFoto(receita) {
  try {
    // Gera query de busca baseado no título
    const searchQuery = encodeURIComponent(receita.titulo);
    const fotoUrl = `https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&q=80&${receita.titulo
      .split(' ')
      .slice(0, 2)
      .join('+')}`;

    return {
      ...receita,
      foto_url: fotoUrl,
    };
  } catch (error) {
    console.error('Erro ao buscar foto:', error);
    return receita;
  }
}

/**
 * Salva um plano gerado no banco de dados
 * @param {Object} plano - Plano alimentar gerado
 * @param {Number} usuarioId - ID do usuário
 * @returns {Promise<Object>} - Plano salvo com ID
 */
async function salvarPlanoGerado(plano, usuarioId) {
  try {
    // Insere o plano principal
    const resultadoPlano = await executar(
      `INSERT INTO planos_alimentares 
       (titulo, descricao, criado_por, duracao_dias, calorias_alvo, tipo, foto_capa_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        plano.titulo,
        plano.descricao,
        usuarioId,
        plano.dias.length,
        plano.calorias_alvo,
        'personalizado',
        plano.foto_capa_url || 'https://via.placeholder.com/500x300?text=Plano+Personalizado',
      ]
    );

    const planoId = resultadoPlano.id;

    // Insere as receitas e associa ao plano
    for (const dia of plano.dias) {
      for (const refeicao of dia.refeicoes) {
        if (refeicao.receita) {
          const receita = refeicao.receita;

          // Insere a receita
          const resultadoReceita = await executar(
            `INSERT INTO receitas 
             (titulo, descricao, modo_preparo, criado_por, calorias, proteina, carboidrato, gordura, fibra, foto_url, tempo_preparo, porcoes, dificuldade, categoria) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              receita.titulo,
              receita.descricao,
              receita.modo_preparo,
              usuarioId,
              receita.calorias,
              receita.proteina,
              receita.carboidrato,
              receita.gordura,
              receita.fibra,
              receita.foto_url || 'https://via.placeholder.com/500x300?text=' + encodeURIComponent(receita.titulo),
              receita.tempo_preparo,
              receita.porcoes,
              receita.dificuldade,
              receita.categoria,
            ]
          );

          const receitaId = resultadoReceita.id;

          // Insere os ingredientes
          for (const ingrediente of receita.ingredientes) {
            let ingredienteId;

            // Verifica se o ingrediente já existe
            const existente = await buscar('SELECT id FROM ingredientes WHERE nome COLLATE NOCASE = ?', [
              ingrediente.nome,
            ]);

            if (existente) {
              ingredienteId = existente.id;
            } else {
              // Cria novo ingrediente
              const resultado = await executar(
                `INSERT INTO ingredientes (nome, tipo_alimento, calorias_por_100g) VALUES (?, ?, ?)`,
                [ingrediente.nome, 'alimento', ingrediente.calorias_por_100g]
              );
              ingredienteId = resultado.id;
            }

            // Associa ingrediente à receita
            await executar(
              `INSERT INTO receitas_ingredientes (receita_id, ingrediente_id, quantidade, unidade_medida) 
               VALUES (?, ?, ?, ?)`,
              [receitaId, ingredienteId, ingrediente.quantidade, ingrediente.unidade]
            );
          }

          // Associa receita ao plano
          await executar(
            `INSERT INTO planos_receitas (plano_id, receita_id, dia_plano, refeicao) 
             VALUES (?, ?, ?, ?)`,
            [planoId, receitaId, dia.dia, refeicao.nome]
          );
        }
      }
    }

    return {
      id: planoId,
      ...plano,
    };
  } catch (error) {
    console.error('Erro ao salvar plano gerado:', error);
    throw error;
  }
}

/**
 * Calcula macronutrientes totais de um plano
 * @param {Number} planoId - ID do plano
 * @returns {Promise<Object>} - Resumo de macronutrientes
 */
async function calcularMacronutrientes(planoId) {
  const resultado = await buscar(
    `SELECT 
      SUM(r.calorias) as calorias_total,
      SUM(r.proteina) as proteina_total,
      SUM(r.carboidrato) as carboidrato_total,
      SUM(r.gordura) as gordura_total,
      SUM(r.fibra) as fibra_total,
      COUNT(DISTINCT pr.dia_plano) as dias
    FROM planos_receitas pr
    JOIN receitas r ON r.id = pr.receita_id
    WHERE pr.plano_id = ?`,
    [planoId]
  );

  return resultado;
}

module.exports = {
  gerarPlanoComIA,
  enriquecerReceitaComFoto,
  salvarPlanoGerado,
  calcularMacronutrientes,
};
