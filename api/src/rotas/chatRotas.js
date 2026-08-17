const { Router } = require('express')
const {
  listarConversas,
  obterConversa,
  enviarMensagem,
  criarGrupo,
  listarGrupos,
  obterGrupo,
  enviarMensagemGrupo,
  entrarGrupo,
  listarGruposDisponiveis,
  buscarUsuarios
} = require('../controladores/chatControlador')
const { autenticar } = require('../middlewares/autenticacao')

const rotas = Router()

rotas.get('/chat/conversas', autenticar, listarConversas)
rotas.get('/chat/usuarios', autenticar, buscarUsuarios)
rotas.get('/chat/conversas/:id', autenticar, obterConversa)
rotas.post('/chat/conversas/:id/mensagens', autenticar, enviarMensagem)
rotas.get('/chat/grupos', autenticar, listarGrupos)
rotas.get('/chat/grupos/disponiveis', autenticar, listarGruposDisponiveis)
rotas.post('/chat/grupos', autenticar, criarGrupo)
rotas.get('/chat/grupos/:id', autenticar, obterGrupo)
rotas.post('/chat/grupos/:id/mensagens', autenticar, enviarMensagemGrupo)
rotas.post('/chat/grupos/:id/entrar', autenticar, entrarGrupo)

module.exports = rotas
