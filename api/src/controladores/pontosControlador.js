const banco = require('../config/conexaoBanco')

const MEDALHAS_PREDEFINIDAS = [
  { nome: 'Primeiro Passo', descricao: 'Criou seu perfil com sucesso', icone: '👣', pontos_necessarios: 10 },
  { nome: 'Eco da Comunidade', descricao: 'Criou seu primeiro post', icone: '💬', pontos_necessarios: 20 },
  { nome: 'Dica Solidaria', descricao: 'Compartilhou uma dica na rede', icone: '💡', pontos_necessarios: 30 },
  { nome: 'Conversador', descricao: 'Enviou 10 mensagens no chat', icone: '💌', pontos_necessarios: 50 },
  { nome: 'Criador de Grupo', descricao: 'Criou um grupo de apoio', icone: '👥', pontos_necessarios: 100 },
  { nome: 'Plano Perfeito', descricao: 'Criou seu primeiro plano alimentar', icone: '📋', pontos_necessarios: 40 },
  { nome: 'Meta Batida', descricao: 'Atingiu seu objetivo de emagrecimento', icone: '🏆', pontos_necessarios: 300 },
  { nome: 'Especialista', descricao: 'Acabou sua jornada com 500 pontos', icone: '⭐', pontos_necessarios: 500 }
]

function inicializarMedalhas() {
  const inserir = banco.prepare('INSERT OR IGNORE INTO medalhas (nome, descricao, icone, pontos_necessarios) VALUES (?, ?, ?, ?)')
  const insertSync = banco.prepare('INSERT OR IGNORE INTO medalhas (nome, descricao, icone, pontos_necessarios) VALUES (?, ?, ?, ?)')

  for (const medalha of MEDALHAS_PREDEFINIDAS) {
    const existente = banco.prepare('SELECT id FROM medalhas WHERE nome = ?').get(medalha.nome)
    if (!existente) {
      insertSync.run(medalha.nome, medalha.descricao, medalha.icone, medalha.pontos_necessarios)
    }
  }
}

inicializarMedalhas()

function obterPontuacao(req, res) {
  const pontuacaoTotal = banco.prepare(
    'SELECT COALESCE(SUM(quantidade), 0) AS total FROM pontos WHERE usuario_id = ?'
  ).get(req.usuario.id)

  const historico = banco.prepare(`
    SELECT id, quantidade, origem, data_atribuicao
    FROM pontos
    WHERE usuario_id = ?
    ORDER BY data_atribuicao DESC
    LIMIT 50
  `).all(req.usuario.id)

  const medalhas = banco.prepare(`
    SELECT m.id, m.nome, m.descricao, m.icone, m.pontos_necessarios, mu.data_conquista
    FROM medalhas_usuario mu
    JOIN medalhas m ON mu.medalha_id = m.id
    WHERE mu.usuario_id = ?
    ORDER BY mu.data_conquista DESC
  `).all(req.usuario.id)

  const todasMedalhas = banco.prepare(
    'SELECT id, nome, descricao, icone, pontos_necessarios FROM medalhas ORDER BY pontos_necessarios ASC'
  ).all()

  const medalhasComProgresso = todasMedalhas.map(medalha => {
    const conquistada = medalhas.find(m => m.id === medalha.id)
    const progresso = conquistada ? 100 : Math.min(100, Math.round((pontuacaoTotal.total / medalha.pontos_necessarios) * 100))
    return {
      ...medalha,
      conquistada: !!conquistada,
      progresso,
      data_conquista: conquistada ? conquistada.data_conquista : null
    }
  })

  res.json({
    sucesso: true,
    dados: {
      pontuacao_total: pontuacaoTotal.total,
      historico,
      medalhas: medalhasComProgresso
    }
  })
}

function atribuirPontos(usuarioId, quantidade, origem) {
  const inserir = banco.prepare('INSERT INTO pontos (usuario_id, quantidade, origem) VALUES (?, ?, ?)')
  inserir.run(usuarioId, quantidade, origem)

  const pontuacao = banco.prepare(
    'SELECT COALESCE(SUM(quantidade), 0) AS total FROM pontos WHERE usuario_id = ?'
  ).get(usuarioId)

  const medalhas = banco.prepare('SELECT id FROM medalhas WHERE pontos_necessarios <= ?').all(pontuacao.total)
  const medalhasConquistadas = banco.prepare(
    'SELECT medalha_id FROM medalhas_usuario WHERE usuario_id = ?'
  ).all(usuarioId)

  const novasMedalhas = []

  for (const medalha of medalhas) {
    const jaConquistada = medalhasConquistadas.some(m => m.medalha_id === medalha.id)
    if (!jaConquistada) {
      banco.prepare('INSERT INTO medalhas_usuario (usuario_id, medalha_id) VALUES (?, ?)').run(usuarioId, medalha.id)
      const medalhaInfo = banco.prepare('SELECT nome FROM medalhas WHERE id = ?').get(medalha.id)
      novasMedalhas.push(medalhaInfo.nome)
    }
  }

  return { pontuacao: pontuacao.total, novasMedalhas }
}

function listarMedalhas(req, res) {
  const todasMedalhas = banco.prepare(
    'SELECT id, nome, descricao, icone, pontos_necessarios FROM medalhas ORDER BY pontos_necessarios ASC'
  ).all()

  const pontuacao = banco.prepare(
    'SELECT COALESCE(SUM(quantidade), 0) AS total FROM pontos WHERE usuario_id = ?'
  ).get(req.usuario.id)

  const medalhasConquistadas = banco.prepare(`
    SELECT m.id, m.nome, m.descricao, m.icone, m.pontos_necessarios, mu.data_conquista
    FROM medalhas_usuario mu
    JOIN medalhas m ON mu.medalha_id = m.id
    WHERE mu.usuario_id = ?
    ORDER BY mu.data_conquista DESC
  `).all(req.usuario.id)

  const medalhasFormatadas = todasMedalhas.map(medalha => {
    const conquistada = medalhasConquistadas.find(m => m.id === medalha.id)
    const progresso = conquistada ? 100 : Math.min(100, Math.round((pontuacao.total / medalha.pontos_necessarios) * 100))
    return {
      ...medalha,
      conquistada: !!conquistada,
      progresso,
      data_conquista: conquistada ? conquistada.data_conquista : null
    }
  })

  res.json({
    sucesso: true,
    dados: {
      pontuacao_total: pontuacao.total,
      medalhas: medalhasFormatadas
    }
  })
}

function listarRanking(req, res) {
  const ranking = banco.prepare(`
    SELECT u.id, u.nome_completo,
      (SELECT COALESCE(SUM(p.quantidade), 0) FROM pontos p WHERE p.usuario_id = u.id) AS pontuacao,
      (SELECT COUNT(*) FROM medalhas_usuario mu WHERE mu.usuario_id = u.id) AS total_medalhas
    FROM usuarios u
    WHERE (SELECT COALESCE(SUM(p.quantidade), 0) FROM pontos p WHERE p.usuario_id = u.id) > 0
    ORDER BY pontuacao DESC
    LIMIT 20
  `).all()

  res.json({ sucesso: true, dados: ranking })
}

module.exports = { obterPontuacao, atribuirPontos, listarMedalhas, listarRanking }
