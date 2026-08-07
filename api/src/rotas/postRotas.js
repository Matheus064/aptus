const { Router } = require('express')
const { criarPost, listarPosts, obterPost, deletarPost } = require('../controladores/postControlador')
const { autenticar } = require('../middlewares/autenticacao')

const rotas = Router()

rotas.post('/posts', autenticar, criarPost)
rotas.get('/posts', autenticar, listarPosts)
rotas.get('/posts/:id', autenticar, obterPost)
rotas.delete('/posts/:id', autenticar, deletarPost)

module.exports = rotas
