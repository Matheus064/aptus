# Aptus 2.0

Plataforma full stack para saúde e emagrecimento em comunidade. O projeto inclui feed, conteúdos profissionais, planos, evolução de peso, mensagens, grupos de suporte, notificações, moderação e visão administrativa.

## Executar

```bash
cd api
cp .env.example .env
npm install
npm run dev
```

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A API responde em `http://localhost:3000`; use `GET /health` para conferir o serviço. O frontend Vite mostra a URL local ao iniciar.

## Papéis

- `user`: feed, comentários, planos, peso, progresso, conversas e grupos.
- `nutricionista`: cria receitas, exercícios, planos e grupos; envia o CRN para verificação.
- `admin`: moderação, bloqueios, verificação profissional e métricas agregadas.

## Rotas principais

- Autenticação: `POST /api/auth/registro`, `POST /api/auth/login`, `POST /api/auth/verificar-nutricionista`
- Conteúdo: `GET|POST /api/receitas`, `GET|POST /api/exercicios`, `GET|POST /api/planos`
- Comunidade: `POST /api/usuarios/:id/seguir`, `POST /api/planos/:id/seguir`, `POST /api/comunidade/reportes`
- Jornada: `POST|GET /api/usuarios/me/peso`, `PUT /api/planos/:id/progresso`
- Conversas: `GET /api/mensagens/conversas`, `POST /api/mensagens`, rotas de grupos em `/api/mensagens/grupos`
- Administração: `GET /api/admin/dashboard`, `/api/admin/metricas/saude`, `/api/admin/moderacao/reportes`

## Limites de integração

Uploads locais estão preparados para fotos e vídeos. Push real, e-mails, streaming, wearables e recomendação por IA exigem credenciais de provedores externos antes de entrarem em produção.
