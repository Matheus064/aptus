require('dotenv').config();
const app = require('./app');
const { inicializarBanco } = require('./config/conexaoBanco');
const porta = Number(process.env.PORT || 3000);
inicializarBanco().then(() => app.listen(porta, () => console.log(`Aptus API ativa na porta ${porta}`))).catch((erro) => { console.error('Falha ao iniciar o banco', erro); process.exit(1); });
