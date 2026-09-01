const request = require('supertest');
const app = require('../app');
const { inicializarBanco, banco } = require('../config/conexaoBanco');

let nutricionista;
let usuario;
let receitaId;

afterAll(() => banco.close());

beforeAll(async () => {
  await inicializarBanco();
  const sufixo = Date.now();
  const registroNutricionista = await request(app).post('/api/auth/registro').send({ nome_completo: 'Nutri Feed', email: `nutri-feed-${sufixo}@aptus.dev`, senha: 'senha1234', role: 'nutricionista' });
  nutricionista = registroNutricionista.body.token;
  const registroUsuario = await request(app).post('/api/auth/registro').send({ nome_completo: 'Usuario Feed', email: `usuario-feed-${sufixo}@aptus.dev`, senha: 'senha1234', role: 'user' });
  usuario = registroUsuario.body.token;
  const receita = await request(app).post('/api/receitas').set('Authorization', `Bearer ${nutricionista}`).send({ titulo: 'Receita do Feed', descricao: 'Receita para teste', modo_preparo: 'Misture tudo', categoria: 'lanche', calorias: 250, proteina: 20, carboidrato: 25, gordura: 8 });
  receitaId = receita.body.id;
});

test('carrega feed paginado com dados enriquecidos', async () => {
  const resposta = await request(app).get('/api/feed?page=1&limit=10').set('Authorization', `Bearer ${usuario}`);
  expect(resposta.status).toBe(200);
  expect(resposta.body).toMatchObject({ sucesso: true, pagina: 1 });
  expect(Array.isArray(resposta.body.dados)).toBe(true);
  expect(resposta.body.dados.find(item => item.id === receitaId).criado_por).toHaveProperty('nome');
});

test('curte, descurte e salva receita no feed', async () => {
  const curtida = await request(app).post(`/api/receitas/${receitaId}/curtir`).set('Authorization', `Bearer ${usuario}`);
  expect(curtida.body.curtido).toBe(true);
  const feedCurtido = await request(app).get('/api/feed?page=1&limit=10').set('Authorization', `Bearer ${usuario}`);
  expect(feedCurtido.body.dados.find(item => item.id === receitaId).curtido_por_usuario).toBe(true);
  expect((await request(app).post(`/api/receitas/${receitaId}/salvar`).set('Authorization', `Bearer ${usuario}`)).body.salvo).toBe(true);
  expect((await request(app).delete(`/api/receitas/${receitaId}/curtir`).set('Authorization', `Bearer ${usuario}`)).body.curtido).toBe(false);
  expect((await request(app).delete(`/api/receitas/${receitaId}/salvar`).set('Authorization', `Bearer ${usuario}`)).body.salvo).toBe(false);
});

test('filtra discover por categoria e retorna trending', async () => {
  const discover = await request(app).get('/api/discover?categoria=lanche&page=1&limit=10');
  expect(discover.status).toBe(200);
  expect(discover.body.itens.some(item => item.id === receitaId)).toBe(true);
  expect(typeof discover.body.tem_proximo).toBe('boolean');
  const trending = await request(app).get('/api/feed/trending?tipo=receitas&periodo=7dias').set('Authorization', `Bearer ${usuario}`);
  expect(trending.status).toBe(200);
  expect(Array.isArray(trending.body)).toBe(true);
});
