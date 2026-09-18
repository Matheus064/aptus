const router = require('express').Router();
const auth = require('../middleware/autenticacao');
const ctrl = require('../controladores/socialCtrl');

router.get('/', auth, ctrl.listarPosts);
router.post('/', auth, ctrl.criar);
router.post('/:id/curtir', auth, ctrl.curtir);
router.delete('/:id/curtir', auth, ctrl.curtir);
router.post('/:id/comentarios', auth, ctrl.comentar);
router.get('/:id/comentarios', auth, ctrl.listarComentarios);
router.delete('/:id', auth, ctrl.remover);

module.exports = router;