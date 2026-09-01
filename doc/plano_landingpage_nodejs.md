# Plano de Arquitetura — Landing Page de Alta Conversão

> **Idioma obrigatório:** 100% do código (variáveis, funções, tabelas, colunas, chaves JSON, rotas **e comentários**) em **português brasileiro**. Comentários devem descrever a lógica em PT-BR em toda função e bloco relevante.

## 1. Estrutura de Pastas

```
testenodejs/
├── api/                          # Backend Node.js
│   ├── .env                      # Variáveis de ambiente (porta, banco)
│   ├── package.json
│   ├── src/
│   │   ├── app.js                # Config Express (CORS, JSON, rotas)
│   │   ├── server.js             # Inicialização do servidor
│   │   ├── config/
│   │   │   └── conexaoBanco.js   # Conexão SQLite (better-sqlite3)
│   │   ├── controladores/
│   │   │   └── leadControlador.js
│   │   ├── rotas/
│   │   │   └── leadRotas.js
│   │   └── utilitarios/
│   │       └── validadores.js    # Sanitização e validação
│   │
│   ├── db/                       # Banco de dados SQLite (criado em runtime)
│   │   └── landing.db            # Arquivo do banco SQLite (gitignore)
│   │
│   └── iniciarBanco.js           # Criação da tabela leads na inicialização
│
├── frontend/                     # Interface do usuário
│   ├── index.html                # Landing Page completa
│   ├── css/
│   │   └── estilo.css            # Estilos customizados + Tailwind CDN
│   └── js/
│       └── app.js                # Máscara telefone + Fetch API
│
├── doc/
│   └── plano_landingpage_nodejs.md   # ← Este documento
│
├── .gitignore                    # ignora node_modules, .env, api/db/
│
└── redme.md
```

---

## 2. Schema SQLite — Tabela `leads`

O banco SQLite (`api/db/landing.db`) é criado automaticamente pelo `better-sqlite3` na primeira execução. A tabela é criada via `iniciarBanco.js`:

```sql
CREATE TABLE IF NOT EXISTS leads (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo       TEXT    NOT NULL,
    email               TEXT    NOT NULL,
    telefone_whatsapp   TEXT    NOT NULL,
    mensagem            TEXT    DEFAULT NULL,
    data_cadastro       TEXT    DEFAULT (datetime('now','localtime')),
    status_atendimento  TEXT    DEFAULT 'novo'
                                CHECK(status_atendimento IN ('novo','contatado','convertido','perdido'))
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status_atendimento);
```

---

## 3. Arquitetura dos Endpoints da API

### 3.1 `POST /api/leads` — Cadastro de lead

| Campo | Tipo | Validação |
|---|---|---|
| `nome_completo` | string (3-150) | Obrigatório, sanitizado |
| `email` | string | Obrigatório, regex de e-mail |
| `telefone_whatsapp` | string (14-15) | Obrigatório, apenas dígitos após limpeza |
| `mensagem` | string (0-500) | Opcional, sanitizado |

**Resposta sucesso (201):**
```json
{"sucesso": true, "mensagem": "Lead cadastrado com sucesso!"}
```

**Resposta erro (422):**
```json
{"sucesso": false, "mensagem": "E-mail inválido.", "erros": [...]}
```

### 3.2 `GET /api/leads` — Listagem (uso interno)

Retorna array paginado de leads.

### 3.3 Segurança

- `express.json({ limit: '10kb' })` — proteção contra payload excessivo
- Sanitização com `validator` (trim, escape, stripLow)
- **Prepared statements** obrigatórios (`better-sqlite3` usa `?` posicionais — sem concatenação)
- CORS configurado com lista de origens permitidas
- `helmet` para headers de segurança (opcional no MVP)
- `api/db/` listado no `.gitignore` — banco local nunca versionado

---

## 4. Especificações Visuais do Front-end

### 4.1 Stack

- **HTML5 semântico** (`<header>`, `<main>`, `<section>`, `<form>`)
- **Tailwind CSS via CDN** — classes utilitárias para responsividade rápida
- **JavaScript nativo** — Fetch API, máscara de telefone, feedback sem refresh

### 4.2 Seções da Landing Page

1. **Navbar** — fixa no topo, logo + CTA "Quero saber mais"
2. **Hero** — headline forte, subheadline, ilustração, botão CTA âncora para o form
3. **Benefícios** — 3 cards com ícones (Mobile-First: empilhados, Desktop: grid 3 col)
4. **Formulário de Captura** — campos com placeholder, máscara (xx) xxxxx-xxxx, validação inline, botão com loading spinner
5. **Footer** — links, direitos reservados

### 4.3 Comportamento de Submissão

1. Usuário preenche → clique no botão
2. Botão desabilita + exibe spinner
3. Fetch API envia `POST` para `http://localhost:3000/api/leads`
4. Em caso de **sucesso**: limpa formulário, exibe toast verde "Mensagem enviada com sucesso!"
5. Em caso de **erro**: exibe toast vermelho com a mensagem retornada pela API

---

## 5. Regras de Otimização de Tokens (Codificação Futura)

| Princípio | Aplicação |
|---|---|
| Comentários em PT-BR | Toda função, variável e bloco relevante deve ter comentário descritivo em português brasileiro |
| Arrow functions curtas | Preferir `(x) => x` a `function(x) { return x }` |
| Destructuring | `const { nome, email } = req.body` |
| Template strings | `` `${base}/leads` `` em vez de concatenação |
| If ternário | `status === 201 ? sucesso() : erro()` |
| Minificação de CSS | Manter classes Tailwind no HTML, CSS customizado mínimo |
| Reuso de fetch | Função genérica `api(método, corpo)` para todas as chamadas |
| SQL com placeholder | `?` posicional (`better-sqlite3`) — nunca template literals |

---

## 6. Fluxo de Desenvolvimento (Próximos Passos)

1. ✅ **Fase 1 (atual):** Planejamento e arquitetura — *documento salvo*
2. ⏳ **Fase 2:** Codificação do backend (`/api`) — package.json, conexaoBanco.js (SQLite), iniciarBanco.js, rotas, controlador, validadores
3. ⏳ **Fase 3:** Codificação do frontend (`/frontend`) — HTML, Tailwind, JS com Fetch + máscara
4. ⏳ **Fase 4:** Teste integrado e ajustes finos

---

*Documento gerado em 29/07/2026 — Pronto para codificação após aprovação.*
