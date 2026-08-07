const banco = require('../config/conexaoBanco')
const { validarComentario } = require('../utilitarios/validadores')

function criarComentario(req, res) {
  const { valido, erros, dados } = validarComentario(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const post = banco.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.postId)
  if (!post) return res.status(404).json({ sucesso: false, mensagem: 'Publicacao nao encontrada.' })

  const inserir = banco.prepare('INSERT INTO comentarios (post_id, usuario_id, conteudo) VALUES (?, ?, ?)')
  const resultado = inserir.run(req.params.postId, req.usuario.id, dados.conteudo)

  res.status(201).json({
    sucesso: true,
    mensagem: 'Comentario adicionado com sucesso!',
    dados: { id: resultado.lastInsertRowid, ...dados }
  })
}

function listarComentarios(req, res) {
  const post = banco.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.postId)
  if (!post) return res.status(404).json({ sucesso: false, mensagem: 'Publicacao nao encontrada.' })

  const comentarios = banco.prepare(`
    SELECT c.*, u.nome_completo AS autor_nome
    FROM comentarios c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.data_criacao ASC
  `).all(req.params.postId)

  res.json({ sucesso: true, dados: comentarios })
}

module.exports = { criarComentario, listarComentarios }
