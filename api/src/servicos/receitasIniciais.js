const crypto = require('node:crypto');
const { criarHash } = require('../utilitarios/hash');
const { executar, buscar } = require('../config/conexaoBanco');

const receitas = [
  {
    titulo: 'Aveia cremosa com iogurte, chia e frutas', categoria: 'café da manhã', tempo: 10,
    descricao: 'Café da manhã simples com aveia, fruta e sementes. Os valores nutricionais são estimativas por porção.',
    modo: '1. Misture a aveia, o iogurte e a chia em um pote. 2. Tampe e deixe na geladeira por pelo menos 4 horas (ou durante a noite). 3. Antes de servir, cubra com morangos e banana fatiada. Ajuste a consistência com um pouco de água ou leite, se desejar.',
    calorias: 365, proteina: 20, carboidrato: 54, gordura: 8, fibra: 10, porcoes: 1, alergenicos: ['leite'], dietas: ['vegetariana'],
    ingredientes: [['Aveia em flocos', 40, 'g'], ['Iogurte natural', 150, 'g'], ['Semente de chia', 10, 'g'], ['Morango', 80, 'g'], ['Banana', 50, 'g']],
  },
  {
    titulo: 'Bowl brasileiro de frango, arroz integral e feijão', categoria: 'almoço', tempo: 35,
    descricao: 'Refeição caseira com cereal, leguminosa, frango e abóbora. Valores nutricionais estimados por porção.',
    modo: '1. Cozinhe o arroz integral e o feijão até ficarem macios. 2. Tempere o frango com alho, limão, páprica e pouco sal; grelhe até ficar completamente cozido. 3. Asse ou cozinhe a abóbora em cubos até ficar macia. 4. Monte o prato com arroz, feijão, frango e abóbora; finalize com cheiro-verde.',
    calorias: 535, proteina: 43, carboidrato: 68, gordura: 10, fibra: 13, porcoes: 1, alergenicos: [], dietas: [],
    ingredientes: [['Arroz integral cru', 55, 'g'], ['Feijão carioca cozido', 100, 'g'], ['Peito de frango', 130, 'g'], ['Abóbora cabotiá', 120, 'g'], ['Azeite de oliva', 5, 'ml'], ['Alho', 4, 'g'], ['Limão', 10, 'g']],
  },
  {
    titulo: 'Salada morna de lentilha com tomate e pepino', categoria: 'almoço', tempo: 25,
    descricao: 'Lentilhas, hortaliças frescas e um molho simples de limão e azeite. Valores nutricionais estimados por porção.',
    modo: '1. Cozinhe as lentilhas em água até ficarem macias, mas sem desmanchar, e escorra. 2. Pique o tomate, o pepino e a cebola. 3. Misture as lentilhas ainda mornas aos vegetais e à salsinha. 4. Tempere com limão, azeite, pimenta e sal a gosto; sirva morna ou fria.',
    calorias: 345, proteina: 17, carboidrato: 52, gordura: 8, fibra: 16, porcoes: 1, alergenicos: [], dietas: ['vegetariana', 'vegana'],
    ingredientes: [['Lentilha cozida', 180, 'g'], ['Tomate', 100, 'g'], ['Pepino', 80, 'g'], ['Cebola roxa', 20, 'g'], ['Azeite de oliva', 5, 'ml'], ['Limão', 15, 'g'], ['Salsinha', 5, 'g']],
  },
  {
    titulo: 'Peixe assado com batata e brócolis', categoria: 'jantar', tempo: 35,
    descricao: 'Filé de peixe assado acompanhado de batata e brócolis. Valores nutricionais estimados por porção.',
    modo: '1. Aqueça o forno a 200 °C. 2. Corte a batata em cubos, tempere com metade do azeite e asse por 15 minutos. 3. Tempere o peixe com limão, alho, pimenta e o azeite restante; coloque na assadeira e asse por mais 12 a 15 minutos, até ficar opaco e se desfazer facilmente. 4. Cozinhe o brócolis no vapor até ficar macio e sirva junto.',
    calorias: 410, proteina: 36, carboidrato: 48, gordura: 9, fibra: 8, porcoes: 1, alergenicos: ['peixe'], dietas: [],
    ingredientes: [['Filé de tilápia', 160, 'g'], ['Batata inglesa', 180, 'g'], ['Brócolis', 120, 'g'], ['Azeite de oliva', 5, 'ml'], ['Limão', 15, 'g'], ['Alho', 3, 'g']],
  },
  {
    titulo: 'Omelete de espinafre e tomate com pão integral', categoria: 'café da manhã', tempo: 15,
    descricao: 'Ovos com vegetais, servidos com pão integral. Valores nutricionais estimados por porção.',
    modo: '1. Bata os ovos com pimenta e uma pitada de sal. 2. Refogue o tomate e o espinafre em uma frigideira antiaderente com um fio de azeite. 3. Despeje os ovos e cozinhe em fogo baixo até firmar; dobre a omelete. 4. Sirva com uma fatia de pão integral.',
    calorias: 350, proteina: 24, carboidrato: 31, gordura: 14, fibra: 6, porcoes: 1, alergenicos: ['ovo', 'glúten'], dietas: ['vegetariana'],
    ingredientes: [['Ovo', 100, 'g'], ['Espinafre', 40, 'g'], ['Tomate', 80, 'g'], ['Pão integral', 40, 'g'], ['Azeite de oliva', 3, 'ml']],
  },
  {
    titulo: 'Grão-de-bico com legumes e molho de tahine', categoria: 'jantar', tempo: 25,
    descricao: 'Prato vegetal com grão-de-bico, legumes assados e molho de tahine e limão. Valores nutricionais estimados por porção.',
    modo: '1. Aqueça o forno a 210 °C. 2. Corte a cenoura e a abobrinha, misture com o grão-de-bico, azeite, cominho e páprica; asse por 18 a 20 minutos, mexendo uma vez. 3. Misture o tahine com o limão e água aos poucos até formar um molho. 4. Sirva os legumes e o grão-de-bico com o molho por cima.',
    calorias: 435, proteina: 17, carboidrato: 58, gordura: 16, fibra: 15, porcoes: 1, alergenicos: ['gergelim'], dietas: ['vegetariana', 'vegana'],
    ingredientes: [['Grão-de-bico cozido', 160, 'g'], ['Cenoura', 80, 'g'], ['Abobrinha', 100, 'g'], ['Tahine', 15, 'g'], ['Azeite de oliva', 5, 'ml'], ['Limão', 15, 'g'], ['Cominho em pó', 1, 'g']],
  },
];

const nutrientesPor100g = {
  'Aveia em flocos': ['cereal', 389, 16.9, 66.3, 6.9, 10.6], 'Iogurte natural': ['laticínio', 61, 3.5, 4.7, 3.3, 0],
  'Semente de chia': ['semente', 486, 16.5, 42.1, 30.7, 34.4], Morango: ['fruta', 32, 0.7, 7.7, 0.3, 2], Banana: ['fruta', 89, 1.1, 22.8, 0.3, 2.6],
  'Arroz integral cru': ['cereal', 370, 7.5, 77.2, 2.7, 3.5], 'Feijão carioca cozido': ['leguminosa', 76, 4.8, 13.6, 0.5, 8.5],
  'Peito de frango': ['proteína', 120, 22.5, 0, 2.6, 0], 'Abóbora cabotiá': ['legume', 48, 1.4, 10.8, 0.7, 2.5], 'Azeite de oliva': ['óleo', 884, 0, 0, 100, 0],
  Alho: ['tempero', 149, 6.4, 33.1, 0.5, 2.1], Limão: ['fruta', 29, 1.1, 9.3, 0.3, 2.8], 'Lentilha cozida': ['leguminosa', 116, 9, 20.1, 0.4, 7.9],
  Tomate: ['hortaliça', 18, 0.9, 3.9, 0.2, 1.2], Pepino: ['hortaliça', 15, 0.7, 3.6, 0.1, 0.5], 'Cebola roxa': ['hortaliça', 40, 1.1, 9.3, 0.1, 1.7], Salsinha: ['tempero', 36, 3, 6.3, 0.8, 3.3],
  'Filé de tilápia': ['proteína', 96, 20.1, 0, 1.7, 0], 'Batata inglesa': ['tubérculo', 77, 2, 17.5, 0.1, 2.2], Brócolis: ['hortaliça', 34, 2.8, 6.6, 0.4, 2.6],
  Ovo: ['proteína', 143, 12.6, 0.7, 9.5, 0], Espinafre: ['hortaliça', 23, 2.9, 3.6, 0.4, 2.2], 'Pão integral': ['cereal', 247, 13, 41, 4.2, 7],
  'Grão-de-bico cozido': ['leguminosa', 164, 8.9, 27.4, 2.6, 7.6], Cenoura: ['hortaliça', 41, 0.9, 9.6, 0.2, 2.8], Abobrinha: ['hortaliça', 17, 1.2, 3.1, 0.3, 1],
  Tahine: ['semente', 595, 17, 21, 54, 9.3], 'Cominho em pó': ['tempero', 375, 17.8, 44.2, 22.3, 10.5],
};

async function semearReceitasIniciais() {
  let autor = await buscar('SELECT id FROM usuarios WHERE email = ?', ['curadoria@aptus.internal']);
  if (!autor) {
    const senhaAleatoria = crypto.randomBytes(48).toString('hex');
    const hash = await criarHash(senhaAleatoria);
    const insercao = await executar(`INSERT INTO usuarios (nome_completo, email, senha, role, verificado, bio)
      VALUES (?, ?, ?, 'nutricionista', 1, ?)`, ['Equipe Aptus', 'curadoria@aptus.internal', hash, 'Curadoria de receitas caseiras; informações nutricionais estimadas por porção.']);
    autor = { id: insercao.id };
  }

  let criadas = 0;
  for (const receita of receitas) {
    let existente = await buscar('SELECT id FROM receitas WHERE titulo = ? AND criado_por = ?', [receita.titulo, autor.id]);
    if (!existente) {
      const resultado = await executar(`INSERT INTO receitas
        (titulo, descricao, modo_preparo, criado_por, calorias, proteina, carboidrato, gordura, fibra, tempo_preparo, porcoes, categoria, alergenicos, dietas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [receita.titulo, receita.descricao, receita.modo, autor.id, receita.calorias, receita.proteina, receita.carboidrato, receita.gordura, receita.fibra, receita.tempo, receita.porcoes, receita.categoria, JSON.stringify(receita.alergenicos), JSON.stringify(receita.dietas)]);
      existente = { id: resultado.id };
      criadas += 1;
    }

    for (const [nome, quantidade, unidade] of receita.ingredientes) {
      const valores = nutrientesPor100g[nome];
      await executar(`INSERT OR IGNORE INTO ingredientes
        (nome, tipo_alimento, categoria, calorias_por_100g, proteina_por_100g, carboidrato_por_100g, gordura_por_100g, fibra_por_100g)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [nome, valores[0], valores[0], ...valores.slice(1)]);
      const ingrediente = await buscar('SELECT id FROM ingredientes WHERE nome = ?', [nome]);
      const vinculo = await buscar('SELECT id FROM receitas_ingredientes WHERE receita_id = ? AND ingrediente_id = ?', [existente.id, ingrediente.id]);
      if (!vinculo) await executar('INSERT INTO receitas_ingredientes (receita_id, ingrediente_id, quantidade, unidade_medida) VALUES (?, ?, ?, ?)', [existente.id, ingrediente.id, quantidade, unidade]);
    }
  }

  return criadas;
}

module.exports = { semearReceitasIniciais };
