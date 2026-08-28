const router = require('express').Router(); const auth = require('../middleware/autenticacao'); const autorizacao = require('../middleware/autorizacao'); const ctrl = require('../controladores/usuariosCtrl'); const feed = require('../controladores/feedCtrl');
const comunidade = require('../controladores/comunidadeCtrl');
router.get('/me', auth, ctrl.me); router.put('/me', auth, ctrl.atualizarMe); router.put('/me/saude', auth, autorizacao('user'), ctrl.atualizarMe);
router.post('/me/peso', auth, autorizacao('user'), comunidade.registrarPeso); router.get('/me/peso', auth, comunidade.historicoPeso);
router.get('/receitas-salvas', auth, (req,res,next)=>feed.salvos({ ...req, params:{ tipo:'receitas' } },res,next)); router.get('/exercicios-salvos', auth, (req,res,next)=>feed.salvos({ ...req, params:{ tipo:'exercicios' } },res,next));
router.post('/:id/seguir', auth, comunidade.seguirUsuario); router.post('/:id/bloquear', auth, comunidade.bloquear); module.exports = router;
