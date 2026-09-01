# 🚀 Guia: Migração SQLite → PostgreSQL

## Por que PostgreSQL?

| Aspecto | SQLite | PostgreSQL |
|--------|--------|-----------|
| **Escalabilidade** | Até ~100 conexões | Milhares de conexões |
| **Concorrência** | Limitada | Excelente |
| **Performance** | ~1k ops/s | 100k+ ops/s |
| **Produção** | ❌ Não recomendado | ✅ Padrão industrial |
| **Credibilidade** | ⚠️ Hobby projects | ✅ Empresas |
| **Replicação** | ❌ Não | ✅ Sim |

## Passo 1: Instalar PostgreSQL Localmente

### Ubuntu/Debian
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Windows
Baixe em: https://www.postgresql.org/download/windows/

## Passo 2: Criar Database

```bash
# Conectar como admin
sudo -u postgres psql

# Dentro do psql:
CREATE DATABASE aptus_db;
CREATE USER aptus_user WITH PASSWORD 'sua-senha-segura';
ALTER ROLE aptus_user SET client_encoding TO 'utf8';
ALTER ROLE aptus_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE aptus_user SET default_transaction_deferrable TO on;
ALTER ROLE aptus_user SET default_transaction_read_only TO off;
ALTER ROLE aptus_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE aptus_db TO aptus_user;
\q
```

## Passo 3: Instalar Driver PostgreSQL

```bash
cd api
npm install pg knex dotenv

# dotenv já deve estar instalado
# pg = driver PostgreSQL
# knex = query builder (facilita migrações)
```

## Passo 4: Atualizar Configuração

### Novo arquivo: `api/src/config/conexaoBanco.js`

```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Detectar ambiente
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Configurar pool de conexões
const pool = new Pool({
  user: process.env.DB_USER || 'aptus_user',
  password: process.env.DB_PASSWORD || 'sua-senha',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'aptus_db',
  max: isProduction ? 20 : 5,  // Pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Logs
pool.on('connect', () => {
  console.log('✓ Nova conexão PostgreSQL estabelecida');
});

pool.on('error', (err) => {
  console.error('✗ Erro no pool PostgreSQL:', err);
});

// Helpers
const executar = (sql, params = []) => pool.query(sql, params);
const buscar = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
};
const listar = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows;
};

// Inicializar schema
const inicializarBanco = async () => {
  try {
    console.log('📊 Criando tabelas PostgreSQL...');

    // Criar extensão UUID
    await executar('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Criar tabelas (veja schema.sql abaixo)
    const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('✓ Banco inicializado com sucesso!');
  } catch (erro) {
    console.error('✗ Erro ao inicializar banco:', erro);
    throw erro;
  }
};

// Fechar conexões
const fecharBanco = async () => {
  await pool.end();
  console.log('Conexões PostgreSQL fechadas');
};

module.exports = {
  pool,
  executar,
  buscar,
  listar,
  inicializarBanco,
  fecharBanco
};
```

### Atualizar `.env`

```env
# PostgreSQL
DB_USER=aptus_user
DB_PASSWORD=sua-senha-segura
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aptus_db

# JWT
JWT_SECRET=sua-chave-secreta-min-32-chars
JWT_EXPIRACAO=24h

# Node
NODE_ENV=development
PORT=3000
ORIGEM_PERMITIDA=*
```

## Passo 5: Criar Schema PostgreSQL

### Novo arquivo: `api/src/schema.sql`

```sql
-- =============================================
-- EXTENSÕES
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- TABELA: USUARIOS
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE COLLATE "C",
  telefone VARCHAR(20),
  senha VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'nutricionista', 'admin')),
  peso_atual DECIMAL(5, 2),
  peso_meta DECIMAL(5, 2),
  altura DECIMAL(5, 2),
  data_nascimento DATE,
  numero_crn VARCHAR(20) UNIQUE,
  especializacoes TEXT,
  verificado SMALLINT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_seguidores INTEGER DEFAULT 0,
  foto_perfil_url TEXT,
  bio TEXT,
  ativo SMALLINT DEFAULT 1,
  bloqueado SMALLINT DEFAULT 0,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);

-- =============================================
-- TABELA: RECEITAS
-- =============================================
CREATE TABLE IF NOT EXISTS receitas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  modo_preparo TEXT NOT NULL,
  criado_por INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  calorias INTEGER,
  proteina DECIMAL(5, 2),
  carboidrato DECIMAL(5, 2),
  gordura DECIMAL(5, 2),
  fibra DECIMAL(5, 2),
  foto_url TEXT,
  tempo_preparo INTEGER,
  porcoes INTEGER,
  dificuldade VARCHAR(50) CHECK (dificuldade IN ('fácil', 'médio', 'difícil')),
  categoria VARCHAR(100),
  alergenicos TEXT DEFAULT '[]',
  dietas TEXT DEFAULT '[]',
  curtidas INTEGER DEFAULT 0,
  compartilhamentos INTEGER DEFAULT 0,
  ativo SMALLINT DEFAULT 1,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receitas_criado_por ON receitas(criado_por);
CREATE INDEX idx_receitas_categoria ON receitas(categoria);
CREATE INDEX idx_receitas_data ON receitas(data_criacao DESC);

-- =============================================
-- TABELA: EXERCICIOS
-- =============================================
CREATE TABLE IF NOT EXISTS exercicios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  tecnica TEXT NOT NULL,
  criado_por INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  video_url TEXT,
  musculos_trabalhados TEXT DEFAULT '[]',
  dificuldade INTEGER CHECK (dificuldade BETWEEN 1 AND 10),
  series_recomendadas INTEGER,
  repeticoes_recomendadas INTEGER,
  descanso_segundos INTEGER,
  contraindicacoes TEXT,
  praticas INTEGER DEFAULT 0,
  curtidas INTEGER DEFAULT 0,
  ambientes TEXT DEFAULT '["casa","academia"]',
  ativo SMALLINT DEFAULT 1,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercicios_criado_por ON exercicios(criado_por);
CREATE INDEX idx_exercicios_data ON exercicios(data_criacao DESC);

-- =============================================
-- TABELA: PLANOS_ALIMENTARES
-- =============================================
CREATE TABLE IF NOT EXISTS planos_alimentares (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  criado_por INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  duracao_dias INTEGER,
  calorias_alvo INTEGER,
  dificuldade VARCHAR(50),
  tipo VARCHAR(50) CHECK (tipo IN ('público', 'personalizado', 'desafio')),
  proteina_alvo DECIMAL(5, 2),
  carboidrato_alvo DECIMAL(5, 2),
  gordura_alvo DECIMAL(5, 2),
  data_inicio DATE,
  data_fim DATE,
  foto_capa_url TEXT,
  seguidores INTEGER DEFAULT 0,
  ativo SMALLINT DEFAULT 1,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_planos_tipo ON planos_alimentares(tipo);
CREATE INDEX idx_planos_criado_por ON planos_alimentares(criado_por);

-- =============================================
-- TABELAS DE RELACIONAMENTO
-- =============================================

-- Usuários seguem usuários
CREATE TABLE IF NOT EXISTS usuarios_seguem_usuarios (
  seguidor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  seguindo_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  data_seguindo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (seguidor_id, seguindo_id),
  CONSTRAINT chk_nao_autofollow CHECK (seguidor_id != seguindo_id)
);

-- Mensagens privadas
CREATE TABLE IF NOT EXISTS mensagens (
  id SERIAL PRIMARY KEY,
  remetente_id INTEGER NOT NULL REFERENCES usuarios(id),
  destinatario_id INTEGER NOT NULL REFERENCES usuarios(id),
  conteudo TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'texto',
  arquivo_url TEXT,
  lido SMALLINT DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mensagens_conversa ON mensagens(remetente_id, destinatario_id, data_criacao DESC);
CREATE INDEX idx_mensagens_lido ON mensagens(destinatario_id, lido);

-- =============================================
-- TABELAS DE HISTÓRICO (Analytics)
-- =============================================

CREATE TABLE IF NOT EXISTS historico_consumo_usuario (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  receita_id INTEGER REFERENCES receitas(id) ON DELETE SET NULL,
  refeicao VARCHAR(50),
  consumido SMALLINT DEFAULT 1,
  porcoes_consumidas DECIMAL(5, 2),
  calorias_consumidas INTEGER,
  macros_consumidas TEXT DEFAULT '{}',
  foto_url TEXT,
  notas TEXT,
  sentimento INTEGER CHECK (sentimento BETWEEN 1 AND 5),
  data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, data, receita_id)
);

CREATE INDEX idx_consumo_usuario_data ON historico_consumo_usuario(usuario_id, data DESC);

CREATE TABLE IF NOT EXISTS historico_exercicios_usuario (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  exercicio_id INTEGER NOT NULL REFERENCES exercicios(id) ON DELETE CASCADE,
  data_execucao DATE NOT NULL,
  completado SMALLINT DEFAULT 0,
  series_completadas INTEGER,
  repeticoes_completadas INTEGER,
  peso_usado DECIMAL(5, 2),
  tempo_total_segundos INTEGER,
  dificuldade_percebida INTEGER CHECK (dificuldade_percebida BETWEEN 1 AND 10),
  tecnica_correcta INTEGER CHECK (tecnica_correcta BETWEEN 0 AND 100),
  dor_ou_desconforto TEXT,
  notas TEXT,
  score_execucao INTEGER CHECK (score_execucao BETWEEN 0 AND 100),
  data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercicios_usuario_data ON historico_exercicios_usuario(usuario_id, data_execucao DESC);

-- =============================================
-- FUNCTIONS E TRIGGERS
-- =============================================

-- Atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_receitas
BEFORE UPDATE ON receitas
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

## Passo 6: Migrar Dados (opcional)

Se já tem dados no SQLite:

```bash
# Usar ferramentas como:
# - pgloader (melhor opção)
# - dbeaver
# - ou script Node.js manual
```

## Passo 7: Testar Conexão

```bash
# criar arquivo de teste
cat > test-db.js << 'EOF'
const { pool } = require('./src/config/conexaoBanco');

(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Conectado ao PostgreSQL:', result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('✗ Erro:', err);
    process.exit(1);
  }
})();
EOF

node test-db.js
```

## Passo 8: Atualizar Controladores

Todos os `require('./config/conexaoBanco')` continuam funcionando, mas agora com PostgreSQL!

```javascript
// Antes (SQLite)
const { executar, buscar, listar } = require('../config/conexaoBanco');

// Depois (PostgreSQL) - IGUAL!
const { executar, buscar, listar } = require('../config/conexaoBanco');
```

## Passo 9: Deploy em Produção

### Railway (PostgreSQL gerenciado)

```yaml
# railway.toml
[env]
DB_USER = "user_produção"
DB_PASSWORD = "${{ secrets.DB_PASSWORD }}"
DB_HOST = "prod-db.railway.app"
DB_PORT = "5432"
DB_NAME = "aptus_prod"
```

### AWS RDS
```bash
# Criar RDS PostgreSQL
# Copiar connection string
# Adicionar em variáveis de ambiente
```

## Rollback (Se precisar)

```bash
# Manter backup SQLite
cp api/db/aptus.db api/db/aptus.db.backup

# Reverter para SQLite
git checkout api/src/config/conexaoBanco.js
```

## ✅ Checklist Migração

- [ ] Instalar PostgreSQL localmente
- [ ] Criar database e user
- [ ] Instalar drivers (pg, knex)
- [ ] Copiar nova configuração conexaoBanco.js
- [ ] Criar schema.sql
- [ ] Atualizar .env
- [ ] Testes locais: `npm test`
- [ ] Iniciar servidor: `npm run dev`
- [ ] Testar endpoints com Postman
- [ ] Deploy em produção
- [ ] Verificar logs
- [ ] Remover SQLite arquivo

## Troubleshooting

```bash
# Erro: "FATAL: role "aptus_user" does not exist"
sudo -u postgres createuser aptus_user
sudo -u postgres psql -c "ALTER USER aptus_user WITH PASSWORD 'senha'"

# Erro: "permission denied for database aptus_db"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aptus_db TO aptus_user"

# Ver conexões ativas
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity"

# Resetar database
sudo -u postgres dropdb aptus_db
sudo -u postgres createdb aptus_db
```

---

**Próximo passo após migração**: Considerar Knex.js para migrations versioned! 🚀
