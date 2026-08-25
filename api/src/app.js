const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const rotasUsuarios = require('./rotas/usuarioRotas')
const rotasPosts = require('./rotas/postRotas')
const rotasPlanos = require('./rotas/planoRotas')
const rotasComentarios = require('./rotas/comentarioRotas')
const rotasChat = require('./rotas/chatRotas')
const rotasPontos = require('./rotas/pontosRotas')
const rotasReceitas = require('./rotas/receitasRotas')
const rotasExercicios = require('./rotas/exerciciosRotas')
const rotasAnalitics = require('./rotas/analiticsRotas')

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.ORIGEM_PERMITIDA || '*' }))
app.use(express.json({ limit: '10kb' }))

app.use((req, res, next) => {
  req.setTimeout(120000) // 2 minutes timeout
  req.on('timeout', () => {
    res.status(408).json({ sucesso: false, mensagem: 'Request timeout - operation took too long' })
  })
  next()
})

const caminhoFrontend = path.resolve(__dirname, '../../frontend')
app.use(express.static(caminhoFrontend))

app.use('/api', rotasUsuarios)
app.use('/api', rotasPosts)
app.use('/api', rotasPlanos)
app.use('/api', rotasComentarios)
app.use('/api', rotasChat)
app.use('/api', rotasPontos)
app.use('/api', rotasReceitas)
app.use('/api', rotasExercicios)
app.use('/api', rotasAnalitics)

app.get('/api/health', (_, res) => res.json({ sucesso: true, mensagem: 'API funcionando!' }))

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(caminhoFrontend, 'index.html'))
})

app.use((req, res, next) => {
  if (req.timedout) {
    res.status(408).json({ sucesso: false, mensagem: 'Request timeout - operation took too long' })
  } else {
    next()
  }
})

module.exports = app
