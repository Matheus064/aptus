const { Router } = require('express')
const { obterPontuacao, listarMedalhas, listarRanking } = require('../controladores/pontosControlador')
const { autenticar } = require('../middlewares/autenticacao')

const rotas = Router()

rotas.get('/pontos', autenticar, obterPontuacao)
rotas.get('/medalhas', autenticar, listarMedalhas)
rotas.get('/ranking', autenticar, listarRanking)

module.exports = rotas
