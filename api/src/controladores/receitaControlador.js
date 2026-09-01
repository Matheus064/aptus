const banco = require('../config/conexaoBanco')

function listarReceitas(req, res) {
  const { dificuldade, categoria, dieta } = req.query
  let query = 'SELECT r.*, u.nome_completo AS criado_por_nome FROM receitas r JOIN usuarios u ON r.criado_por = u.id WHERE r.ativo = 1'
  const params = []

  if (dificuldade) {
    query += ' AND r.dificuldade = ?'
    params.push(dificuldade)
  }
  if (categoria) {
    query += ' AND r.categoria = ?'
    params.push(categoria)
  }
  if (dieta) {
    query += ' AND r.dietas LIKE ?'
    params.push(`%${dieta}%`)
  }

  const receitas = banco.prepare(query).all(...params)
  res.json({ sucesso: true, dados: receitas })
}

function obterReceita(req, res) {
  const { id } = req.params
  const receita = banco.prepare('SELECT r.*, u.nome_completo AS criado_por_nome FROM receitas r JOIN usuarios u ON r.criado_por = u.id WHERE r.id = ?').get(id)
  if (!receita) return res.status(404).json({ sucesso: false, mensagem: 'Receita não encontrada.' })

  res.json({ sucesso: true, dados: receita })
}

function criarReceita(req, res) {
  const { titulo, descricao, modo_preparo, foto_url, calorias, proteina, carboidrato, gordura, fibra, tempo_preparo, porcoes, dificuldade, categoria, alergênicos, dietas } = req.body

  if (!titulo || !descricao || !modo_preparo || !foto_url) {
    return res.status(422).json({ sucesso: false, mensagem: 'Campos obrigatórios faltando.' })
  }

  const criado_por = req.usuario.id

  const inserir = banco.prepare(`
    INSERT INTO receitas (titulo, descricao, modo_preparo, criado_por, foto_url, calorias, proteina, carboidrato, gordura, fibra, tempo_preparo, porcoes, dificuldade, categoria, alergênicos, dietas, curtidas, comentarios, compartilhamentos, ativo, data_criacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now','localtime'))
  `)
  const resultado = inserir.run(titulo, descricao, modo_preparo, criado_por, foto_url, calorias || null, proteina || null, carboidrato || null, gordura || null, fibra || null, tempo_preparo || null, porcoes || null, dificuldade || null, alergênicos || null, dietas || null)

  res.status(201).json({
    sucesso: true,
    mensagem: 'Receita criada com sucesso!',
    dados: { id: resultado.lastInsertRowid, criado_por }
  })
}

function atualizarReceita(req, res) {
  const { id } = req.params

  const receitaExistente = banco.prepare('SELECT * FROM receitas WHERE id = ?').get(id)
  if (!receitaExistente) return res.status(404).json({ sucesso: false, mensagem: 'Receita não encontrada.' })

  if (receitaExistente.criado_por !== req.usuario.id && req.usuario.role !== 'admin') {
    return res.status(403).json({ sucesso: false, mensagem: 'Não tem permissão para editar esta receita.' })
  }

  const { titulo, descricao, modo_preparo, foto_url, calorias, proteina, carboidrato, gordura, fibra, tempo_preparo, porcoes, dificuldade, categoria, alergênicos, dietas } = req.body

  const atualizar = banco.prepare(`
    UPDATE receitas SET titulo = ?, descricao = ?, modo_preparo = ?, foto_url = ?, calorias = ?, proteina = ?, carboidrato = ?, gordura = ?, fibra = ?, tempo_preparo = ?, porcoes = ?, dificuldade = ?, categoria = ?, alergênicos = ?, dietas = ? WHERE id = ?
  `)
  atualizar.run(titulo, descricao, modo_preparo, foto_url, calorias, proteina, carboidrato, gordura, fibra, tempo_preparo, porcoes, dificuldade, categoria, alergênicos, dietas, id)

  res.json({ sucesso: true, mensagem: 'Receita atualizada com sucesso!' })
}

function deletarReceita(req, res) {
  const { id } = req.params

  const receitaExistente = banco.prepare('SELECT * FROM receitas WHERE id = ?').get(id)
  if (!receitaExistente) return res.status(404).json({ sucesso: false, mensagem: 'Receita não encontrada.' })

  if (receitaExistente.criado_por !== req.usuario.id && req.usuario.role !== 'admin') {
    return res.status(403).json({ sucesso: false, mensagem: 'Não tem permissão para deletar esta receita.' })
  }

  const deletar = banco.prepare('UPDATE receitas SET ativo = 0 WHERE id = ?')
  deletar.run(id)

  res.json({ sucesso: true, mensagem: 'Receita deletada com sucesso!' })
}

function curtirReceita(req, res) {
  const { id } = req.params
  const receita = banco.prepare('SELECT * FROM receitas WHERE id = ?').get(id)
  if (!receita) return res.status(404).json({ sucesso: false, mensagem: 'Receita não encontrada.' })

  const atualizar = banco.prepare('UPDATE receitas SET curtidas = curtidas + 1 WHERE id = ?')
  atualizar.run(id)

  res.json({ sucesso: true, mensagem: 'Receita curtida!', dados: { curtidas: receita.curtidas + 1 } })
}

module.exports = { listarReceitas, obterReceita, criarReceita, atualizarReceita, deletarReceita, curtirReceita }