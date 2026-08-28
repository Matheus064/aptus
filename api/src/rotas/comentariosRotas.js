const router = require('express').Router();
const auth = require('../middleware/autenticacao');
const ctrl = require('../controladores/comentariosCtrl');
router.delete('/:id', auth, ctrl.removerComentario);
module.exports = router;
