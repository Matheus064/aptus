# 🏗️ Arquitetura Aptus

## Visão Geral

Aptus é uma rede social de saúde e bem-estar desenvolvida com arquitetura **Full Stack** modular e escalável.

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                 │
│              Port: 5173 | Tailwind CSS                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/JSON
                     ▼
┌─────────────────────────────────────────────────────────┐
│            Backend (Node.js/Express)                     │
│              Port: 3000 | RESTful API                    │
├─────────────────────────────────────────────────────────┤
│  Routes│Controllers│Services│Models│Config│Middlewares │
└────────────────────┬────────────────────────────────────┘
                     │ SQL
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Database (SQLite/PostgreSQL)                   │
│              ./db/aptus.db                               │
└─────────────────────────────────────────────────────────┘
```

## 📁 Estrutura de Pastas

### Backend (`/api`)

```
api/
├── src/
│   ├── app.js                    # Configuração Express
│   ├── server.js                 # Entrada principal
│   ├── config/
│   │   └── conexaoBanco.js       # Conexão BD + Schema
│   ├── rotas/                    # Definição de endpoints
│   │   ├── usuarioRotas.js
│   │   ├── receiptasRotas.js
│   │   ├── exerciciosRotas.js
│   │   ├── planoRotas.js
│   │   └── ...
│   ├── controladores/            # Lógica de negócio
│   │   ├── usuarioControlador.js
│   │   ├── receitaControlador.js
│   │   └── ...
│   ├── middlewares/              # Validação, Auth
│   │   ├── autenticacao.js       # JWT validation
│   │   └── autorizacao.js        # Role-based access
│   ├── utilitarios/
│   │   └── validadores.js        # Email, senha, etc
│   ├── servicos/                 # Lógica complexa
│   ├── __tests__/                # Testes Jest
│   └── db/
│       └── aptus.db              # SQLite database
├── iniciarBanco.js               # Script inicialização
├── package.json
├── jest.config.js                # Config testes
└── Dockerfile                    # Deploy
```

### Frontend (`/frontend`)

```
frontend/
├── index.html                    # Entry point
├── js/
│   ├── app.js                    # Router principal
│   ├── api.js                    # Cliente HTTP
│   ├── auth.js                   # Gerenciamento JWT
│   ├── componentes/              # Componentes reutilizáveis
│   │   ├── navbar.js
│   │   ├── modal.js
│   │   ├── cardPost.js
│   │   └── ...
│   └── paginas/                  # Páginas/Telas
│       ├── login.js
│       ├── cadastro.js
│       ├── feed.js
│       ├── perfil.js
│       └── ...
├── css/
│   └── estilo.css                # Tailwind + customizações
├── vite.config.js                # Config Vite
├── package.json
└── Dockerfile                    # Deploy
```

## 🔄 Fluxo de Requisição

### 1. **Frontend → Backend (HTTP)**

```
GET /api/receitas/populares
    ↓
Headers: { Authorization: "Bearer <JWT_TOKEN>" }
    ↓
Chega no Express
```

### 2. **Backend - Processamento**

```
Router (rotas/receitasRotas.js)
    ↓ passa para
Middleware (autenticacao.js) - valida JWT
    ↓ passa para
Controlador (receitaControlador.js) - prepara dados
    ↓ chama
Serviço (receitaServico.js) - lógica complexa
    ↓ consulta
Banco de Dados (conexaoBanco.js)
    ↓ retorna
JSON response
```

### 3. **Frontend - Renderiza Dados**

```
JavaScript Fetch API
    ↓
JSON.parse()
    ↓
Renderiza componentes React
    ↓
Atualiza DOM
```

## 🗄️ Schema do Banco de Dados

### Principais Tabelas

| Tabela | Descrição | Relaçãoes |
|--------|-----------|-----------|
| `usuarios` | Perfis de usuários | 1-N com receitas, exercícios, posts |
| `receitas` | Receitas de alimentos | M-N com ingredientes |
| `exercicios` | Guia de exercícios | 1-N com histórico |
| `planos_alimentares` | Planos de dieta | 1-N com receitas |
| `mensagens` | Chat privado | 2 usuários |
| `grupos_suporte` | Comunidades | M-N com membros |
| `historico_consumo_usuario` | Rastreamento de comida | Usuário + data + receita |
| `historico_exercicios_usuario` | Rastreamento de treino | Usuário + data + exercício |

## 🔐 Autenticação & Segurança

### Flow JWT

```
1. Login (email + senha)
    ↓
2. Backend valida credenciais com bcryptjs
    ↓
3. Gera JWT Token (payload: userId, role, exp)
    ↓
4. Frontend armazena em localStorage
    ↓
5. Cada requisição inclui: Authorization: "Bearer <token>"
    ↓
6. Middleware verifica assinatura JWT
    ↓
7. Extrai userId e role para autorização
```

### Middlewares de Segurança

- ✅ **Helmet** - Headers HTTP seguras
- ✅ **CORS** - Controle de origem
- ✅ **Autenticação** - Validação JWT
- ✅ **Autorização** - Role-based (user, nutricionista, admin)
- ✅ **Validação** - Sanitização de input com validator.js
- ✅ **Rate Limiting** - (Opcional para produção)

## 🚀 Roles & Permissões

| Role | Permissões |
|------|-----------|
| **user** | Criar receitas, exercícios, posts; seguir usuários; criar planos |
| **nutricionista** | Tudo do user + criar planos profissionais; análise detalhada |
| **admin** | Acesso total; moderação; estatísticas |

## 📊 Endpoints Principais

### Autenticação
- `POST /api/usuarios/login` - Fazer login
- `POST /api/usuarios/cadastro` - Criar conta
- `GET /api/usuarios/perfil` - Perfil do usuário logado

### Receitas
- `GET /api/receitas` - Listar receitas
- `GET /api/receitas/:id` - Detalhe da receita
- `POST /api/receitas` - Criar receita (requer auth)
- `PUT /api/receitas/:id` - Editar receita
- `DELETE /api/receitas/:id` - Deletar receita

### Exercícios
- `GET /api/exercicios` - Listar exercícios
- `POST /api/exercicios` - Criar exercício

### Planos
- `GET /api/planos` - Listar planos
- `POST /api/planos` - Criar plano alimentar
- `GET /api/planos/:id/receitas` - Receitas do plano

### Social
- `GET /api/posts` - Feed de posts
- `POST /api/posts` - Criar post
- `POST /api/usuarios/:id/seguir` - Seguir usuário

### Chat
- `GET /api/mensagens/:usuarioId` - Conversa
- `POST /api/mensagens` - Enviar mensagem

## 🔌 Integrações Externas

| Serviço | Uso | Status |
|---------|-----|--------|
| Anthropic AI | Gerar planos com IA | Configurável via ANTHROPIC_API_KEY |
| OpenAI | Análise de imagens | Configurável via OPENAI_API_KEY |
| Unsplash API | Fotos de ingredientes | Configurável via UNSPLASH_API_KEY |

## 🧪 Testing

### Executar Testes

```bash
# Todos os testes
npm test

# Modo watch
npm test -- --watch

# Com cobertura
npm test -- --coverage
```

### Estrutura de Testes

```
__tests__/
├── health.test.js              # Endpoints básicos
├── validadores.test.js         # Funções utilitárias
├── autenticacao.test.js        # JWT e login (TODO)
└── receitas.test.js            # Controladores (TODO)
```

## 📈 Performance & Escalabilidade

### Otimizações Implementadas
- ✅ Índices no banco (email, role, data_criacao)
- ✅ Paginação em endpoints
- ✅ Compressão HTTP (Helmet)
- ✅ CORS otimizado

### Próximas Melhorias
- [ ] Cache com Redis
- [ ] Migrations com Knex.js
- [ ] Logging centralized (Winston)
- [ ] Message Queue (Bull)
- [ ] Migração para PostgreSQL

## 🐳 Deploy & DevOps

### Docker

```bash
# Build
docker build -t aptus-api ./api
docker build -t aptus-frontend ./frontend

# Run
docker run -p 3000:3000 aptus-api
docker run -p 5173:5173 aptus-frontend
```

### Railway Deploy

1. Criar dois serviços (API + Frontend)
2. Configurar Root Directory
3. Definir variáveis de ambiente
4. Volumes para SQLite persistência

## 📝 Variáveis de Ambiente

### `.env` Backend

```env
PORT=3000
NODE_ENV=development
ORIGEM_PERMITIDA=*
JWT_SECRET=sua-chave-secreta
JWT_EXPIRACAO=24h
DATABASE_PATH=./db/aptus.db
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
UNSPLASH_API_KEY=...
```

## 🔄 Ciclo de Desenvolvimento

### Para Desenvolvedores

```bash
# 1. Setup
git clone https://github.com/Matheus064/aptus.git
cd aptus

# 2. Backend
cd api
npm install
npm run dev    # Watch mode

# 3. Frontend (novo terminal)
cd frontend
npm install
npm run dev

# 4. Acessar
# Frontend: http://localhost:5173
# API: http://localhost:3000
# Health: http://localhost:3000/api/health
```

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| `SQLITE_ERROR` | Deletar `db/aptus.db` e reiniciar |
| JWT expirado | Fazer login novamente |
| CORS error | Verificar ORIGEM_PERMITIDA |
| Porta em uso | `lsof -i :3000` e matar processo |

## 📚 Referências

- [Express.js Docs](https://expressjs.com)
- [SQLite Docs](https://www.sqlite.org/docs.html)
- [React Docs](https://react.dev)
- [JWT.io](https://jwt.io)
- [REST API Design](https://restfulapi.net)

---

**Última atualização**: Setembro 2026 | **Versão**: 2.0
