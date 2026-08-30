# 📋 Histórias de Usuário - Aptus 2.0

**Data**: 2026-08-30  
**Versão**: 2.0 com IA  
**Status**: ✅ 100% Implementadas

---

## 📑 Índice

1. [US-01: Cadastro e Login](#us-01-cadastro-e-login)
2. [US-02: Perfil do Usuário](#us-02-perfil-do-usuário)
3. [US-03: Publicações na Comunidade](#us-03-publicações-na-comunidade)
4. [US-04: Visualizar Publicações](#us-04-visualizar-publicações)
5. [US-05: Comentar em Publicações](#us-05-comentar-em-publicações)
6. [US-06: Remover Publicações](#us-06-remover-publicações)
7. [US-07: Criar Plano Alimentar](#us-07-criar-plano-alimentar)
8. [US-08: Visualizar Plano Alimentar](#us-08-visualizar-plano-alimentar)
9. [US-09: Adicionar Refeição ao Plano](#us-09-adicionar-refeição-ao-plano)
10. [US-10: Editar Plano Alimentar](#us-10-editar-plano-alimentar)
11. [US-11: Excluir Plano Alimentar](#us-11-excluir-plano-alimentar)
12. [US-12: Acompanhar Minha Evolução](#us-12-acompanhar-minha-evolução)

---

## US-01: Cadastro e Login

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** realizar meu cadastro na plataforma  
**Para que** eu possa acessar todas as funcionalidades

### ✅ Critérios de Aceitação

- [x] Acessar tela de cadastro
- [x] Informar nome completo
- [x] Informar e-mail
- [x] Criar uma senha
- [x] Confirmar o cadastro
- [x] Receber mensagem de sucesso
- [x] Poder fazer login com e-mail e senha
- [x] Ser direcionado para a área principal

### 🔌 Endpoints Implementados

#### Cadastro
```http
POST /api/auth/registro
Content-Type: application/json

{
  "nome_completo": "Maria Silva",
  "email": "maria@email.com",
  "senha": "senha123"
}
```

**Response (201 - Sucesso):**
```json
{
  "sucesso": true,
  "mensagem": "Usuário cadastrado com sucesso!",
  "usuario": {
    "id": 1,
    "nome_completo": "Maria Silva",
    "email": "maria@email.com",
    "role": "user",
    "data_cadastro": "2026-08-30T10:30:00Z"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "maria@email.com",
  "senha": "senha123"
}
```

**Response (200 - Sucesso):**
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome_completo": "Maria Silva",
    "email": "maria@email.com",
    "role": "user"
  }
}
```

### 🧪 Teste

```bash
# 1. Cadastro
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Maria Silva",
    "email": "maria@email.com",
    "senha": "senha123"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@email.com",
    "senha": "senha123"
  }'
```

### 📊 Banco de Dados

**Tabela**: `usuarios`

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

## US-02: Perfil do Usuário

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** visualizar e atualizar meu perfil  
**Para que** eu possa gerenciar minhas informações pessoais e de saúde

### ✅ Critérios de Aceitação

- [x] Acessar meu perfil
- [x] Visualizar dados cadastrados
- [x] Informar/atualizar peso atual
- [x] Informar/atualizar peso-meta
- [x] Informar/atualizar altura
- [x] Salvar alterações
- [x] Receber confirmação de sucesso

### 🔌 Endpoints Implementados

#### Obter Perfil
```http
GET /api/usuarios/perfil
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "id": 1,
  "nome_completo": "Maria Silva",
  "email": "maria@email.com",
  "peso_atual": 85.5,
  "peso_meta": 70.0,
  "altura": 168,
  "data_nascimento": "1995-03-15",
  "bio": "Iniciando minha jornada de saúde",
  "foto_perfil_url": "https://...",
  "data_cadastro": "2026-08-30T10:30:00Z"
}
```

#### Atualizar Perfil
```http
PUT /api/usuarios/perfil
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "peso_atual": 83.0,
  "peso_meta": 70.0,
  "altura": 168,
  "bio": "Perdendo peso com saúde!"
}
```

**Response (200):**
```json
{
  "sucesso": true,
  "mensagem": "Perfil atualizado com sucesso!",
  "usuario": {
    "id": 1,
    "nome_completo": "Maria Silva",
    "peso_atual": 83.0,
    "peso_meta": 70.0,
    "altura": 168
  }
}
```

### 🧪 Teste

```bash
# Obter perfil
curl -X GET http://localhost:3000/api/usuarios/perfil \
  -H "Authorization: Bearer SEU_TOKEN"

# Atualizar perfil
curl -X PUT http://localhost:3000/api/usuarios/perfil \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "peso_atual": 83.0,
    "peso_meta": 70.0,
    "altura": 168
  }'
```

### 📊 Tabelas

**usuarios**: Dados principais
**historico_peso**: Registro de pesos por data

```sql
CREATE TABLE historico_peso (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  peso REAL NOT NULL,
  anotacao TEXT,
  data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)
```

---

## US-03: Publicações na Comunidade

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** criar uma publicação na comunidade  
**Para que** eu possa compartilhar minha experiência com outros usuários

### ✅ Critérios de Aceitação

- [x] Acessar área de publicações
- [x] Selecionar opção para criar publicação
- [x] Informar conteúdo
- [x] Selecionar tipo de publicação
- [x] Publicar conteúdo
- [x] Visualizar publicação no feed

### 📋 Tipos de Publicação

- **texto**: Publicação em texto simples
- **dica**: Dica sobre alimentação ou exercício
- **evolução**: Relato de progresso pessoal
- **receita**: Compartilhamento de receita saudável

### 🔌 Endpoints Implementados

#### Criar Publicação
```http
POST /api/feed
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "conteudo": "Consegui perder 3kg esta semana com a dieta!",
  "tipo": "evolucao"
}
```

**Response (201):**
```json
{
  "sucesso": true,
  "mensagem": "Publicação criada com sucesso!",
  "publicacao": {
    "id": 42,
    "usuario_id": 1,
    "conteudo": "Consegui perder 3kg esta semana com a dieta!",
    "tipo": "evolucao",
    "curtidas": 0,
    "comentarios_count": 0,
    "data_criacao": "2026-08-30T14:30:00Z"
  }
}
```

### 🧪 Teste

```bash
curl -X POST http://localhost:3000/api/feed \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conteudo": "Consegui perder 3kg!",
    "tipo": "evolucao"
  }'
```

### 📊 Banco de Dados

**Tabela**: `posts` ou `feed`

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  conteudo TEXT NOT NULL,
  tipo TEXT CHECK(tipo IN ('texto','dica','evolucao','receita')),
  curtidas INTEGER DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)
```

---

## US-04: Visualizar Publicações

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** visualizar as publicações da comunidade  
**Para que** eu possa acompanhar o progresso de outros usuários

### ✅ Critérios de Aceitação

- [x] Acessar feed de publicações
- [x] Visualizar lista de publicações
- [x] Selecionar publicação para detalhes
- [x] Visualizar comentários relacionados
- [x] Ver dados do autor
- [x] Pagination/scroll infinito

### 🔌 Endpoints Implementados

#### Listar Publicações
```http
GET /api/feed?pagina=1&limite=10
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "sucesso": true,
  "publicacoes": [
    {
      "id": 42,
      "usuario_id": 1,
      "usuario": {
        "nome_completo": "Maria Silva",
        "foto_perfil_url": "https://..."
      },
      "conteudo": "Consegui perder 3kg!",
      "tipo": "evolucao",
      "curtidas": 15,
      "comentarios_count": 3,
      "data_criacao": "2026-08-30T14:30:00Z"
    },
    // ... mais publicações
  ],
  "total": 150,
  "pagina": 1,
  "limite": 10
}
```

#### Obter Publicação Específica
```http
GET /api/feed/42
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "sucesso": true,
  "publicacao": {
    "id": 42,
    "usuario_id": 1,
    "usuario": {
      "id": 1,
      "nome_completo": "Maria Silva",
      "foto_perfil_url": "https://..."
    },
    "conteudo": "Consegui perder 3kg esta semana!",
    "tipo": "evolucao",
    "curtidas": 15,
    "comentarios": [
      {
        "id": 1,
        "usuario": { "nome_completo": "João" },
        "conteudo": "Parabéns!!!",
        "data_criacao": "2026-08-30T15:00:00Z"
      }
    ],
    "data_criacao": "2026-08-30T14:30:00Z"
  }
}
```

### 🧪 Teste

```bash
# Listar publicações
curl -X GET "http://localhost:3000/api/feed?pagina=1&limite=10" \
  -H "Authorization: Bearer SEU_TOKEN"

# Obter publicação específica
curl -X GET http://localhost:3000/api/feed/42 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## US-05: Comentar em Publicações

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** comentar em publicações de outros usuários  
**Para que** eu possa interagir e incentivar a comunidade

### ✅ Critérios de Aceitação

- [x] Acessar publicação
- [x] Selecionar opção de comentário
- [x] Digitar comentário
- [x] Enviar comentário
- [x] Visualizar comentário postado
- [x] Ver nome e foto do comentarista

### 🔌 Endpoints Implementados

#### Adicionar Comentário
```http
POST /api/feed/42/comentarios
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "conteudo": "Parabéns pelo progresso!"
}
```

**Response (201):**
```json
{
  "sucesso": true,
  "mensagem": "Comentário adicionado com sucesso!",
  "comentario": {
    "id": 1,
    "post_id": 42,
    "usuario_id": 2,
    "usuario": {
      "nome_completo": "João Silva"
    },
    "conteudo": "Parabéns pelo progresso!",
    "data_criacao": "2026-08-30T15:30:00Z"
  }
}
```

#### Listar Comentários
```http
GET /api/feed/42/comentarios
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "sucesso": true,
  "comentarios": [
    {
      "id": 1,
      "usuario": { "nome_completo": "João", "foto_perfil_url": "..." },
      "conteudo": "Parabéns!",
      "curtidas": 5,
      "data_criacao": "2026-08-30T15:30:00Z"
    }
  ]
}
```

### 🧪 Teste

```bash
# Adicionar comentário
curl -X POST http://localhost:3000/api/feed/42/comentarios \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conteudo": "Parabéns!"
  }'

# Listar comentários
curl -X GET http://localhost:3000/api/feed/42/comentarios \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 📊 Banco de Dados

**Tabela**: `comentarios`

```sql
CREATE TABLE comentarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  conteudo TEXT NOT NULL,
  curtidas INTEGER DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)
```

---

## US-06: Remover Publicações

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** remover uma publicação realizada por mim  
**Para que** eu possa deletar conteúdo que não desejo mais compartilhar

### ✅ Critérios de Aceitação

- [x] Acessar publicação própria
- [x] Selecionar opção de remover
- [x] Confirmar remoção
- [x] Publicação removida da comunidade
- [x] Receber confirmação de sucesso
- [x] Apenas proprietário ou admin podem remover

### 🔌 Endpoints Implementados

#### Remover Publicação
```http
DELETE /api/feed/42
Authorization: Bearer {JWT_TOKEN}
```

**Response (204 - No Content):**
```
(Sem corpo de resposta)
```

Ou com resposta:
```json
{
  "sucesso": true,
  "mensagem": "Publicação removida com sucesso!"
}
```

### 🧪 Teste

```bash
curl -X DELETE http://localhost:3000/api/feed/42 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 🔒 Segurança

- ✅ Validação de proprietário: `usuario_id == req.usuario.sub`
- ✅ Admin pode remover qualquer publicação
- ✅ Soft delete (ativo = 0) para manter histórico

---

## US-07: Criar Plano Alimentar

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** criar um plano alimentar personalizado  
**Para que** eu possa ter um guia estruturado para minha alimentação

### ✅ Critérios de Aceitação

- [x] Acessar área de planos alimentares
- [x] Selecionar opção para criar plano
- [x] Informar título
- [x] Informar descrição
- [x] Informar quantidade de calorias (opcional)
- [x] Informar data de início (opcional)
- [x] Informar data de término (opcional)
- [x] Salvar plano

### 🔌 Endpoints Implementados

#### Criar Plano Manualmente
```http
POST /api/planos
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "titulo": "Plano de Emagrecimento - Agosto",
  "descricao": "Plano com restrição calórica de 1800 kcal",
  "duracao_dias": 30,
  "calorias_alvo": 1800,
  "dificuldade": "moderado",
  "data_inicio": "2026-08-30",
  "data_fim": "2026-09-30"
}
```

**Response (201):**
```json
{
  "sucesso": true,
  "mensagem": "Plano criado com sucesso!",
  "plano": {
    "id": 5,
    "titulo": "Plano de Emagrecimento - Agosto",
    "descricao": "Plano com restrição calórica",
    "criado_por": 1,
    "duracao_dias": 30,
    "calorias_alvo": 1800,
    "data_criacao": "2026-08-30T10:30:00Z"
  }
}
```

#### ✨ Criar Plano com IA (NOVO)
```http
POST /api/ia/gerar-plano
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "objetivo": "emagrecimento",
  "dias": 7,
  "calorias": 1800,
  "alergias": ["amendoim"],
  "preferencias": ["frango", "saladas"],
  "restricoes": ["sem-gluten"],
  "salvar": true
}
```

**Response (201):**
```json
{
  "sucesso": true,
  "mensagem": "Plano alimentar gerado com sucesso!",
  "plano": {
    "titulo": "Plano de emagrecimento - 7 dias",
    "descricao": "Plano personalizado para perder peso...",
    "calorias_alvo": 1800,
    "dias": [
      {
        "dia": 1,
        "refeicoes": [
          {
            "nome": "Café da Manhã",
            "receita": {
              "titulo": "Omelete de Claras",
              "calorias": 150,
              "ingredientes": [...]
            }
          }
        ]
      }
    ]
  },
  "planosalvo": {
    "id": 5,
    "titulo": "Plano de emagrecimento - 7 dias"
  }
}
```

### 🧪 Teste

```bash
# Criar plano manualmente
curl -X POST http://localhost:3000/api/planos \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Meu Plano",
    "descricao": "Descrição",
    "calorias_alvo": 1800
  }'

# Criar plano com IA
curl -X POST http://localhost:3000/api/ia/gerar-plano \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "objetivo": "emagrecimento",
    "dias": 7,
    "calorias": 1800
  }'
```

### 📊 Banco de Dados

**Tabela**: `planos_alimentares`

```sql
CREATE TABLE planos_alimentares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  criado_por INTEGER NOT NULL,
  duracao_dias INTEGER,
  calorias_alvo INTEGER,
  dificuldade TEXT,
  tipo TEXT,
  data_inicio DATE,
  data_fim DATE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id)
)
```

---

## US-08: Visualizar Plano Alimentar

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** visualizar meus planos alimentares  
**Para que** eu possa acompanhar e executar meu plano

### ✅ Critérios de Aceitação

- [x] Acessar área de planos
- [x] Visualizar lista de planos
- [x] Selecionar um plano
- [x] Visualizar detalhes completos
- [x] Ver todas as refeições do plano
- [x] Ver macronutrientes

### 🔌 Endpoints Implementados

#### Listar Planos
```http
GET /api/planos
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "sucesso": true,
  "planos": [
    {
      "id": 5,
      "titulo": "Plano de Emagrecimento",
      "descricao": "Para perder peso...",
      "calorias_alvo": 1800,
      "duracao_dias": 30,
      "seguidores": 5,
      "data_criacao": "2026-08-30T10:30:00Z"
    }
  ]
}
```

#### Obter Plano com Detalhes
```http
GET /api/planos/5
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "sucesso": true,
  "plano": {
    "id": 5,
    "titulo": "Plano de Emagrecimento",
    "descricao": "Para perder peso...",
    "calorias_alvo": 1800,
    "duracao_dias": 30,
    "receitas": [
      {
        "id": 10,
        "titulo": "Frango Grelhado com Brócolis",
        "dia_plano": 1,
        "refeicao": "Almoço",
        "calorias": 450,
        "proteina": 40,
        "carboidrato": 30,
        "gordura": 15,
        "foto_url": "https://...",
        "ingredientes": [
          {
            "nome": "Peito de Frango",
            "quantidade": 150,
            "unidade": "gramas",
            "calorias_por_100g": 165
          }
        ]
      }
    ],
    "exercicios": [
      {
        "nome": "Corrida",
        "series_recomendadas": 3,
        "repeticoes_recomendadas": 10
      }
    ]
  }
}
```

### 🧪 Teste

```bash
# Listar planos
curl -X GET http://localhost:3000/api/planos \
  -H "Authorization: Bearer SEU_TOKEN"

# Obter plano específico
curl -X GET http://localhost:3000/api/planos/5 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## US-09: Adicionar Refeição ao Plano

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** adicionar refeições ao meu plano alimentar  
**Para que** eu possa detalhar o que comer em cada momento do dia

### ✅ Critérios de Aceitação

- [x] Acessar um plano alimentar
- [x] Selecionar opção para adicionar refeição
- [x] Informar nome da refeição
- [x] Informar horário
- [x] Informar calorias (opcional)
- [x] Informar alimentos
- [x] Salvar refeição
- [x] Visualizar refeição no plano

### 🔌 Endpoints Implementados

#### Adicionar Refeição Manualmente
```http
POST /api/planos/5/refeicoes
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "nome": "Almoço",
  "horario": "12:30",
  "receita_id": 10,
  "calorias": 450,
  "alimentos": "Frango 150g, Brócolis 200g, Arroz 100g"
}
```

**Response (201):**
```json
{
  "sucesso": true,
  "mensagem": "Refeição adicionada com sucesso!",
  "refeicao": {
    "id": 1,
    "plano_id": 5,
    "nome": "Almoço",
    "horario": "12:30",
    "receita": {
      "titulo": "Frango Grelhado",
      "calorias": 450,
      "ingredientes": [...]
    }
  }
}
```

#### ✨ Gerar Receita com IA
```http
POST /api/ia/gerar-receita
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "tipo": "almoço",
  "calorias": 450,
  "alergias": ["amendoim"],
  "preferencias": ["frango"]
}
```

**Response (201):**
```json
{
  "sucesso": true,
  "receita": {
    "id": 11,
    "titulo": "Frango Grelhado com Legumes",
    "descricao": "...",
    "modo_preparo": "1. Tempere o frango...",
    "calorias": 440,
    "proteina": 40,
    "carboidrato": 30,
    "gordura": 12,
    "foto_url": "https://...",
    "ingredientes": [
      {
        "nome": "Peito de Frango",
        "quantidade": 150,
        "unidade": "gramas"
      }
    ]
  }
}
```

### 🧪 Teste

```bash
# Adicionar refeição
curl -X POST http://localhost:3000/api/planos/5/refeicoes \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Almoço",
    "horario": "12:30"
  }'

# Gerar receita com IA
curl -X POST http://localhost:3000/api/ia/gerar-receita \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "almoço",
    "calorias": 450
  }'
```

### 📊 Banco de Dados

**Tabelas**: `planos_receitas` e `receitas_ingredientes` ✨ NOVO

```sql
CREATE TABLE planos_receitas (
  id INTEGER PRIMARY KEY,
  plano_id INTEGER NOT NULL,
  receita_id INTEGER NOT NULL,
  dia_plano INTEGER,
  refeicao TEXT,
  FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id),
  FOREIGN KEY (receita_id) REFERENCES receitas(id)
)

CREATE TABLE receitas_ingredientes (
  id INTEGER PRIMARY KEY,
  receita_id INTEGER NOT NULL,
  ingrediente_id INTEGER NOT NULL,
  quantidade REAL NOT NULL,
  unidade_medida TEXT NOT NULL,
  FOREIGN KEY (receita_id) REFERENCES receitas(id),
  FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id)
)
```

---

## US-10: Editar Plano Alimentar

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** editar meu plano alimentar  
**Para que** eu possa ajustar conforme meu progresso

### ✅ Critérios de Aceitação

- [x] Acessar meus planos
- [x] Selecionar plano a editar
- [x] Editar título
- [x] Editar descrição
- [x] Alterar calorias
- [x] Alterar duração
- [x] Salvar alterações
- [x] Visualizar plano atualizado

### 🔌 Endpoints Implementados

#### Atualizar Plano
```http
PUT /api/planos/5
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "titulo": "Plano de Emagrecimento - Revisado",
  "descricao": "Plano ajustado após 2 semanas",
  "calorias_alvo": 1700,
  "duracao_dias": 30
}
```

**Response (200):**
```json
{
  "sucesso": true,
  "mensagem": "Plano atualizado com sucesso!",
  "plano": {
    "id": 5,
    "titulo": "Plano de Emagrecimento - Revisado",
    "descricao": "Plano ajustado...",
    "calorias_alvo": 1700,
    "duracao_dias": 30
  }
}
```

### 🧪 Teste

```bash
curl -X PUT http://localhost:3000/api/planos/5 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Plano Revisado",
    "calorias_alvo": 1700
  }'
```

### 🔒 Segurança

- ✅ Apenas proprietário ou admin pode editar
- ✅ Validação de entrada
- ✅ Confirmação de propriedade antes de atualizar

---

## US-11: Excluir Plano Alimentar

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** excluir um plano alimentar  
**Para que** eu possa remover planos que não uso mais

### ✅ Critérios de Aceitação

- [x] Acessar meus planos
- [x] Selecionar plano a excluir
- [x] Selecionar opção de exclusão
- [x] Confirmar exclusão
- [x] Plano removido da lista
- [x] Receber confirmação

### 🔌 Endpoints Implementados

#### Excluir Plano
```http
DELETE /api/planos/5
Authorization: Bearer {JWT_TOKEN}
```

**Response (204 - No Content):**
```
(Sem corpo)
```

### 🧪 Teste

```bash
curl -X DELETE http://localhost:3000/api/planos/5 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 💾 Soft Delete

O sistema utiliza soft delete para manter histórico:
- Campo `ativo = 0` marca plano como deletado
- Dados permanecem no banco para auditoria
- Não aparecem nas listagens do usuário

---

## US-12: Acompanhar Minha Evolução

### 📝 Descrição

**Como** usuário do Aptus  
**Eu gostaria de** acompanhar minha evolução  
**Para que** eu possa visualizar meu progresso ao longo do tempo

### ✅ Critérios de Aceitação

- [x] Acessar meu perfil
- [x] Visualizar informações de progresso
- [x] Acompanhar peso atual
- [x] Visualizar meta de peso
- [x] Comparar progresso no tempo
- [x] Ver gráfico ou histórico de peso
- [x] Registrar novo peso

### 🔌 Endpoints Implementados

#### Registrar Novo Peso
```http
POST /api/usuarios/me/peso
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "peso": 82.5,
  "anotacao": "Após uma semana de dieta"
}
```

**Response (201):**
```json
{
  "sucesso": true,
  "mensagem": "Peso registrado com sucesso!",
  "historico": {
    "id": 1,
    "usuario_id": 1,
    "peso": 82.5,
    "anotacao": "Após uma semana...",
    "data_registro": "2026-08-30T10:30:00Z"
  }
}
```

#### Obter Histórico de Peso
```http
GET /api/usuarios/me/peso?dias=30
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "sucesso": true,
  "usuario": {
    "peso_atual": 82.5,
    "peso_meta": 70.0,
    "peso_inicial": 85.0,
    "progresso_percentual": 4.7
  },
  "historico": [
    {
      "peso": 85.0,
      "data_registro": "2026-08-01T10:30:00Z"
    },
    {
      "peso": 84.2,
      "data_registro": "2026-08-08T10:30:00Z"
    },
    {
      "peso": 82.5,
      "data_registro": "2026-08-30T10:30:00Z"
    }
  ],
  "estatisticas": {
    "total_perdido": 2.5,
    "media_perdida_semana": 0.625,
    "faltam_para_meta": -12.5
  }
}
```

#### ✨ Calcular Necessidades Nutricionais
```http
POST /api/ia/calcular-necessidades
Content-Type: application/json

{
  "peso": 82.5,
  "altura": 168,
  "idade": 30,
  "sexo": "feminino",
  "objetivo": "emagrecimento",
  "nivelAtividade": "moderado"
}
```

**Response (200):**
```json
{
  "sucesso": true,
  "metricas": {
    "tmb": 1450,
    "gasto_diario": 2175,
    "calorias_recomendadas": 1675
  },
  "macronutrientes": {
    "proteina": {
      "gramas_dia": 126,
      "percentual": 30
    },
    "carboidrato": {
      "gramas_dia": 189,
      "percentual": 45
    },
    "gordura": {
      "gramas_dia": 47,
      "percentual": 25
    }
  },
  "dica": "Você deve consumir 1675 calorias por dia para emagrecer."
}
```

### 🧪 Teste

```bash
# Registrar peso
curl -X POST http://localhost:3000/api/usuarios/me/peso \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "peso": 82.5,
    "anotacao": "Após uma semana"
  }'

# Obter histórico
curl -X GET "http://localhost:3000/api/usuarios/me/peso?dias=30" \
  -H "Authorization: Bearer SEU_TOKEN"

# Calcular necessidades
curl -X POST http://localhost:3000/api/ia/calcular-necessidades \
  -H "Content-Type: application/json" \
  -d '{
    "peso": 82.5,
    "altura": 168,
    "idade": 30,
    "sexo": "feminino",
    "objetivo": "emagrecimento",
    "nivelAtividade": "moderado"
  }'
```

### 📊 Banco de Dados

**Tabela**: `historico_peso`

```sql
CREATE TABLE historico_peso (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  peso REAL NOT NULL,
  anotacao TEXT,
  data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
)
```

---

## 📊 Resumo Técnico

### Total de Histórias: 12/12 ✅

| # | História | Status | Endpoints |
|---|----------|--------|-----------|
| 01 | Cadastro e Login | ✅ | 2 |
| 02 | Perfil do Usuário | ✅ | 2 |
| 03 | Publicações | ✅ | 1 |
| 04 | Visualizar Posts | ✅ | 2 |
| 05 | Comentários | ✅ | 2 |
| 06 | Remover Posts | ✅ | 1 |
| 07 | Criar Plano | ✅ | 2 (+IA) |
| 08 | Visualizar Plano | ✅ | 2 |
| 09 | Adicionar Refeição | ✅ | 2 (+IA) |
| 10 | Editar Plano | ✅ | 1 |
| 11 | Excluir Plano | ✅ | 1 |
| 12 | Acompanhar Evolução | ✅ | 3 (+IA) |

**Total de Endpoints**: 50+ (incluindo bônus de IA)

### Tecnologias

- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite3
- **Autenticação**: JWT
- **IA**: Claude 3.5 Sonnet (Anthropic)
- **Validação**: Validator.js
- **Segurança**: Helmet + CORS

---

## 🚀 Como Usar

### 1. Autenticar
```bash
# Registrar
POST /api/auth/registro

# Login
POST /api/auth/login
# Recebe TOKEN
```

### 2. Usar TOKEN em todas as requisições
```bash
Authorization: Bearer {TOKEN}
```

### 3. Consultar Documentação
- [GUIA_IA_PLANOS.md](./doc/GUIA_IA_PLANOS.md) - Endpoints de IA
- [README.md](./README.md) - Visão geral
- [SETUP_RAPIDO.md](./SETUP_RAPIDO.md) - Como começar

---

**Documento gerado**: 2026-08-30  
**Versão**: 2.0  
**Status**: ✅ Completo e Testado

Para reportar issues: https://github.com/Matheus064/aptus/issues
