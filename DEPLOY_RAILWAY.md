# Publicar o Aptus na Railway

O projeto usa dois serviços Railway a partir deste repositório:

## API

1. Crie um serviço a partir do repositório e defina `Root Directory` como `api`.
2. A Railway detectará o `api/Dockerfile` automaticamente.
3. Adicione um volume montado em `/app/db` para preservar o SQLite.
4. Configure as variáveis:

```text
NODE_ENV=production
JWT_SECRET=<uma-chave-aleatoria-com-pelo-menos-32-caracteres>
JWT_EXPIRACAO=24h
DATABASE_PATH=/app/db/aptus.db
FRONTEND_URL=https://<dominio-publico-do-frontend>
```

Adicione as chaves `ANTHROPIC_API_KEY`, `UNSPLASH_API_KEY` e `OPENAI_API_KEY` somente se os recursos correspondentes forem usados.

## Frontend

1. Crie um segundo serviço usando o mesmo repositório e defina `Root Directory` como `frontend`.
2. A Railway detectará o `frontend/Dockerfile`.
3. Configure a variável de build:

```text
VITE_API_URL=https://<dominio-publico-da-api>/api
```

4. Gere um domínio público para os dois serviços e atualize `FRONTEND_URL` da API com o domínio final do frontend.

O endereço público para acessar o sistema será o domínio do serviço frontend. O volume da API é obrigatório para que os dados do SQLite não sejam perdidos em novos deploys.