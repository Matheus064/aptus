const banco = require('../config/conexaoBanco')
const { validarPlano, validarRefeicao } = require('../utilitarios/validadores')

function criarPlano(req, res) {
  const { valido, erros, dados } = validarPlano(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const inserir = banco.prepare('INSERT INTO planos_alimentares (usuario_id, titulo, descricao, calorias_total, data_inicio, data_fim) VALUES (?, ?, ?, ?, ?, ?)')
  const resultado = inserir.run(req.usuario.id, dados.titulo, dados.descricao, dados.calorias_total, dados.data_inicio, dados.data_fim)

  res.status(201).json({
    sucesso: true,
    mensagem: 'Plano alimentar criado com sucesso!',
    dados: { id: resultado.lastInsertRowid, ...dados }
  })
}

function listarPlanos(req, res) {
  const planos = banco.prepare('SELECT * FROM planos_alimentares WHERE usuario_id = ? ORDER BY data_criacao DESC').all(req.usuario.id)
  res.json({ sucesso: true, dados: planos })
}

function obterPlano(req, res) {
  const plano = banco.prepare('SELECT * FROM planos_alimentares WHERE id = ? AND usuario_id = ?').get(req.params.id, req.usuario.id)
  if (!plano) return res.status(404).json({ sucesso: false, mensagem: 'Plano nao encontrado.' })

  const refeicoes = banco.prepare('SELECT * FROM refeicoes WHERE plano_id = ? ORDER BY horario ASC').all(req.params.id)
  res.json({ sucesso: true, dados: { ...plano, refeicoes } })
}

function atualizarPlano(req, res) {
  const plano = banco.prepare('SELECT * FROM planos_alimentares WHERE id = ? AND usuario_id = ?').get(req.params.id, req.usuario.id)
  if (!plano) return res.status(404).json({ sucesso: false, mensagem: 'Plano nao encontrado.' })

  const { valido, erros, dados } = validarPlano({ ...plano, ...req.body })
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const atualizar = banco.prepare('UPDATE planos_alimentares SET titulo = ?, descricao = ?, calorias_total = ?, data_inicio = ?, data_fim = ? WHERE id = ?')
  atualizar.run(dados.titulo, dados.descricao, dados.calorias_total, dados.data_inicio, dados.data_fim, req.params.id)

  res.json({ sucesso: true, mensagem: 'Plano atualizado com sucesso!' })
}

function deletarPlano(req, res) {
  const plano = banco.prepare('SELECT * FROM planos_alimentares WHERE id = ? AND usuario_id = ?').get(req.params.id, req.usuario.id)
  if (!plano) return res.status(404).json({ sucesso: false, mensagem: 'Plano nao encontrado.' })

  banco.prepare('DELETE FROM planos_alimentares WHERE id = ?').run(req.params.id)
  res.json({ sucesso: true, mensagem: 'Plano removido com sucesso!' })
}

function adicionarRefeicao(req, res) {
  const plano = banco.prepare('SELECT * FROM planos_alimentares WHERE id = ? AND usuario_id = ?').get(req.params.id, req.usuario.id)
  if (!plano) return res.status(404).json({ sucesso: false, mensagem: 'Plano nao encontrado.' })

  const { valido, erros, dados } = validarRefeicao(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const inserir = banco.prepare('INSERT INTO refeicoes (plano_id, nome, horario, calorias, alimentos) VALUES (?, ?, ?, ?, ?)')
  const resultado = inserir.run(req.params.id, dados.nome, dados.horario, dados.calorias, dados.alimentos)

  res.status(201).json({
    sucesso: true,
    mensagem: 'Refeicao adicionada com sucesso!',
    dados: { id: resultado.lastInsertRowid, ...dados }
  })
}

module.exports = { criarPlano, listarPlanos, obterPlano, atualizarPlano, deletarPlano, adicionarRefeicao }
