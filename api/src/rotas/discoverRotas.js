const router=require('express').Router();const ctrl=require('../controladores/discoverCtrl');
router.get('/',ctrl.discover);router.get('/categorias',ctrl.categorias);router.get('/musculos',ctrl.musculos);router.get('/dificuldade',ctrl.dificuldade);module.exports=router;
