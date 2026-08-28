const router = require('express').Router();
const ctrl = require('../controladores/authCtrl');
const auth = require('../middleware/autenticacao');
const autorizacao = require('../middleware/autorizacao');

router.post('/registro', ctrl.registro);
router.post('/login', ctrl.login);
router.post('/convidado', ctrl.convidado);
router.post('/logout', auth, (req, res) => res.json({ sucesso: true }));
router.post('/verificar-nutricionista', auth, autorizacao('nutricionista'), ctrl.verificarNutricionista);
module.exports = router;
