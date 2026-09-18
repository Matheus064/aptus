const router = require('express').Router(); const auth = require('../middleware/autenticacao'); const autorizacao = require('../middleware/autorizacao'); const ctrl = require('../controladores/usuariosCtrl'); const feed = require('../controladores/feedCtrl');
const comunidade = require('../controladores/comunidadeCtrl');
const experiencia = require('../controladores/experienciaCtrl');
router.get('/me', auth, ctrl.me); router.put('/me', auth, ctrl.atualizarMe); router.put('/me/saude', auth, autorizacao('user'), ctrl.atualizarMe); router.get('/:id', auth, ctrl.publico);
router.post('/me/peso', auth, autorizacao('user'), comunidade.registrarPeso); router.get('/me/peso', auth, comunidade.historicoPeso);
router.get('/plano-atual', auth, experiencia.planoAtual); router.put('/planos/:planoId/dia/:dia/refeicao/:refeicao', auth, experiencia.consumirRefeicao); router.get('/lista-compras', auth, experiencia.listaCompras); router.get('/historico-consumo', auth, experiencia.historicoConsumo); router.get('/exercicios/historico/:exercicioId', auth, experiencia.historicoExercicio);
router.get('/receitas-salvas', auth, (req,res,next)=>feed.salvos({ ...req, params:{ tipo:'receitas' } },res,next)); router.get('/exercicios-salvos', auth, (req,res,next)=>feed.salvos({ ...req, params:{ tipo:'exercicios' } },res,next));
router.get('/me/medalhas', auth, feed.medalhas);
router.post('/:id/seguir', auth, comunidade.seguirUsuario); router.post('/:id/bloquear', auth, comunidade.bloquear); module.exports = router;
