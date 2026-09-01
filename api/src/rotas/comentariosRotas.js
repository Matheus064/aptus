const router = require('express').Router();
const auth = require('../middleware/autenticacao');
const ctrl = require('../controladores/comentariosCtrl');
router.delete('/:id', auth, ctrl.removerComentario);
router.post('/:id/curtir', auth, ctrl.curtirComentario);
module.exports = router;
