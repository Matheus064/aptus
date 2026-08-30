const express = require('express');
const router = express.Router();
const {
  gerarPlanoComIACtrl,
  gerarReceitaComIACtrl,
  obterSuggestoesPlanos,
  calcularNecessidadesNutricionais,
} = require('../controladores/iaCtrl');
const { autenticar } = require('../middleware/autenticacao');

/**
 * POST /api/ia/gerar-plano
 * Gera um novo plano alimentar com IA
 * Requer autenticação
 */
router.post('/gerar-plano', autenticar, gerarPlanoComIACtrl);

/**
 * POST /api/ia/gerar-receita
 * Gera uma receita individual com IA
 * Requer autenticação
 */
router.post('/gerar-receita', autenticar, gerarReceitaComIACtrl);

/**
 * GET /api/ia/sugestoes-planos
 * Obtém sugestões de planos personalizadas
 * Requer autenticação
 */
router.get('/sugestoes-planos', autenticar, obterSuggestoesPlanos);

/**
 * POST /api/ia/calcular-necessidades
 * Calcula necessidades nutricionais baseado no perfil
 * Não requer autenticação (pode ser usado antes de logar)
 */
router.post('/calcular-necessidades', calcularNecessidadesNutricionais);

module.exports = router;
