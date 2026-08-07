# Plano de Execução — Aptus: Redesign Completo do Frontend e Backend

---

## 1. Situação Atual do Projeto

### 1.1 O que existe hoje
O projeto Aptus está com uma estrutura básica de uma Landing Page de captura de leads, sem relação com o novo objetivo do projeto (rede social para emagrecimento saudável).

**Backend atual:**
- Único controlador: `leadControlador.js` (cadastro e listagem de leads)
- Única rota: `leadRotas.js` (POST e GET /leads)
- Banco de dados: tabela `leads` (nome, email, telefone, mensagem)
- Validação: apenas para formulário de lead

**Frontend atual:**
- Única página: `index.html` (Landing Page genérica)
- CSS: apenas 22 linhas de estilos básicos
- JS: apenas lógica de formulário de lead com Fetch API
- Sem autenticação, sem navegação entre páginas

### 1.2 Gap entre o atual e o desejado
O projeto precisa ser completamente reestruturado para se tornar uma rede social com planos alimentares personalizados, conforme descrito no README.md e no protótipo Figma.

---

## 2. Referência do Protótipo Figma

**Protótipo:** Health and Nutrition App (https://www.figma.com/make/JHMgGMqSN4BWcoSIt7O7wB/Health-and-Nutrition-App)

O protótipo Figma apresenta um aplicativo de saúde e nutrição com as seguintes telas e funcionalidades principais:

### 2.1 Telas identificadas no protótipo

| Tela | Descrição | Funcionalidade |
|------|-----------|----------------|
| **Onboarding** | Tela de boas-vindas com 3 passos | Apresentação do app, seleção de objetivos |
| **Login/Cadastro** | Autenticação do usuário | Email + senha, criação de conta |
| **Perfil Básico** | Configuração inicial | Dados pessoais, peso, altura, meta |
| **Home/Dashboard** | Tela principal | Resumo diário, calorias, posts da comunidade |
| **Plano Alimentar** | Lista de refeições do dia | Café da manhã, almoço, jantar, lanches |
| **Detalhe Refeição** | Informações da refeição | Alimentos, calorias, horário |
| **Feed da Comunidade** | Rede social | Posts, curtidas, comentários |
| **Criar Post** | Nova publicação | Texto, dicas, evolução, receitas |
| **Perfil do Usuário** | Meu perfil | Dados, progresso, configurações |
| **Evolução/Progresso** | Gráficos de acompanhamento | Peso, calorias, frequência |

### 2.2 Paleta de Cores e Estilo Visual
- **Cor primária:** Verde (saúde, natureza, bem-estar)
- **Cor secundária:** Laranja/Amarelo (energia, vitalidade)
- **Fundo:** Branco com tons de cinza claro
- **Estilo:** Cards arredondados, ícones simples, tipografia limpa
- **Mobile-first:** Design responsivo, otimizado para dispositivos móveis

---

## 3. Nova Estrutura do Projeto

### 3.1 Estrutura de Pastas

```text
aptus/
├── api/                              # Backend Node.js
│   ├── db/
│   │   └── aptus.db                  # Banco SQLite
│   ├── src/
│   │   ├── config/
│   │   │   └── conexaoBanco.js       # Conexão SQLite
│   │   ├── controladores/
│   │   │   ├── usuarioControlador.js # Cadastro, login, perfil
│   │   │   ├── postControlador.js    # CRUD de publicações
│   │   │   ├── planoControlador.js   # Planos alimentares
│   │   │   └── comentarioControlador.js # Comentários nos posts
│   │   ├── middlewares/
│   │   │   └── autenticacao.js       # Middleware de autenticação JWT
│   │   ├── rotas/
│   │   │   ├── usuarioRotas.js       # Rotas de usuários
│   │   │   ├── postRotas.js          # Rotas de posts
│   │   │   ├── planoRotas.js         # Rotas de planos
│   │   │   └── comentarioRotas.js    # Rotas de comentários
│   │   ├── utilitarios/
│   │   │   └── validadores.js        # Validações atualizadas
│   │   ├── app.js                    # Configuração Express
│   │   └── server.js                 # Inicialização
│   ├── .env                          # Variáveis de ambiente
│   ├── iniciarBanco.js               # DDL das tabelas
│   └── package.json                  # Dependências
│
├── frontend/                         # Interface Web (SPA)
│   ├── css/
│   │   └── estilo.css                # Estilos globais + componentes
│   ├── js/
│   │   ├── app.js                    # Roteador e inicialização
│   │   ├── api.js                    # Serviço de chamadas à API
│   │   ├── auth.js                   # Gerenciamento de autenticação
│   │   ├── paginas/
│   │   │   ├── onboarding.js         # Tela de boas-vindas
│   │   │   ├── login.js              # Página de login
│   │   │   ├── cadastro.js           # Página de cadastro
│   │   │   ├── perfilBasico.js       # Configuração inicial do perfil
│   │   │   ├── home.js               # Dashboard principal
│   │   │   ├── planoAlimentar.js     # Lista de planos
│   │   │   ├── detalhePlano.js       # Detalhes do plano com refeições
│   │   │   ├── feed.js               # Feed da comunidade
│   │   │   ├── criarPost.js          # Criar nova publicação
│   │   │   └── perfil.js             # Meu perfil
│   │   └── componentes/
│   │       ├── navbar.js             # Barra de navegação
│   │       ├── cardPost.js           # Card de publicação
│   │       ├── cardRefeicao.js       # Card de refeição
│   │       ├── modal.js              # Componente modal
│   │       └── toast.js              # Notificações
│   └── index.html                    # Shell da aplicação (SPA)
│
├── doc/                              # Documentação
│   └── plano_novo_front.md           # Este documento
│
├── .gitignore
└── README.md
```

---

## 4. Alterações no Backend (API)

### 4.1 Nova Dependência: `jsonwebtoken`

Adicionar ao `package.json`:
```json
"dependencies": {
  "better-sqlite3": "^9.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "helmet": "^8.0.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "validator": "^13.12.0"
}
```

**Novas dependências:**
- `jsonwebtoken` — Geração e verificação de tokens JWT para autenticação
- `bcryptjs` — Hash de senhas (criptografia segura)

### 4.2 Atualização do Banco de Dados (`iniciarBanco.js`)

Remover a tabela `leads` e criar as 5 novas tabelas conforme especificado no README.md:

```sql
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo   TEXT    NOT NULL,
    email           TEXT    NOT NULL UNIQUE,
    senha           TEXT    NOT NULL,
    data_nascimento TEXT    DEFAULT NULL,
    peso_atual      REAL    DEFAULT NULL,
    peso_meta       REAL    DEFAULT NULL,
    altura          REAL    DEFAULT NULL,
    data_cadastro   TEXT    DEFAULT (datetime('now','localtime'))
);

-- Tabela de posts (rede social)
CREATE TABLE IF NOT EXISTS posts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER NOT NULL,
    conteudo        TEXT    NOT NULL,
    tipo            TEXT    DEFAULT 'texto'
                        CHECK(tipo IN ('texto','dica','evolucao','receita')),
    data_criacao    TEXT    DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de planos alimentares
CREATE TABLE IF NOT EXISTS planos_alimentares (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER NOT NULL,
    titulo          TEXT    NOT NULL,
    descricao       TEXT    DEFAULT NULL,
    calorias_total  INTEGER DEFAULT NULL,
    data_inicio     TEXT    DEFAULT NULL,
    data_fim        TEXT    DEFAULT NULL,
    ativo           INTEGER DEFAULT 1,
    data_criacao    TEXT    DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de refeições
CREATE TABLE IF NOT EXISTS refeicoes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    plano_id        INTEGER NOT NULL,
    nome            TEXT    NOT NULL,
    horario         TEXT    DEFAULT NULL,
    calorias        INTEGER DEFAULT NULL,
    alimentos       TEXT    DEFAULT NULL,
    FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id) ON DELETE CASCADE
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS comentarios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id         INTEGER NOT NULL,
    usuario_id      INTEGER NOT NULL,
    conteudo        TEXT    NOT NULL,
    data_criacao    TEXT    DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

### 4.3 Novo Controlador: `usuarioControlador.js`

**Funções a implementar:**

| Função | Método HTTP | Rota | Descrição |
|--------|-------------|------|-----------|
| `cadastrar` | POST | `/api/usuarios/cadastro` | Valida dados, hash da senha, insere no banco |
| `login` | POST | `/api/usuarios/login` | Verifica email/senha, retorna token JWT |
| `obterPerfil` | GET | `/api/usuarios/perfil` | Retorna dados do usuário logado (requer auth) |
| `atualizarPerfil` | PUT | `/api/usuarios/perfil` | Atualiza peso, meta, altura (requer auth) |

**Fluxo de cadastro:**
1. Validar nome (3-150 caracteres), email (formato válido), senha (mínimo 6 caracteres)
2. Verificar se o email já existe no banco
3. Gerar hash da senha com bcryptjs
4. Inserir usuário no banco
5. Retornar sucesso (HTTP 201)

**Fluxo de login:**
1. Validar email e senha
2. Buscar usuário por email
3. Comparar senha com hash usando bcryptjs
4. Gerar token JWT com payload { id, email }
5. Retornar token e dados básicos do usuário

### 4.4 Novo Controlador: `postControlador.js`

**Funções a implementar:**

| Função | Método HTTP | Rota | Descrição |
|--------|-------------|------|-----------|
| `criarPost` | POST | `/api/posts` | Cria publicação (requer auth) |
| `listarPosts` | GET | `/api/posts` | Lista posts da comunidade (com paginação) |
| `obterPost` | GET | `/api/posts/:id` | Retorna post específico com comentários |
| `deletarPost` | DELETE | `/api/posts/:id` | Remove post (apenas o autor) |

### 4.5 Novo Controlador: `planoControlador.js`

**Funções a implementar:**

| Função | Método HTTP | Rota | Descrição |
|--------|-------------|------|-----------|
| `criarPlano` | POST | `/api/planos` | Cria plano alimentar (requer auth) |
| `listarPlanos` | GET | `/api/planos` | Lista planos do usuário logado |
| `obterPlano` | GET | `/api/planos/:id` | Detalhes do plano com refeições |
| `atualizarPlano` | PUT | `/api/planos/:id` | Atualiza dados do plano |
| `deletarPlano` | DELETE | `/api/planos/:id` | Remove plano |
| `adicionarRefeicao` | POST | `/api/planos/:id/refeicoes` | Adiciona refeição ao plano |

### 4.6 Novo Middleware: `autenticacao.js`

**Responsabilidade:** Verificar token JWT em rotas protegidas

**Fluxo:**
1. Extrair header `Authorization: Bearer <token>`
2. Verificar e decodificar o token com `jsonwebtoken`
3. Anexar dados do usuário em `req.usuario`
4. Se token inválido/expirado, retornar HTTP 401

### 4.7 Atualização do `app.js`

```javascript
// Novas rotas a registrar
app.use('/api', rotasUsuarios)
app.use('/api', rotasPosts)
app.use('/api', rotasPlanos)
app.use('/api', rotasComentarios)
```

Remover a rota antiga de leads.

### 4.8 Atualização dos `validadores.js`

Adicionar novas funções de validação:

| Função | Valida |
|--------|--------|
| `validarCadastro(dados)` | nome, email, senha |
| `validarLogin(dados)` | email, senha |
| `validarPerfil(dados)` | peso_atual, peso_meta, altura |
| `validarPost(dados)` | conteudo (1-2000), tipo |
| `validarPlano(dados)` | titulo (3-100), calorias_total |
| `validarRefeicao(dados)` | nome (3-100), horario, calorias |
| `validarComentario(dados)` | conteudo (1-1000) |

---

## 5. Redesign Completo do Frontend

### 5.1 Arquitetura: SPA (Single Page Application)

O frontend será convertido de uma Landing Page estática para uma **SPA** com roteador client-side. Todas as páginas serão renderizadas dinamicamente via JavaScript.

**Shell da aplicação (`index.html`):**
```html
<body>
  <div id="app"></div>  <!-- Container principal -->
  <script src="js/app.js"></script>
</body>
```

### 5.2 Sistema de Roteamento (`app.js`)

Roteador simples baseado em hash:

| Rota | Página | Autenticação |
|------|--------|--------------|
| `#/` ou `#/onboarding` | Tela de boas-vindas | Não |
| `#/login` | Login | Não |
| `#/cadastro` | Cadastro | Não |
| `#/perfil-basico` | Configuração inicial | Sim |
| `#/home` | Dashboard principal | Sim |
| `#/planos` | Lista de planos alimentares | Sim |
| `#/planos/:id` | Detalhe do plano | Sim |
| `#/feed` | Feed da comunidade | Sim |
| `#/criar-post` | Criar publicação | Sim |
| `#/perfil` | Meu perfil | Sim |

### 5.3 Serviço de API (`api.js`)

Módulo centralizado para todas as chamadas HTTP:

```javascript
// Funções utilitárias
- requisicao(method, url, body)  // Fetch genérico com token
- cadastrar(dados)
- login(dados)
- obterPerfil()
- atualizarPerfil(dados)
- criarPost(dados)
- listarPosts(pagina)
- criarPlano(dados)
- listarPlanos()
- obterPlano(id)
- adicionarRefeicao(planoId, dados)
- criarComentario(postId, dados)
```

### 5.4 Gerenciamento de Autenticação (`auth.js`)

```javascript
// Funções
- salvarToken(token)        // Salva no localStorage
- obterToken()             // Recupera do localStorage
- removerToken()           // Remove do localStorage
- usuarioLogado()          // Verifica se há token válido
- obterUsuarioAtual()      // Retorna dados do usuário logado
- fazerLogout()            // Limpa token e redireciona
```

### 5.5 Páginas do Frontend (Descrição Detalhada)

#### **5.5.1 Onboarding (`onboarding.js`)**
- **Tela 1:** Logo do Aptus + mensagem "Bem-vindo ao Aptus"
- **Tela 2:** Ícone de pessoa + "Conecte-se com quem compartilha seus objetivos"
- **Tela 3:** Ícone de prato + "Receba planos de alimentação personalizados"
- **Botão:** "Começar agora" → redireciona para `#/cadastro`
- **Indicadores:** 3 bolinhas mostrando progresso

#### **5.5.2 Login (`login.js`)**
- **Campos:** Email, Senha
- **Botão:** "Entrar"
- **Link:** "Não tem conta? Cadastre-se"
- **Estilo:** Card centralizado, fundo com gradiente verde

#### **5.5.3 Cadastro (`cadastro.js`)**
- **Campos:** Nome completo, Email, Senha, Confirmar senha
- **Botão:** "Criar conta"
- **Link:** "Já tem conta? Faça login"
- **Validação:** Senhas coincidem, email válido

#### **5.5.4 Perfil Básico (`perfilBasico.js`)**
- **Campos:** Data de nascimento, Peso atual (kg), Peso meta (kg), Altura (cm)
- **Botão:** "Salvar e continuar"
- **Descrição:** "Vamos personalizar sua experiência"
- **Estilo:** Cards com ícones para cada campo

#### **5.5.5 Home/Dashboard (`home.js`)**
- **Resumo do dia:**
  - Calorias consumidas / meta
  - Refeições planejadas
  - Posts da comunidade (últimos 3)
- **Acesso rápido:**
  - Botão "Ver plano alimentar"
  - Botão "Criar post"
  - Botão "Ver feed"
- **Estilo:** Cards coloridos, barras de progresso

#### **5.5.6 Plano Alimentar (`planoAlimentar.js`)**
- **Lista de planos ativos do usuário**
- **Cada plano mostra:** Título, período, calorias totais
- **Botão:** "+ Novo plano"
- **Ao clicar:** Navega para `#/planos/:id`

#### **5.5.7 Detalhe do Plano (`detalhePlano.js`)**
- **Cabeçalho:** Título do plano, período, calorias
- **Lista de refeições:** Café da manhã, Almoço, Lanche, Jantar
- **Cada refeição mostra:** Nome, horário, calorias, alimentos
- **Botão:** "+ Adicionar refeição"
- **Estilo:** Timeline vertical com ícones de relógio

#### **5.5.8 Feed da Comunidade (`feed.js`)**
- **Lista de posts:** Cards com avatar, nome, conteúdo, data
- **Tipos de post:** Texto, Dica, Evolução, Receita (com badges coloridos)
- **Interações:** Curtir, Comentar
- **Botão flutuante:** "+" para criar novo post
- **Estilo:** Cards empilhados, infinite scroll

#### **5.5.9 Criar Post (`criarPost.js`)**
- **Campos:** Conteúdo (textarea), Tipo (seleção: texto/dica/evolucao/receita)
- **Botão:** "Publicar"
- **Estilo:** Formulário simples, preview em tempo real

#### **5.5.10 Meu Perfil (`perfil.js`)**
- **Dados do usuário:** Nome, email
- **Evolução:** Peso atual vs peso meta, gráfico simples
- **Estatísticas:** Posts criados, tempo de uso
- **Botão:** "Editar perfil"
- **Botão:** "Sair" (logout)

### 5.6 Componentes Reutilizáveis

#### **Navbar (`navbar.js`)**
- **Desktop:** Logo à esquerda, links de navegação ao centro, avatar à direita
- **Mobile:** Menu hamburger, drawer lateral
- **Links:** Home, Planos, Feed, Perfil

#### **Card de Post (`cardPost.js`)**
- Avatar + nome do autor
- Badge do tipo de post (cor diferenciada)
- Conteúdo da publicação
- Data de criação
- Botões de curtir e comentar

#### **Card de Refeição (`cardRefeicao.js`)**
- Ícone do tipo de refeição (café, prato, copo)
- Nome e horário
- Lista de alimentos
- Total de calorias

#### **Modal (`modal.js`)**
- Componente genérico para confirmações e formulários
- Fundo escurecido, card centralizado
- Botões de confirmar/cancelar

#### **Toast (`toast.js`)**
- Notificações temporárias (sucesso, erro, info)
- Posição: canto inferior direito
- Animação de entrada/saída

### 5.7 Paleta de Cores (Baseada no Protótipo Figma)

```css
:root {
  /* Cores principais */
  --verde-primario: #2ECC71;      /* Saúde, natureza */
  --verde-escuro: #27AE60;        /* Hover, destaque */
  --laranja-secundario: #F39C12;  /* Energia, vitalidade */
  --laranja-escuro: #E67E22;      /* Hover do laranja */

  /* Neutros */
  --branco: #FFFFFF;
  --cinza-100: #F8F9FA;
  --cinza-200: #E9ECEF;
  --cinza-300: #DEE2E6;
  --cinza-500: #6C757D;
  --cinza-700: #495057;
  --cinza-900: #212529;

  /* Status */
  --sucesso: #2ECC71;
  --erro: #E74C3C;
  --aviso: #F39C12;
  --info: #3498DB;

  /* Tipografia */
  --fonte-principal: 'Inter', sans-serif;
  --raio-bordas: 12px;
  --sombra-card: 0 2px 8px rgba(0,0,0,0.08);
}
```

---

## 6. Fases de Implementação

### Fase 1 — Infraestrutura Backend (2-3 dias)
**Responsável:** Definir entre o grupo

| # | Tarefa | Arquivo | Dependência |
|---|--------|---------|-------------|
| 1.1 | Atualizar `package.json` com novas dependências | `api/package.json` | Nenhuma |
| 1.2 | Rodar `npm install` | Terminal | 1.1 |
| 1.3 | Reescrever `iniciarBanco.js` com as 5 tabelas | `api/iniciarBanco.js` | Nenhuma |
| 1.4 | Criar middleware de autenticação JWT | `api/src/middlewares/autenticacao.js` | 1.2 |
| 1.5 | Atualizar `validadores.js` com todas as validações | `api/src/utilitarios/validadores.js` | Nenhuma |
| 1.6 | Atualizar `app.js` com novas rotas e middlewares | `api/src/app.js` | 1.4 |

### Fase 2 — Controladores Backend (3-4 dias)
**Responsável:** Definir entre o grupo

| # | Tarefa | Arquivo | Dependência |
|---|--------|---------|-------------|
| 2.1 | Criar `usuarioControlador.js` (cadastro, login, perfil) | `api/src/controladores/usuarioControlador.js` | Fase 1 |
| 2.2 | Criar `postControlador.js` (CRUD de publicações) | `api/src/controladores/postControlador.js` | Fase 1 |
| 2.3 | Criar `planoControlador.js` (CRUD de planos e refeições) | `api/src/controladores/planoControlador.js` | Fase 1 |
| 2.4 | Criar `comentarioControlador.js` (comentários nos posts) | `api/src/controladores/comentarioControlador.js` | Fase 1 |
| 2.5 | Criar todas as rotas (`usuarioRotas.js`, `postRotas.js`, `planoRotas.js`, `comentarioRotas.js`) | `api/src/rotas/` | 2.1-2.4 |
| 2.6 | Testar todos os endpoints com ferramenta de API (Thunder Client/Insomnia) | Terminal/Extensão | 2.5 |

### Fase 3 — Estrutura Frontend (1-2 dias)
**Responsável:** Definir entre o grupo

| # | Tarefa | Arquivo | Dependência |
|---|--------|---------|-------------|
| 3.1 | Reescrever `index.html` como shell da SPA | `frontend/index.html` | Nenhuma |
| 3.2 | Criar `api.js` (serviço de chamadas HTTP) | `frontend/js/api.js` | Nenhuma |
| 3.3 | Criar `auth.js` (gerenciamento de token) | `frontend/js/auth.js` | Nenhuma |
| 3.4 | Criar `app.js` (roteador e inicialização) | `frontend/js/app.js` | 3.2, 3.3 |
| 3.5 | Criar `estilo.css` completo com paleta de cores e componentes | `frontend/css/estilo.css` | Nenhuma |

### Fase 4 — Páginas de Autenticação (2-3 dias)
**Responsável:** Definir entre o grupo

| # | Tarefa | Arquivo | Dependência |
|---|--------|---------|-------------|
| 4.1 | Criar página de Onboarding | `frontend/js/paginas/onboarding.js` | Fase 3 |
| 4.2 | Criar página de Login | `frontend/js/paginas/login.js` | Fase 3 |
| 4.3 | Criar página de Cadastro | `frontend/js/paginas/cadastro.js` | Fase 3 |
| 4.4 | Criar página de Perfil Básico | `frontend/js/paginas/perfilBasico.js` | Fase 3 |
| 4.5 | Integrar com API de autenticação | Todos | 4.2, 4.3, 4.4 + Fase 2 |

### Fase 5 — Páginas Principais (3-4 dias)
**Responsável:** Definir entre o grupo

| # | Tarefa | Arquivo | Dependência |
|---|--------|---------|-------------|
| 5.1 | Criar componente Navbar | `frontend/js/componentes/navbar.js` | Fase 3 |
| 5.2 | Criar componente Toast | `frontend/js/componentes/toast.js` | Fase 3 |
| 5.3 | Criar componente Modal | `frontend/js/componentes/modal.js` | Fase 3 |
| 5.4 | Criar página Home/Dashboard | `frontend/js/paginas/home.js` | 5.1-5.3 |
| 5.5 | Criar componente CardPost | `frontend/js/componentes/cardPost.js` | Fase 3 |
| 5.6 | Criar componente CardRefeicao | `frontend/js/componentes/cardRefeicao.js` | Fase 3 |
| 5.7 | Criar página Feed da Comunidade | `frontend/js/paginas/feed.js` | 5.5 |
| 5.8 | Criar página Criar Post | `frontend/js/paginas/criarPost.js` | Fase 3 |

### Fase 6 — Planos Alimentares (2-3 dias)
**Responsável:** Definir entre o grupo

| # | Tarefa | Arquivo | Dependência |
|---|--------|---------|-------------|
| 6.1 | Criar página Lista de Planos | `frontend/js/paginas/planoAlimentar.js` | Fase 3 |
| 6.2 | Criar página Detalhe do Plano | `frontend/js/paginas/detalhePlano.js` | 6.1 |
| 6.3 | Integrar com API de planos | Todos | 6.1, 6.2 + Fase 2 |

### Fase 7 — Perfil e Finalização (1-2 dias)
**Responsável:** Definir entre o grupo

| # | Tarefa | Arquivo | Dependência |
|---|--------|---------|-------------|
| 7.1 | Criar página Meu Perfil | `frontend/js/paginas/perfil.js` | Fase 3 |
| 7.2 | Testes integrados (frontend + backend) | Terminal | Todas |
| 7.3 | Ajustes finais de responsividade | `frontend/css/estilo.css` | 7.2 |
| 7.4 | Atualizar `README.md` com instruções finais | `README.md` | 7.2 |

---

## 7. Tempo Estimado Total

| Fase | Descrição | Dias Estimados |
|------|-----------|----------------|
| Fase 1 | Infraestrutura Backend | 2-3 dias |
| Fase 2 | Controladores Backend | 3-4 dias |
| Fase 3 | Estrutura Frontend | 1-2 dias |
| Fase 4 | Páginas de Autenticação | 2-3 dias |
| Fase 5 | Páginas Principais | 3-4 dias |
| Fase 6 | Planos Alimentares | 2-3 dias |
| Fase 7 | Perfil e Finalização | 1-2 dias |
| **Total** | | **14-21 dias** |

---

## 8. Distribuição de Tarefas entre a Equipe

| Integrante | Fases Responsáveis | Módulo Principal |
|------------|-------------------|------------------|
| **Matheus José** | Fase 1 + Fase 2 | Backend (API, Banco, Controladores) |
| **Márcio** | Fase 3 + Fase 4 | Frontend (Estrutura, Autenticação) |
| **Leonardo** | Fase 5 | Frontend (Páginas Principais, Componentes) |
| **João** | Fase 6 | Frontend (Planos Alimentares) |
| **Augusto** | Fase 7 + Testes | Integração, Testes, Documentação |

> **Nota:** Esta distribuição é sugerida e pode ser ajustada pelo grupo conforme disponibilidade.

---

## 9. Estratégia de Testes

### 9.1 Testes de Backend
- **Thunder Client** ou **Insomnia** para testar cada endpoint individualmente
- Verificar cenários de sucesso e erro
- Testar autenticação (rotas com e sem token)
- Validar sanitização de dados

### 9.2 Testes de Frontend
- Navegação entre todas as páginas
- Fluxo completo: Onboarding → Cadastro → Login → Home
- Criar post e verificar no feed
- Criar plano e adicionar refeições
- Responsividade em mobile (DevTools do navegador)

### 9.3 Testes de Integração
- Fluxo completo: cadastro → login → criar post → comentar
- Fluxo completo: cadastro → login → criar plano → adicionar refeições
- Verificar dados persistidos no banco SQLite

---

## 10. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Dificuldade com JWT | Alto | Estudar documentação oficial, usar exemplos prontos |
| Frontend SPA complexo | Médio | Começar simples, refatorar depois |
| Incompatibilidade de horários | Médio | Usar ferramentas de colaboração (GitHub, Figma) |
| Bugs de integração | Alto | Testar endpoints antes de conectar ao frontend |
| Escopo muito grande | Alto | Priorizar funcionalidades essenciais primeiro |

---

## 11. Funcionalidades Essenciais vs Desejáveis

### Essenciais (MVP)
- Cadastro e login de usuários
- Configuração de perfil (peso, meta, altura)
- Feed de posts da comunidade
- Criar e visualizar posts
- Criar planos alimentares com refeições
- Página de perfil do usuário

### Desejáveis (v2)
- Curtir posts
- Sistem a de seguidores
- Galeria de fotos (evolução)
- Notificações em tempo real
- Chat entre usuários
- Gráficos de progresso com Chart.js

---

*Documento elaborado em agosto de 2026 — Turma 2B Info · IFMT*
