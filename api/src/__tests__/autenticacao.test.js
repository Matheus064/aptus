const request = require('supertest');
const app = require('../app');
const { inicializarBanco, banco } = require('../config/conexaoBanco');

beforeAll(async () => { await inicializarBanco(); });
afterAll(() => banco.close());

test('registra, autentica e acessa o perfil', async () => {
  const email = `user-${Date.now()}@aptus.dev`;
  const registro = await request(app).post('/api/auth/registro').send({ nome_completo: 'Usuário Teste', email, senha: 'senha1234', role: 'user' });
  expect(registro.status).toBe(201);
  expect(registro.body.usuario).not.toHaveProperty('senha');
  const login = await request(app).post('/api/auth/login').send({ email, senha: 'senha1234' });
  expect(login.status).toBe(200);
  const perfil = await request(app).get('/api/usuarios/me').set('Authorization', `Bearer ${login.body.token}`);
  expect(perfil.status).toBe(200);
  expect(perfil.body.role).toBe('user');
});

test('rejeita credenciais inválidas e admin no registro público', async () => {
  const email = `blocked-${Date.now()}@aptus.dev`;
  await request(app).post('/api/auth/registro').send({ nome_completo: 'Bloqueado', email, senha: 'senha1234', role: 'user' });
  expect((await request(app).post('/api/auth/login').send({ email, senha: 'errada123' })).status).toBe(401);
  expect((await request(app).post('/api/auth/registro').send({ nome_completo: 'Admin', email: `admin-${Date.now()}@aptus.dev`, senha: 'senha1234', role: 'admin' })).status).toBe(422);
});

test('protege perfil sem token', async () => {
  expect((await request(app).get('/api/usuarios/me')).status).toBe(401);
});
