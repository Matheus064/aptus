const {
  gerarPlanoComIA,
  salvarPlanoGerado,
  calcularMacronutrientes,
} = require('../servicos/iaPlanoService');
const { executar, buscar, listar } = require('../config/conexaoBanco');

/**
 * Gera um novo plano alimentar com IA
 * POST /api/ia/gerar-plano
 */
async function gerarPlanoComIACtrl(req, res, next) {
  try {
    const {
      objetivo, // 'emagrecimento', 'ganho_massa', 'manutencao'
      dias = 7,
      calorias,
      alergias = [],
      preferencias = [],
      restricoes = [],
      salvar = true, // Se deve salvar no banco
    } = req.body;

    // Validações
    if (!objetivo) {
      return res.status(422).json({ erro: 'Objetivo é obrigatório (emagrecimento, ganho_massa ou manutencao)' });
    }

    if (!['emagrecimento', 'ganho_massa', 'manutencao'].includes(objetivo)) {
      return res.status(422).json({ erro: 'Objetivo inválido' });
    }

    if (dias < 1 || dias > 30) {
      return res.status(422).json({ erro: 'Duração deve estar entre 1 e 30 dias' });
    }

    console.log('📋 Gerando plano alimentar com IA...');
    console.log('Usuário:', req.usuario.sub);
    console.log('Parâmetros:', { objetivo, dias, calorias, alergias, preferencias, restricoes });

    // Gera o plano com IA
    const planoGerado = await gerarPlanoComIA({
      objetivo,
      diasDuracao: dias,
      calorias,
      alergias,
      preferencias,
      restricoes,
      usuarioId: req.usuario.sub,
    });

    // Salva no banco se solicitado
    let planoSalvo = null;
    if (salvar) {
      console.log('💾 Salvando plano no banco de dados...');
      planoSalvo = await salvarPlanoGerado(planoGerado.plano, req.usuario.sub);
      console.log('✅ Plano salvo com ID:', planoSalvo.id);
    }

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Plano alimentar gerado com sucesso!',
      plano: planoGerado.plano,
      planosalvo: planoSalvo ? { id: planoSalvo.id, titulo: planoSalvo.titulo } : null,
    });
  } catch (error) {
    console.error('❌ Erro ao gerar plano com IA:', error.message);
    return next(error);
  }
}

/**
 * Gera uma receita individual com IA
 * POST /api/ia/gerar-receita
 */
async function gerarReceitaComIACtrl(req, res, next) {
  try {
    const {
      tipo, // 'café_da_manha', 'almoço', 'lanche', 'jantar'
      calorias = 400,
      alergias = [],
      preferencias = [],
      restricoes = [],
    } = req.body;

    if (!tipo) {
      return res.status(422).json({ erro: 'Tipo de refeição é obrigatório' });
    }

    const prompt = `Você é um chef nutricionista expert. Crie uma receita deliciosa e saudável para ${tipo} com aproximadamente ${calorias} calorias.

Alergias a evitar: ${alergias.join(', ') || 'nenhuma'}
Preferências: ${preferencias.join(', ') || 'nenhuma'}
Restrições: ${restricoes.join(', ') || 'nenhuma'}

Retorne APENAS um JSON válido neste formato:

{
  "receita": {
    "titulo": "Nome da receita",
    "descricao": "Descrição breve e apetitosa",
    "modo_preparo": "Passo 1\\nPasso 2\\nPasso 3...",
    "tempo_preparo": 15,
    "porcoes": 1,
    "calorias": 400,
    "proteina": 20,
    "carboidrato": 45,
    "gordura": 12,
    "fibra": 5,
    "dificuldade": "fácil",
    "categoria": "${tipo}",
    "ingredientes": [
      {"nome": "Ingrediente", "quantidade": 1, "unidade": "unidade", "calorias_por_100g": 100}
    ]
  }
}`;

    const { Anthropic } = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const resposta = message.content[0].text;
    const jsonMatch = resposta.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Não foi possível extrair a receita da resposta');
    }

    const receitaGerada = JSON.parse(jsonMatch[0]);

    // Salva a receita no banco
    const resultado = await executar(
      `INSERT INTO receitas 
       (titulo, descricao, modo_preparo, criado_por, calorias, proteina, carboidrato, gordura, fibra, tempo_preparo, porcoes, dificuldade, categoria) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        receitaGerada.receita.titulo,
        receitaGerada.receita.descricao,
        receitaGerada.receita.modo_preparo,
        req.usuario.sub,
        receitaGerada.receita.calorias,
        receitaGerada.receita.proteina,
        receitaGerada.receita.carboidrato,
        receitaGerada.receita.gordura,
        receitaGerada.receita.fibra,
        receitaGerada.receita.tempo_preparo,
        receitaGerada.receita.porcoes,
        receitaGerada.receita.dificuldade,
        receitaGerada.receita.categoria,
      ]
    );

    const receitaId = resultado.id;

    // Salva ingredientes
    for (const ingrediente of receitaGerada.receita.ingredientes) {
      let ingredienteId;
      const existente = await buscar('SELECT id FROM ingredientes WHERE nome COLLATE NOCASE = ?', [
        ingrediente.nome,
      ]);

      if (existente) {
        ingredienteId = existente.id;
      } else {
        const resultIngrediente = await executar(
          `INSERT INTO ingredientes (nome, calorias_por_100g) VALUES (?, ?)`,
          [ingrediente.nome, ingrediente.calorias_por_100g]
        );
        ingredienteId = resultIngrediente.id;
      }

      await executar(
        `INSERT INTO receitas_ingredientes (receita_id, ingrediente_id, quantidade, unidade_medida) 
         VALUES (?, ?, ?, ?)`,
        [receitaId, ingredienteId, ingrediente.quantidade, ingrediente.unidade]
      );
    }

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Receita gerada com sucesso!',
      receita: {
        id: receitaId,
        ...receitaGerada.receita,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar receita:', error);
    return next(error);
  }
}

/**
 * Obtém sugestões de planos baseadas no perfil do usuário
 * GET /api/ia/sugestoes-planos
 */
async function obterSuggestoesPlanos(req, res, next) {
  try {
    const usuario = await buscar(
      `SELECT u.*, 
        (SELECT COUNT(*) FROM usuarios_seguem_planos WHERE usuario_id = u.id) as planos_seguindo,
        (SELECT peso_atual FROM historico_peso WHERE usuario_id = u.id ORDER BY data_registro DESC LIMIT 1) as peso_recente
       FROM usuarios WHERE id = ?`,
      [req.usuario.sub]
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Busca planos populares e relevantes
    const planosSugeridos = await listar(
      `SELECT p.*, u.nome_completo as autor_nome, COUNT(usp.usuario_id) as seguidores
       FROM planos_alimentares p
       JOIN usuarios u ON u.id = p.criado_por
       LEFT JOIN usuarios_seguem_planos usp ON usp.plano_id = p.id
       WHERE p.ativo = 1 
       AND p.criado_por != ?
       AND NOT EXISTS (SELECT 1 FROM usuarios_seguem_planos WHERE usuario_id = ? AND plano_id = p.id)
       GROUP BY p.id
       ORDER BY seguidores DESC, p.data_criacao DESC
       LIMIT 10`,
      [req.usuario.sub, req.usuario.sub]
    );

    return res.json({
      usuario: {
        peso_atual: usuario.peso_atual,
        peso_meta: usuario.peso_meta,
        planos_seguindo: usuario.planos_seguindo,
      },
      planos_sugeridos: planosSugeridos,
      mensagem: 'Planos sugeridos baseados em popularidade e seu perfil',
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Calcula o plano nutricional recomendado com base no perfil
 * POST /api/ia/calcular-necessidades
 */
async function calcularNecessidadesNutricionais(req, res, next) {
  try {
    const { peso, altura, idade, sexo, objetivo, nivelAtividade } = req.body;

    if (!peso || !altura || !idade || !sexo || !objetivo) {
      return res.status(422).json({ erro: 'Todos os campos são obrigatórios' });
    }

    // Cálculo TMB (Taxa Metabólica Basal) - Fórmula de Mifflin-St Jeor
    let tmb;
    if (sexo === 'masculino') {
      tmb = 10 * peso + 6.25 * altura - 5 * idade + 5;
    } else {
      tmb = 10 * peso + 6.25 * altura - 5 * idade - 161;
    }

    // Multiplicadores de atividade
    const fatoresAtividade = {
      sedentario: 1.2,
      ligeiro: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      muito_intenso: 1.9,
    };

    const gasto = tmb * (fatoresAtividade[nivelAtividade] || 1.5);

    // Calcula calorias alvo conforme objetivo
    let calorias;
    if (objetivo === 'emagrecimento') {
      calorias = gasto - 500; // Déficit de 500 cal/dia
    } else if (objetivo === 'ganho_massa') {
      calorias = gasto + 500; // Superávit de 500 cal/dia
    } else {
      calorias = gasto; // Manutenção
    }

    // Distribui macronutrientes (percentual de calorias)
    const macronutrientes = {
      proteina: { calorias: calorias * 0.3, gramas: (calorias * 0.3) / 4 }, // 4 cal/g
      carboidrato: { calorias: calorias * 0.45, gramas: (calorias * 0.45) / 4 }, // 4 cal/g
      gordura: { calorias: calorias * 0.25, gramas: (calorias * 0.25) / 9 }, // 9 cal/g
    };

    return res.json({
      sucesso: true,
      usuario: {
        peso,
        altura,
        idade,
        sexo,
        objetivo,
        nivelAtividade,
      },
      metricas: {
        tmb: Math.round(tmb),
        gasto_diario: Math.round(gasto),
        calorias_recomendadas: Math.round(calorias),
      },
      macronutrientes: {
        proteina: {
          gramas_dia: Math.round(macronutrientes.proteina.gramas),
          calorias: Math.round(macronutrientes.proteina.calorias),
          percentual: 30,
        },
        carboidrato: {
          gramas_dia: Math.round(macronutrientes.carboidrato.gramas),
          calorias: Math.round(macronutrientes.carboidrato.calorias),
          percentual: 45,
        },
        gordura: {
          gramas_dia: Math.round(macronutrientes.gordura.gramas),
          calorias: Math.round(macronutrientes.gordura.calorias),
          percentual: 25,
        },
      },
      dica: `Você deve consumir aproximadamente ${Math.round(calorias)} calorias por dia para ${objetivo === 'emagrecimento' ? 'emagrecer' : objetivo === 'ganho_massa' ? 'ganhar massa' : 'manter seu peso'}.`,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  gerarPlanoComIACtrl,
  gerarReceitaComIACtrl,
  obterSuggestoesPlanos,
  calcularNecessidadesNutricionais,
};
