const router=require('express').Router();const auth=require('../middleware/autenticacao');const ctrl=require('../controladores/feedCtrl');
router.get('/',auth,ctrl.obter);router.get('/infinito',auth,ctrl.obter);router.get('/trending',auth,ctrl.trending);module.exports=router;
