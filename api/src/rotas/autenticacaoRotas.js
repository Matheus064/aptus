const express = require('express');
const autenticacao = require('../middleware/autenticacao');
const autorizacao = require('../middleware/autorizacao');
const controlador = require('../controladores/autenticacaoCtrl');

const router = express.Router();
router.post('/registro', controlador.registro);
router.post('/login', controlador.login);
router.post('/logout', autenticacao, controlador.logout);
router.post('/verificar-nutricionista', autenticacao, autorizacao(['nutricionista']), controlador.verificarNutricionista);
router.get('/usuarios/me', autenticacao, controlador.obterPerfil);
router.put('/usuarios/me/saude', autenticacao, autorizacao(['user']), controlador.atualizarSaude);

module.exports = router;
