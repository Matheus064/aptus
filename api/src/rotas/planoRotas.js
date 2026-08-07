const { Router } = require('express')
const { criarPlano, listarPlanos, obterPlano, atualizarPlano, deletarPlano, adicionarRefeicao } = require('../controladores/planoControlador')
const { autenticar } = require('../middlewares/autenticacao')

const rotas = Router()

rotas.post('/planos', autenticar, criarPlano)
rotas.get('/planos', autenticar, listarPlanos)
rotas.get('/planos/:id', autenticar, obterPlano)
rotas.put('/planos/:id', autenticar, atualizarPlano)
rotas.delete('/planos/:id', autenticar, deletarPlano)
rotas.post('/planos/:id/refeicoes', autenticar, adicionarRefeicao)

module.exports = rotas
