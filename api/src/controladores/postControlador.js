const banco = require('../config/conexaoBanco')
const { validarPost } = require('../utilitarios/validadores')
const { atribuirPontos } = require('./pontosControlador')

function criarPost(req, res) {
  const { valido, erros, dados } = validarPost(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const inserir = banco.prepare('INSERT INTO posts (usuario_id, conteudo, tipo) VALUES (?, ?, ?)')
  const resultado = inserir.run(req.usuario.id, dados.conteudo, dados.tipo)

  atribuirPontos(req.usuario.id, 20, 'post_criado')

  res.status(201).json({
    sucesso: true,
    mensagem: 'Publicacao criada com sucesso!',
    dados: { id: resultado.lastInsertRowid, ...dados }
  })
}

function listarPosts(req, res) {
  const pagina = parseInt(req.query.pagina) || 1
  const limite = parseInt(req.query.limite) || 20
  const offset = (pagina - 1) * limite

  const total = banco.prepare('SELECT COUNT(*) AS total FROM posts').get()
  const posts = banco.prepare(`
    SELECT p.*, u.nome_completo AS autor_nome
    FROM posts p
    JOIN usuarios u ON p.usuario_id = u.id
    ORDER BY p.data_criacao DESC
    LIMIT ? OFFSET ?
  `).all(limite, offset)

  const postsComComentarios = posts.map(post => {
    const totalComentarios = banco.prepare('SELECT COUNT(*) AS total FROM comentarios WHERE post_id = ?').get(post.id)
    return { ...post, total_comentarios: totalComentarios.total }
  })

  res.json({ sucesso: true, dados: postsComComentarios, total: total.total, pagina, limite })
}

function obterPost(req, res) {
  const post = banco.prepare(`
    SELECT p.*, u.nome_completo AS autor_nome
    FROM posts p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.id = ?
  `).get(req.params.id)

  if (!post) return res.status(404).json({ sucesso: false, mensagem: 'Publicacao nao encontrada.' })

  const comentarios = banco.prepare(`
    SELECT c.*, u.nome_completo AS autor_nome
    FROM comentarios c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.data_criacao ASC
  `).all(req.params.id)

  res.json({ sucesso: true, dados: { ...post, comentarios } })
}

function deletarPost(req, res) {
  const post = banco.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ sucesso: false, mensagem: 'Publicacao nao encontrada.' })
  if (post.usuario_id !== req.usuario.id) return res.status(403).json({ sucesso: false, mensagem: 'Sem permissao para remover esta publicacao.' })

  banco.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id)
  res.json({ sucesso: true, mensagem: 'Publicacao removida com sucesso!' })
}

module.exports = { criarPost, listarPosts, obterPost, deletarPost }
