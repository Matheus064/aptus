const router = require('express').Router();
const auth = require('../middleware/autenticacao');
const ctrl = require('../controladores/recomendacoesCtrl');

router.get('/recomendacoes', auth, ctrl.recomendacoes);
router.get('/sugestoes-posts', auth, ctrl.sugestoesPosts);

module.exports = router;