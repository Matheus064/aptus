# Aptus — Rede Social para Emagrecimento Saudável

Plataforma web Full Stack que conecta pessoas com obesidade ou má alimentação, oferecendo uma **rede social de apoio mútuo** e **planos de alimentação personalizados** para auxiliar na jornada de emagrecimento saudável.

---

## 📋 Sobre o Projeto

O **Aptus 2.0** é uma evolução completa da plataforma original, desenvolvida com arquitetura moderna e escalável. A ideia central é criar um ambiente seguro e motivador onde os usuários podem:

- 🤝 **Compartilhar experiências** e evolução ao longo do processo de emagrecimento
- 🥗 **Receber orientação nutricional** com planos de alimentação adaptados ao perfil de cada pessoa
- 👥 **Interagir com outras pessoas** que passam pela mesma situação, formando uma comunidade de apoio
- 📊 **Acompanhar seu progresso** de forma visual e organizada com métricas de peso e evolução
- 💬 **Manter conversas privadas** com usuários e participar de grupos de suporte
- 👨‍⚕️ **Contar com profissionais** nutricionistas verificados para guiar a jornada

O projeto segue boas práticas de arquitetura de software, com validação e sanitização de dados, segurança HTTP com Helmet, autenticação robusta e navegação responsiva.

---

## 🎯 Objetivos

- Promover a conscientização sobre alimentação saudável e emagrecimento de forma sustentável
- Oferecer uma rede social dedicada ao público que busca melhorar sua qualidade de vida
- Disponibilizar planos de alimentação personalizados com base no perfil do usuário
- Criar uma comunidade de apoio onde ninguém precisa enfrentar a jornada sozinho
- Utilizar tecnologia para aproximar pessoas, conectar profissionais e incentivar hábitos mais saudáveis

---

## 🛠️ Tecnologias Utilizadas

### Backend (API RESTful)
- **Node.js** — Ambiente de execução JavaScript no servidor
- **Express.js** — Framework web minimalista e rápido para rotas e middlewares
- **better-sqlite3** — Driver síncrono e de alta performance para o banco SQLite
- **Helmet** — Middleware para configuração de cabeçalhos de segurança HTTP
- **CORS** — Habilitação de Cross-Origin Resource Sharing
- **Validator** — Biblioteca para sanitização e validação avançada de dados
- **Dotenv** — Gerenciamento de variáveis de ambiente
- **Jsonwebtoken** — Geração e validação de tokens JWT para autenticação

### Frontend (Interface do Usuário)
- **Vite** — Build tool moderno e rápido
- **React** — Biblioteca JavaScript para UI reativa
- **Tailwind CSS** — Framework CSS utilitário para design responsivo
- **JavaScript ES6+** — Lógica do cliente e chamadas assíncronas via Fetch API

---

## 📁 Estrutura do Projeto

```
aptus/
├── api/                              # Servidor Backend em Node.js
│   ├── db/                           # Banco de dados SQLite (criado em runtime)
│   │   └── aptus.db                  # Arquivo da base de dados local
│   ├── src/
│   │   ├── config/
│   │   │   └── conexaoBanco.js       # Inicialização e conexão do SQLite
│   │   ├── controladores/            # Lógica de negócio
│   │   │   ├── usuarioControlador.js # Cadastro, login e perfil
│   │   │   ├── postControlador.js    # Publicações e feed social
│   │   │   ├── planoControlador.js   # Gestão de planos alimentares
│   │   │   ├── nutriconistaControlador.js # Verificação profissional
│   │   │   └── adminControlador.js   # Painel administrativo
│   │   ├── rotas/                    # Definição de endpoints
│   │   │   ├── usuarioRotas.js       # Rotas de autenticação e perfil
│   │   │   ├── postRotas.js          # Rotas de publicações
│   │   │   ├── planoRotas.js         # Rotas de planos alimentares
│   │   │   ├── mensagensRotas.js     # Rotas de conversas e grupos
│   │   │   └── adminRotas.js         # Rotas de administração
│   │   ├── utilitarios/
│   │   │   ├── validadores.js        # Sanitização e validação dos inputs
│   │   │   └── autenticacao.js       # Middleware de autenticação JWT
│   │   ├── app.js                    # Configuração do Express e Middlewares
│   │   └── server.js                 # Inicialização da porta e servidor
│   ├── .env                          # Variáveis de ambiente (não fazer commit)
│   ├── .env.example                  # Template de variáveis de ambiente
│   ├── iniciarBanco.js               # Script DDL para criar tabelas
│   └── package.json                  # Dependências e scripts do Node.js
│
├── frontend/                         # Interface Web (Vite + React)
│   ├── src/
│   │   ├── components/               # Componentes React reutilizáveis
│   │   ├── pages/                    # Páginas da aplicação
│   │   ├── services/                 # Chamadas à API
│   │   ├── styles/                   # Estilos globais
│   │   └── App.jsx                   # Componente raiz
│   ├── index.html                    # HTML principal
│   ├── vite.config.js                # Configuração do Vite
│   └── package.json                  # Dependências do frontend
│
├── doc/                              # Documentação técnica
├── .gitignore                        # Arquivos ignorados pelo Git
└── README.md                         # Este arquivo
```

---

## 🗄️ Modelagem do Banco de Dados (SQLite)

O banco de dados SQLite é inicializado automaticamente na subida da aplicação através do script `iniciarBanco.js`.

### Tabelas principais

#### **`usuarios`**
Armazena dados dos usuários registrados na plataforma.

```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo       TEXT NOT NULL,
    email               TEXT NOT NULL UNIQUE,
    senha               TEXT NOT NULL,
    data_nascimento     TEXT DEFAULT NULL,
    peso_atual          REAL DEFAULT NULL,
    peso_meta           REAL DEFAULT NULL,
    altura              REAL DEFAULT NULL,
    tipo_usuario        TEXT DEFAULT 'user' CHECK(tipo_usuario IN ('user', 'nutricionista', 'admin')),
    crn_nutricionista   TEXT DEFAULT NULL,
    verificado          INTEGER DEFAULT 0,
    data_cadastro       TEXT DEFAULT (datetime('now','localtime'))
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);
```

#### **`posts`**
Publicações da comunidade (textos, dicas, evolução, receitas).

```sql
CREATE TABLE IF NOT EXISTS posts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER NOT NULL,
    conteudo        TEXT NOT NULL,
    tipo            TEXT DEFAULT 'texto' CHECK(tipo IN ('texto','dica','evolucao','receita')),
    data_criacao    TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_usuario ON posts(usuario_id);
CREATE INDEX IF NOT EXISTS idx_posts_data ON posts(data_criacao);
```

#### **`planos_alimentares`**
Planos personalizados de alimentação para cada usuário.

```sql
CREATE TABLE IF NOT EXISTS planos_alimentares (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER NOT NULL,
    titulo          TEXT NOT NULL,
    descricao       TEXT DEFAULT NULL,
    calorias_total  INTEGER DEFAULT NULL,
    data_inicio     TEXT DEFAULT NULL,
    data_fim        TEXT DEFAULT NULL,
    ativo           INTEGER DEFAULT 1,
    data_criacao    TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_planos_usuario ON planos_alimentares(usuario_id);
```

#### **`refeicoes`**
Refeições que compõem um plano alimentar.

```sql
CREATE TABLE IF NOT EXISTS refeicoes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    plano_id        INTEGER NOT NULL,
    nome            TEXT NOT NULL,
    horario         TEXT DEFAULT NULL,
    calorias        INTEGER DEFAULT NULL,
    alimentos       TEXT DEFAULT NULL,
    FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refeicoes_plano ON refeicoes(plano_id);
```

#### **`comentarios`**
Comentários nas publicações da comunidade.

```sql
CREATE TABLE IF NOT EXISTS comentarios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id         INTEGER NOT NULL,
    usuario_id      INTEGER NOT NULL,
    conteudo        TEXT NOT NULL,
    data_criacao    TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comentarios_post ON comentarios(post_id);
```

#### **`mensagens`**
Conversas privadas entre usuários.

```sql
CREATE TABLE IF NOT EXISTS mensagens (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER NOT NULL,
    receptor_id     INTEGER NOT NULL,
    conteudo        TEXT NOT NULL,
    data_criacao    TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (receptor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mensagens_usuario ON mensagens(usuario_id);
```

---

## 🚀 Endpoints da API

### Autenticação
| Método | Endpoint | Descrição | Payload |
|--------|----------|-----------|---------|
| POST | `/api/auth/registro` | Cadastra novo usuário | `{nome_completo, email, senha}` |
| POST | `/api/auth/login` | Realiza login | `{email, senha}` |
| POST | `/api/auth/verificar-nutricionista` | Verifica CRN do nutricionista | `{crn}` |

### Usuários
| Método | Endpoint | Descrição | Payload |
|--------|----------|-----------|---------|
| GET | `/api/usuarios/perfil` | Retorna perfil do usuário logado | — |
| PUT | `/api/usuarios/perfil` | Atualiza dados do perfil | `{peso_atual, peso_meta, altura}` |
| GET | `/api/usuarios/:id` | Retorna perfil público de um usuário | — |

### Publicações (Feed Social)
| Método | Endpoint | Descrição | Payload |
|--------|----------|-----------|---------|
| POST | `/api/posts` | Cria nova publicação | `{conteudo, tipo}` |
| GET | `/api/posts` | Lista publicações do feed | — |
| GET | `/api/posts/:id` | Retorna publicação específica | — |
| DELETE | `/api/posts/:id` | Remove uma publicação | — |
| POST | `/api/posts/:id/comentarios` | Adiciona comentário | `{conteudo}` |
| GET | `/api/posts/:id/comentarios` | Lista comentários | — |

### Planos Alimentares
| Método | Endpoint | Descrição | Payload |
|--------|----------|-----------|---------|
| POST | `/api/planos` | Cria novo plano | `{titulo, descricao, calorias_total, data_inicio, data_fim}` |
| GET | `/api/planos` | Lista planos do usuário | — |
| GET | `/api/planos/:id` | Retorna detalhes com refeições | — |
| PUT | `/api/planos/:id` | Atualiza plano | `{titulo, descricao, calorias_total}` |
| DELETE | `/api/planos/:id` | Remove plano | — |
| POST | `/api/planos/:id/refeicoes` | Adiciona refeição | `{nome, horario, calorias, alimentos}` |

### Comunidade
| Método | Endpoint | Descrição | Payload |
|--------|----------|-----------|---------|
| POST | `/api/usuarios/:id/seguir` | Segue um usuário | — |
| POST | `/api/planos/:id/seguir` | Segue um plano | — |
| POST | `/api/comunidade/reportes` | Reporta conteúdo | `{descricao, tipo}` |

### Mensagens e Grupos
| Método | Endpoint | Descrição | Payload |
|--------|----------|-----------|---------|
| GET | `/api/mensagens/conversas` | Lista conversas do usuário | — |
| POST | `/api/mensagens` | Envia mensagem | `{receptor_id, conteudo}` |
| GET | `/api/mensagens/grupos` | Lista grupos | — |
| POST | `/api/mensagens/grupos` | Cria novo grupo | `{nome, descricao}` |

### Administração (apenas admin)
| Método | Endpoint | Descrição | Payload |
|--------|----------|-----------|---------|
| GET | `/api/admin/dashboard` | Dashboard com métricas | — |
| GET | `/api/admin/metricas/saude` | Métricas de saúde agregadas | — |
| GET | `/api/admin/moderacao/reportes` | Reportes de moderação | — |
| PUT | `/api/admin/usuarios/:id/bloquear` | Bloqueia um usuário | — |
| PUT | `/api/admin/nutricionistas/:id/verificar` | Verifica profissional | `{aprovado}` |

---

## 👥 Papéis e Permissões

### User (Usuário Comum)
- Criar e editar publicações próprias
- Comentar em publicações
- Criar e gerenciar planos pessoais
- Registrar peso e acompanhar evolução
- Enviar mensagens privadas
- Participar de grupos de suporte
- Seguir outros usuários

### Nutricionista
- Todas as permissões de User
- Criar receitas e exercícios
- Criar planos para comunidade
- Criar e moderar grupos de suporte
- Verificar CRN profissional

### Admin
- Todas as permissões anteriores
- Acessar dashboard administrativo
- Moderação de conteúdo
- Bloquear/desbloquear usuários
- Verificar nutricionistas
- Visualizar métricas agregadas de saúde

---

## 🔨 Como Executar o Projeto

### Pré-requisitos
- **Node.js** v18 ou superior
- **npm** (gerenciador de pacotes)
- **Git** instalado

### Instalação e Execução

1. **Clone o repositório**
   ```bash
   git clone https://github.com/Matheus064/aptus.git
   cd aptus
   ```

2. **Instale e inicie o Backend (API)**
   ```bash
   cd api
   cp .env.example .env
   npm install
   npm run dev
   ```
   A API estará disponível em `http://localhost:3000`

3. **Em outro terminal, instale e inicie o Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   O Vite exibirá a URL local (geralmente `http://localhost:5173`)

4. **Verifique se está funcionando**
   - Health Check: `GET http://localhost:3000/api/health`
   - Aplicação: acesse a URL do frontend no navegador

### Parar a Aplicação

- Pressione **Ctrl + C** no terminal para interromper qualquer serviço
- No Windows, confirme digitando `S` se perguntado

### Liberar Porta Ocupada (Linux)
```bash
sudo fuser -k 3000/tcp
```

---

## 🛡️ Segurança e Boas Práticas

- ✅ **Prepared Statements**: Consultas preparadas via better-sqlite3 prevenindo SQL Injection
- ✅ **Sanitização de Entradas**: Limpeza com validator para evitar XSS
- ✅ **Proteção de Payload**: Limite de requisições para prevenir abuso
- ✅ **Autenticação JWT**: Tokens seguros para proteger rotas
- ✅ **Hashing de Senhas**: Senhas armazenadas com segurança
- ✅ **CORS Configurado**: Controle de origem de requisições
- ✅ **Helmet**: Headers HTTP de segurança

---

## 📊 Limites de Integração

Uploads locais estão preparados para fotos e vídeos. Para produção, os seguintes recursos exigem credenciais externas:

- Push notifications
- Envio de e-mails
- Streaming de vídeo
- Integração com wearables
- Recomendações por IA

---

## 📜 Licença e Créditos

Projeto desenvolvido para fins educacionais no **IFMT — Instituto Federal de Mato Grosso**, turma 2B de Informática, 2026.

### 👥 Equipe de Desenvolvimento — Turma 2B Info · IFMT 2026

- **Matheus José**
- **Márcio**
- **Leonardo**
- **João**
- **Augusto**

---

## 🔗 Links Úteis

- **Repositório**: [github.com/Matheus064/aptus](https://github.com/Matheus064/aptus)
- **Issues & Discussões**: Abra uma issue no GitHub para dúvidas e sugestões
