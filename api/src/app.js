const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const rotasUsuarios = require('./rotas/usuarioRotas')
const rotasPosts = require('./rotas/postRotas')
const rotasPlanos = require('./rotas/planoRotas')
const rotasComentarios = require('./rotas/comentarioRotas')

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.ORIGEM_PERMITIDA || '*' }))
app.use(express.json({ limit: '10kb' }))

const caminhoFrontend = path.resolve(__dirname, '../../frontend')
app.use(express.static(caminhoFrontend))

app.use('/api', rotasUsuarios)
app.use('/api', rotasPosts)
app.use('/api', rotasPlanos)
app.use('/api', rotasComentarios)

app.get('/api/health', (_, res) => res.json({ sucesso: true, mensagem: 'API funcionando!' }))

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(caminhoFrontend, 'index.html'))
})

module.exports = app
