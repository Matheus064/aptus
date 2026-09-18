const request = require('supertest');
const app = require('../app');
const { inicializarBanco, banco, executar } = require('../config/conexaoBanco');
const { criarHash } = require('../utilitarios/hash');

let usuario;
let nutricionista;
let admin;
let postId;
let planoId;
let grupoId;

afterAll(() => banco.close());

beforeAll(async () => {
  await inicializarBanco();
  const sufixo = Date.now();
  const registrar = async (nome, role) => (await request(app).post('/api/auth/registro').send({ nome_completo: nome, email: `${role}-${sufixo}@aptus.dev`, senha: 'senha1234', role })).body.token;
  usuario = await registrar('Usuário Histórias', 'user');
  nutricionista = await registrar('Nutricionista Histórias', 'nutricionista');
  const senhaAdmin = await criarHash('senha1234');
  await executar('INSERT INTO usuarios (nome_completo,email,senha,role) VALUES (?,?,?,?)', ['Admin Histórias', `admin-${sufixo}@aptus.dev`, senhaAdmin, 'admin']);
  admin = (await request(app).post('/api/auth/login').send({ email: `admin-${sufixo}@aptus.dev`, senha: 'senha1234' })).body.token;
});

test('cria, comenta, lista e remove uma publicação própria', async () => {
  const criada = await request(app).post('/api/posts').set('Authorization', `Bearer ${usuario}`).send({ conteudo: 'Minha evolução hoje', tipo: 'progresso' });
  expect(criada.status).toBe(201);
  postId = criada.body.id;
  const comentario = await request(app).post(`/api/posts/${postId}/comentarios`).set('Authorization', `Bearer ${nutricionista}`).send({ conteudo: 'Parabéns!' });
  expect(comentario.status).toBe(201);
  const comentarios = await request(app).get(`/api/posts/${postId}/comentarios`).set('Authorization', `Bearer ${usuario}`);
  expect(comentarios.body.comentarios).toHaveLength(1);
  const removida = await request(app).delete(`/api/posts/${postId}`).set('Authorization', `Bearer ${usuario}`);
  expect(removida.status).toBe(204);
});

test('cria, detalha, atualiza e exclui plano pessoal', async () => {
  const criado = await request(app).post('/api/planos').set('Authorization', `Bearer ${usuario}`).send({ titulo: 'Plano pessoal', descricao: 'Rotina simples', duracao_dias: 7 });
  expect(criado.status).toBe(201);
  planoId = criado.body.id;
  expect((await request(app).get(`/api/planos/${planoId}`)).status).toBe(200);
  expect((await request(app).put(`/api/planos/${planoId}`).set('Authorization', `Bearer ${usuario}`).send({ descricao: 'Rotina atualizada' })).status).toBe(200);
  expect((await request(app).delete(`/api/planos/${planoId}`).set('Authorization', `Bearer ${usuario}`)).status).toBe(204);
});

test('lista e permite entrar em grupo de suporte', async () => {
  const criado = await request(app).post('/api/comunidade/grupos').set('Authorization', `Bearer ${nutricionista}`).send({ nome: 'Grupo Teste', descricao: 'Apoio coletivo' });
  expect(criado.status).toBe(201);
  grupoId = criado.body.id;
  const grupos = await request(app).get('/api/comunidade/grupos').set('Authorization', `Bearer ${usuario}`);
  expect(grupos.body.some(grupo => grupo.id === grupoId)).toBe(true);
  expect((await request(app).post(`/api/comunidade/grupos/${grupoId}/entrar`).set('Authorization', `Bearer ${usuario}`)).status).toBe(201);
});

test('admin resolve reporte e consulta métricas', async () => {
  const reporte = await request(app).post('/api/comunidade/reportes').set('Authorization', `Bearer ${usuario}`).send({ tipo: 'post', alvo_id: 1, motivo: 'Analisar conteúdo' });
  expect(reporte.status).toBe(201);
  expect((await request(app).get('/api/admin/metricas/saude').set('Authorization', `Bearer ${admin}`)).status).toBe(200);
  expect((await request(app).put(`/api/admin/moderacao/reportes/${reporte.body.id}`).set('Authorization', `Bearer ${admin}`).send({ status: 'resolvido' })).status).toBe(200);
});
