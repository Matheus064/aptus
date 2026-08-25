const { Router } = require('express')
const { dashboardAdmin, metricasUsuarios, metricasEngajamento, metricasSaude, trending, reportesModeracao } = require('../controladores/analiticsControlador')
const { autenticar } = require('../middlewares/autenticacao')
const { autorizacao } = require('../middlewares/autenticacao')

const rotas = Router()

// Dashboard administrativo completo - APENAS ADMIN
rotas.get('/admin/dashboard', [autenticar, autorizacao('admin')], dashboardAdmin)

// Métricas de usuários por período
rotas.get('/admin/metricas/usuarios', [autenticar, autorizacao('admin')], metricasUsuarios)

// Métricas de engajamento
rotas.get('/admin/metricas/engajamento', [autenticar, autorizacao('admin')], metricasEngajamento)

// Métricas de saúde agregadas
rotas.get('/admin/metricas/saude', [autenticar, autorizacao('admin')], metricasSaude)

// Conteúdo trending (receitas, exercícios, nutricionistas)
rotas.get('/admin/trending', [autenticar, autorizacao('admin')], trending)

// Reportes de moderação pendentes
rotas.get('/admin/moderacao/reportes', [autenticar, autorizacao('admin')], reportesModeracao)

module.exports = rotas