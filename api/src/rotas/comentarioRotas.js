const { Router } = require('express')
const { criarComentario, listarComentarios } = require('../controladores/comentarioControlador')
const { autenticar } = require('../middlewares/autenticacao')

const rotas = Router()

rotas.post('/posts/:postId/comentarios', autenticar, criarComentario)
rotas.get('/posts/:postId/comentarios', autenticar, listarComentarios)

module.exports = rotas
