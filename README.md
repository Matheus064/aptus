# Aptus

Plataforma web de saúde, alimentação e comunidade.

## Estrutura

- `api/`: API Node.js/Express com SQLite, autenticação JWT e testes Jest.
- `frontend/`: aplicação React/Vite responsiva.
- `.github/workflows/deploy.yml`: publicação automática no GitHub Pages.
- `render.yaml`: configuração do backend para Render.

## Executar localmente

API:

```bash
cd api
cp .env.example .env
npm install
npm run dev
```

Frontend, em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

API: `http://localhost:3000`
Frontend: `http://localhost:5173`

Testes da API:

```bash
cd api
npm test
```

## Publicação

Cada push na branch `main` publica o frontend em:

`https://matheus064.github.io/aptus/`

O backend precisa ser hospedado separadamente. Para usar Render, crie o serviço a partir de `render.yaml` e configure no GitHub Actions a variável `VITE_API_URL` com a URL pública da API, terminando em `/api`.
