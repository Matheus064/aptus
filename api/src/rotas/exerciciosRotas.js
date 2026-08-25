const { Router } = require('express')
const { listarExercicios, obterExercicio, criarExercicio, atualizarExercicio, deletarExercicio, curtirExercicio } = require('../controladores/exercicioControlador')
const { autenticar, autorizacao } = require('../middlewares/autenticacao')

const rotas = Router()

// Listar exercícios - qualquer usuário autenticado pode ver
rotas.get('/exercicios', autenticar, listarExercicios)

// Obter exercício específico - qualquer usuário autenticado pode ver
rotas.get('/exercicios/:id', autenticar, obterExercicio)

// Criar exercício - apenas nutricionistas e admins
rotas.post('/exercicios', [autenticar, autorizacao('nutricionista', 'admin')], criarExercicio)

// Atualizar exercício - apenas criador ou admin
rotas.put('/exercicios/:id', autenticar, atualizarExercicio)

// Deletar exercício - apenas criador ou admin
rotas.delete('/exercicios/:id', autenticar, deletarExercicio)

// Curtir exercício - qualquer usuário autenticado
rotas.post('/exercicios/:id/curtir', autenticar, curtirExercicio)

module.exports = rotas