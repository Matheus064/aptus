const banco = require('../config/conexaoBanco')

function listarExercicios(req, res) {
  const { dificuldade, musculo } = req.query
  let query = 'SELECT e.*, u.nome_completo AS criado_por_nome FROM exercicios e JOIN usuarios u ON e.criado_por = u.id WHERE e.ativo = 1'
  const params = []

  if (dificuldade) {
    query += ' AND e.dificuldade = ?'
    params.push(dificuldade)
  }
  if (musculo) {
    query += ' AND e.musculos_trabalhados LIKE ?'
    params.push(`%${musculo}%`)
  }

  const exercicios = banco.prepare(query).all(...params)
  res.json({ sucesso: true, dados: exercicios })
}

function obterExercicio(req, res) {
  const { id } = req.params
  const exercicio = banco.prepare('SELECT e.*, u.nome_completo AS criado_por_nome FROM exercicios e JOIN usuarios u ON e.criado_por = u.id WHERE e.id = ?').get(id)
  if (!exercicio) return res.status(404).json({ sucesso: false, mensagem: 'Exercício não encontrado.' })

  res.json({ sucesso: true, dados: exercicio })
}

function criarExercicio(req, res) {
  const { nome, descricao, tecnica, musculos_trabalhados, dificuldade, series_recomendadas, repeticoes_recomendadas, descanso_segundos, variacoes, contraindicacoes } = req.body

  if (!nome || !descricao || !tecnica) {
    return res.status(422).json({ sucesso: false, mensagem: 'Campos obrigatórios faltando.' })
  }

  const criado_por = req.usuario.id

  const inserir = banco.prepare(`
    INSERT INTO exercicios (nome, descricao, tecnica, criado_por, video_url, musculos_trabalhados, dificuldade, series_recomendadas, repeticoes_recomendadas, descanso_segundos, variacoes, contraindicacoes, praticas, curtidas, ativo, data_criacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1, datetime('now','localtime'))
  `)
  const resultado = inserir.run(nome, descricao, tecnica, criado_por, req.body.video_url || null, musculos_trabalhados || null, dificuldade || null, series_recomendadas || null, repeticoes_recomendadas || null, descanso_segundos || null, variacoes || null, contraindicacoes || null)

  res.status(201).json({
    sucesso: true,
    mensagem: 'Exercício criado com sucesso!',
    dados: { id: resultado.lastInsertRowid, criado_por }
  })
}

function atualizarExercicio(req, res) {
  const { id } = req.params

  const exercicioExistente = banco.prepare('SELECT * FROM exercicios WHERE id = ?').get(id)
  if (!exercicioExistente) return res.status(404).json({ sucesso: false, mensagem: 'Exercício não encontrado.' })

  if (exercicioExistente.criado_por !== req.usuario.id && req.usuario.role !== 'admin') {
    return res.status(403).json({ sucesso: false, mensagem: 'Não tem permissão para editar este exercício.' })
  }

  const { nome, descricao, tecnica, musculos_trabalhados, dificuldade, series_recomendadas, repeticoes_recomendadas, descanso_segundos, variacoes, contraindicacoes } = req.body

  const atualizar = banco.prepare(`
    UPDATE exercicios SET nome = ?, descricao = ?, tecnica = ?, musculos_trabalhados = ?, dificuldade = ?, series_recomendadas = ?, repeticoes_recomendadas = ?, descanso_segundos = ?, variacoes = ?, contraindicacoes = ? WHERE id = ?
  `)
  atualizar.run(nome, descricao, tecnica, musculos_trabalhados, dificuldade, series_recomendadas, repeticoes_recomendadas, descanso_segundos, variacoes, contraindicacoes, id)

  res.json({ sucesso: true, mensagem: 'Exercício atualizado com sucesso!' })
}

function deletarExercicio(req, res) {
  const { id } = req.params

  const exercicioExistente = banco.prepare('SELECT * FROM exercicios WHERE id = ?').get(id)
  if (!exercicioExistente) return res.status(404).json({ sucesso: false, mensagem: 'Exercício não encontrado.' })

  if (exercicioExistente.criado_por !== req.usuario.id && req.usuario.role !== 'admin') {
    return res.status(403).json({ sucesso: false, mensagem: 'Não tem permissão para deletar este exercício.' })
  }

  const deletar = banco.prepare('UPDATE exercicios SET ativo = 0 WHERE id = ?')
  deletar.run(id)

  res.json({ sucesso: true, mensagem: 'Exercício deletado com sucesso!' })
}

function curtirExercicio(req, res) {
  const { id } = req.params
  const exercicio = banco.prepare('SELECT * FROM exercicios WHERE id = ?').get(id)
  if (!exercicio) return res.status(404).json({ sucesso: false, mensagem: 'Exercício não encontrado.' })

  const atualizar = banco.prepare('UPDATE exercicios SET curtidas = curtidas + 1 WHERE id = ?')
  atualizar.run(id)

  res.json({ sucesso: true, mensagem: 'Exercício curtido!', dados: { curtidas: exercicio.curtidas + 1 } })
}

module.exports = { listarExercicios, obterExercicio, criarExercicio, atualizarExercicio, deletarExercicio, curtirExercicio }