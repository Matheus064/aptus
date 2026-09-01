const request = require('supertest');
const app = require('../app');

describe('Health Check Endpoint', () => {
  it('deve retornar status 200 no health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('ok');
  });

  it('deve retornar nome do serviço', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.body).toHaveProperty('servico');
    expect(response.body.servico).toBe('aptus-api');
  });

  it('deve retornar JSON válido', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.body).toBeInstanceOf(Object);
    expect(Object.keys(response.body).length).toBeGreaterThan(0);
  });
});
