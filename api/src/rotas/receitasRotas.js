const { Router } = require('express')
const { listarReceitas, obterReceita, criarReceita, atualizarReceita, deletarReceita, curtirReceita } = require('../controladores/receitaControlador')
const { autenticar, autorizacao } = require('../middlewares/autenticacao')

const rotas = Router()

// Listar receitas - qualquer usuário autenticado pode ver
rotas.get('/receitas', autenticar, listarReceitas)

// Obter receita específica - qualquer usuário autenticado pode ver
rotas.get('/receitas/:id', autenticar, obterReceita)

// Criar receita - apenas nutricionistas e admins
rotas.post('/receitas', [autenticar, autorizacao('nutricionista', 'admin')], criarReceita)

// Atualizar receita - apenas criador ou admin
rotas.put('/receitas/:id', autenticar, atualizarReceita)

// Deletar receita - apenas criador ou admin
rotas.delete('/receitas/:id', autenticar, deletarReceita)

// Curtir receita - qualquer usuário autenticado
rotas.post('/receitas/:id/curtir', autenticar, curtirReceita)

module.exports = rotas