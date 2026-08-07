# Aptus — Rede Social para Emagrecimento Saudável

---

## 📋 Sobre o Projeto

O **Aptus** é uma plataforma web Full Stack que conecta pessoas com obesidade ou má alimentação, oferecendo uma **rede social de apoio mútuo** e **planos de alimentação personalizados** para auxiliar na jornada de emagrecimento saudável.

A ideia central é criar um ambiente seguro e motivador onde os usuários podem:

- **Compartilhar experiências** e evolução ao longo do processo de emagrecimento.
- **Receber orientação nutricional** com planos de alimentação adaptados ao perfil de cada pessoa.
- **Interagir com outras pessoas** que passam pela mesma situação, formando uma comunidade de apoio.
- **Acompanhar seu progresso** de forma visual e organizada.

O projeto segue boas práticas de arquitetura de software, com validação e sanitização de dados, segurança HTTP com Helmet e navegação responsiva sem recarregamento de página.

---

## 🎯 Objetivos

- Promover a conscientização sobre alimentação saudável e emagrecimento de forma sustentável.
- Oferecer uma rede social dedicada ao público que busca melhorar sua qualidade de vida.
- Disponibilizar planos de alimentação personalizados com base no perfil do usuário.
- Criar uma comunidade de apoio onde ninguém precisa enfrentar a jornada sozinho.
- Utilizar tecnologia para aproximar pessoas e incentivar hábitos mais saudáveis.

---

## 🛠️ Tecnologias Utilizadas

### **Backend (API RESTful)**
- **Node.js** — Ambiente de execução JavaScript no servidor.
- **Express.js** — Framework web minimalista e rápido para rotas e middlewares.
- **better-sqlite3** — Driver síncrono e de alta performance para o banco SQLite.
- **Helmet** — Middleware para configuração de cabeçalhos de segurança HTTP.
- **CORS** — Habilitação de Cross-Origin Resource Sharing.
- **Validator** — Biblioteca para sanitização e validação avançada de dados de entrada.
- **Dotenv** — Gerenciamento de variáveis de ambiente.

### **Frontend (Interface do Usuário)**
- **HTML5 Semântico** — Marcação acessível e estruturada.
- **Tailwind CSS** — Framework CSS utilitário para design responsivo e moderno.
- **JavaScript ES6+ (Vanilla)** — Lógica do cliente, manipulação do DOM e chamadas assíncronas via `fetch`.

---

## 📁 Estrutura do Projeto

```text
aptus/
├── api/                          # Servidor Backend em Node.js
│   ├── db/                       # Banco de dados SQLite (criado em runtime)
│   │   └── aptus.db              # Arquivo da base de dados local
│   ├── src/
│   │   ├── config/
│   │   │   └── conexaoBanco.js   # Inicialização e conexão do SQLite
│   │   ├── controladores/
│   │   │   ├── usuarioControlador.js   # Cadastro e autenticação de usuários
│   │   │   ├── postControlador.js      # Publicações e interações na rede social
│   │   │   └── planoControlador.js     # Gerenciamento de planos alimentares
│   │   ├── rotas/
│   │   │   ├── usuarioRotas.js   # Rotas de autenticação e perfil
│   │   │   ├── postRotas.js      # Rotas de publicações
│   │   │   └── planoRotas.js     # Rotas de planos alimentares
│   │   ├── utilitarios/
│   │   │   └── validadores.js    # Sanitização e validação dos inputs
│   │   ├── app.js                # Configuração do Express e Middlewares
│   │   └── server.js             # Inicialização da porta e servidor
│   ├── .env                      # Variáveis de ambiente
│   ├── iniciarBanco.js           # DDL de criação das tabelas
│   └── package.json              # Dependências e scripts do Node.js
│
├── frontend/                     # Interface Web
│   ├── css/
│   │   └── estilo.css            # Estilos CSS adicionais
│   ├── js/
│   │   └── app.js                # Script client-side (interações e Fetch API)
│   └── index.html                # Estrutura visual da aplicação
│
├── doc/                          # Documentação técnica do projeto
│
├── .gitignore                    # Arquivos ignorados pelo Git
└── README.md                     # Documentação oficial do repositório
```

---

## 🗄️ Modelagem do Banco de Dados (SQLite)

O banco de dados SQLite é inicializado automaticamente na subida da aplicação através do script `iniciarBanco.js`.

### **Tabela `usuarios`**

```sql
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

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
```

### **Tabela `posts`**

```sql
CREATE TABLE IF NOT EXISTS posts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER NOT NULL,
    conteudo        TEXT    NOT NULL,
    tipo            TEXT    DEFAULT 'texto'
                        CHECK(tipo IN ('texto','dica','evolucao','receita')),
    data_criacao    TEXT    DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_usuario ON posts(usuario_id);
CREATE INDEX IF NOT EXISTS idx_posts_data ON posts(data_criacao);
```

### **Tabela `planos_alimentares`**

```sql
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

CREATE INDEX IF NOT EXISTS idx_planos_usuario ON planos_alimentares(usuario_id);
```

### **Tabela `refeicoes`**

```sql
CREATE TABLE IF NOT EXISTS refeicoes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    plano_id        INTEGER NOT NULL,
    nome            TEXT    NOT NULL,
    horario         TEXT    DEFAULT NULL,
    calorias        INTEGER DEFAULT NULL,
    alimentos       TEXT    DEFAULT NULL,
    FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refeicoes_plano ON refeicoes(plano_id);
```

### **Tabela `comentarios`**

```sql
CREATE TABLE IF NOT EXISTS comentarios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id         INTEGER NOT NULL,
    usuario_id      INTEGER NOT NULL,
    conteudo        TEXT    NOT NULL,
    data_criacao    TEXT    DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comentarios_post ON comentarios(post_id);
```

---

## 🚀 Endpoints da API

### **Autenticação e Usuários**

| Método | Endpoint | Descrição | Payload (Body) |
|---|---|---|---|
| `POST` | `/api/usuarios/cadastro` | Cadastra um novo usuário | JSON (nome, email, senha) |
| `POST` | `/api/usuarios/login` | Realiza login do usuário | JSON (email, senha) |
| `GET` | `/api/usuarios/perfil` | Retorna o perfil do usuário logado | — |
| `PUT` | `/api/usuarios/perfil` | Atualiza dados do perfil | JSON (peso_atual, peso_meta, altura) |

### **Publicações (Rede Social)**

| Método | Endpoint | Descrição | Payload (Body) |
|---|---|---|---|
| `POST` | `/api/posts` | Cria uma nova publicação | JSON (conteudo, tipo) |
| `GET` | `/api/posts` | Lista publicações da comunidade | — |
| `GET` | `/api/posts/:id` | Retorna uma publicação específica | — |
| `DELETE` | `/api/posts/:id` | Remove uma publicação | — |
| `POST` | `/api/posts/:id/comentarios` | Adiciona comentário a uma publicação | JSON (conteudo) |
| `GET` | `/api/posts/:id/comentarios` | Lista comentários de uma publicação | — |

### **Planos Alimentares**

| Método | Endpoint | Descrição | Payload (Body) |
|---|---|---|---|
| `POST` | `/api/planos` | Cria um novo plano alimentar | JSON (titulo, descricao, calorias_total, data_inicio, data_fim) |
| `GET` | `/api/planos` | Lista planos do usuário logado | — |
| `GET` | `/api/planos/:id` | Retorna detalhes de um plano com suas refeições | — |
| `PUT` | `/api/planos/:id` | Atualiza um plano alimentar | JSON (titulo, descricao, calorias_total) |
| `DELETE` | `/api/planos/:id` | Remove um plano alimentar | — |
| `POST` | `/api/planos/:id/refeicoes` | Adiciona uma refeição ao plano | JSON (nome, horario, calorias, alimentos) |

### **Exemplo de Requisição — Cadastro de Usuário**

**`POST /api/usuarios/cadastro`**

**Body (JSON):**
```json
{
  "nome_completo": "Maria Silva",
  "email": "maria.silva@exemplo.com",
  "senha": "minha_senha_segura"
}
```

**Resposta de Sucesso (HTTP 201):**
```json
{
  "sucesso": true,
  "mensagem": "Usuário cadastrado com sucesso!"
}
```

**Resposta de Erro (HTTP 422):**
```json
{
  "sucesso": false,
  "mensagem": "E-mail inválido.",
  "erros": [
    "Informe um endereço de e-mail válido."
  ]
}
```

---

## 🔧 Como Executar o Projeto no VS Code (Windows & Linux Ubuntu)

### **Pré-requisitos**
- **Node.js** (v18 ou superior) e **npm** instalados.
- **Git** instalado.

> **Dica para Linux (Ubuntu/Debian):** Caso precise instalar o Node.js e Git no Ubuntu antes de abrir no VS Code:
> ```bash
> sudo apt update
> sudo apt install -y nodejs npm git
> ```

---

### **Como Iniciar o Projeto (via Terminal do VS Code)**

1. **Abra a pasta do projeto no VS Code:**
   - Acesse o menu **Arquivo > Abrir Pasta...** (ou `File > Open Folder...` no Linux) e selecione a pasta `aptus`.

2. **Abra o Terminal Integrado do VS Code:**
   - Pressione o atalho **`Ctrl` + `'`** (ou `Ctrl` + `J` / `Ctrl` + `~`).
   - Ou acesse o menu superior **Terminal > Novo Terminal**.

3. **Navegue até a pasta `api` e instale as dependências (necessário na primeira execução):**
   ```bash
   cd api
   npm install
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação no navegador:**
   - **Aplicação:** [http://localhost:3000/](http://localhost:3000/)
   - **Health Check da API:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

### **Como Parar o Servidor**

1. **Método Padrão no VS Code (Windows & Linux Ubuntu):**
   - Com a janela do terminal integrada focada no VS Code, pressione **`Ctrl` + `C`**.
   - No Windows, se perguntado `Deseja fechar o arquivo em lote (S/N)?`, digite **`S`** e pressione **Enter**. No Linux, o processo será encerrado imediatamente.

2. **Liberar Porta Ocupada (caso receba o erro `EADDRINUSE: address already in use :::3000`):**
   - **No Linux (Ubuntu/Debian):**
     ```bash
     sudo fuser -k 3000/tcp
     ```
   - **No Windows (PowerShell):**
     ```powershell
     Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
     ```

---

## 🛡️ Segurança e Boas Práticas

- **Prepared Statements:** Uso de consultas preparadas via `better-sqlite3` prevenindo ataques de **SQL Injection**.
- **Sanitização de Entradas:** Limpeza de strings com a biblioteca `validator` para evitar inserção de conteúdos maliciosos (**XSS**).
- **Proteção contra Payload Abusivo:** Middleware configurado com limite de `10kb` por requisição.
- **Respostas Padronizadas:** Tratamento transparente de erros com códigos HTTP semânticos (200, 201, 400, 422, 500).
- **Autenticação Segura:** Senhas armazenadas com hash e rotas protegidas por autenticação.

---

## 📜 Licença e Créditos

Projeto desenvolvido para fins educacionais e acadêmicos no IFMT — Instituto Federal de Mato Grosso, turma 2B de Informática, 2026.

---

## 👥 Equipe de Desenvolvimento — Turma 2B Info · IFMT 2026

- **Matheus José**
- **Márcio**
- **Leonardo**
- **João**
- **Augusto**
