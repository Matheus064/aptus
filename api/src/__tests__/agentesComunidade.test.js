const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const diretorioTeste = fs.mkdtempSync(path.join(os.tmpdir(), 'aptus-agentes-'));
process.env.DATABASE_PATH = path.join(diretorioTeste, 'aptus.sqlite');
process.env.ANTHROPIC_API_KEY = '';

const request = require('supertest');
const app = require('../app');
const { banco, inicializarBanco, buscar } = require('../config/conexaoBanco');
const { inicializarAgentes } = require('../servicos/agentesComunidadeService');

let token;
let agentes;

beforeAll(async () => {
  await inicializarBanco();
  await inicializarAgentes();
  const registro = await request(app).post('/api/auth/registro').send({
    nome_completo: 'Pessoa Teste Agentes',
    email: `pessoa-${Date.now()}@aptus.test`,
    senha: 'senha1234',
    role: 'user',
  });
  token = registro.body.token;
  const resposta = await request(app).get('/api/mensagens/agentes').set('Authorization', `Bearer ${token}`);
  agentes = resposta.body;
});

afterAll(async () => {
  await new Promise(resolve => banco.close(resolve));
  fs.rmSync(diretorioTeste, { recursive: true, force: true });
});

test('cria três perfis de IA e uma publicação diária por agente sem duplicar ao reiniciar', async () => {
  expect(agentes).toHaveLength(3);
  expect(agentes.every(agente => agente.agente_ia)).toBe(true);

  await inicializarAgentes();
  const total = await buscar(`SELECT COUNT(*) AS total FROM posts_usuarios p
    JOIN usuarios u ON u.id=p.usuario_id WHERE u.agente_ia IS NOT NULL`);
  expect(total.total).toBe(3);

  const feed = await request(app).get('/api/posts').set('Authorization', `Bearer ${token}`);
  expect(feed.body.posts.filter(post => post.autor_agente_ia)).toHaveLength(3);
});

test('responde a uma mensagem iniciada pelo usuário', async () => {
  const agente = agentes[0];
  const envio = await request(app).post('/api/mensagens').set('Authorization', `Bearer ${token}`).send({
    destinatario_id: agente.id,
    conteudo: 'Hoje consegui fazer uma caminhada curta.',
  });
  expect(envio.status).toBe(201);

  const conversa = await request(app).get(`/api/mensagens/conversa/${agente.id}`).set('Authorization', `Bearer ${token}`);
  expect(conversa.status).toBe(200);
  expect(conversa.body).toHaveLength(2);
  expect(conversa.body[1].remetente_id).toBe(agente.id);
  expect(conversa.body[1].conteudo).toContain('agente de IA');
});