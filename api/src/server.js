require('dotenv').config();
const app = require('./app');
const { inicializarBanco } = require('./config/conexaoBanco');
const { semearReceitasIniciais } = require('./servicos/receitasIniciais');
const { inicializarAgentes } = require('./servicos/agentesComunidadeService');
const porta = Number(process.env.PORT || 3000);
inicializarBanco().then(semearReceitasIniciais).then(async criadas => { await inicializarAgentes(); return criadas; }).then((criadas) => {
	console.log(`${criadas} receitas nutritivas adicionadas ao catálogo.`);
	const verificacaoDiaria = setInterval(() => inicializarAgentes().catch(erro => console.error('Falha ao atualizar relatos dos agentes', erro)), 60 * 60 * 1000);
	verificacaoDiaria.unref();
	app.listen(porta, () => console.log(`Aptus API ativa na porta ${porta}`));
}).catch((erro) => { console.error('Falha ao iniciar o banco', erro); process.exit(1); });
