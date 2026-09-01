const { Router } = require('express')
const { cadastrar, login, obterPerfil, atualizarPerfil, verificarNutricionista } = require('../controladores/usuarioControlador')
const { autenticar } = require('../middlewares/autenticacao')

const rotas = Router()

rotas.post('/usuarios/cadastro', cadastrar)
rotas.post('/usuarios/login', login)
rotas.get('/usuarios/perfil', autenticar, obterPerfil)
rotas.put('/usuarios/perfil', autenticar, atualizarPerfil)
rotas.post('/usuarios/verificar-nutricionista', autenticar, verificarNutricionista)

module.exports = rotas
