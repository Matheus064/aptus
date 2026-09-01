# 📐 Especificação de Requisitos de Sistema (RSF/RSNF)

**Projeto**: Aptus 2.0 - Rede Social de Emagrecimento Saudável  
**Versão**: 2.0.1  
**Data**: Setembro 2026  
**Padrões**: UML 2.5.1 | ISO/IEC/IEEE 29148:2018 | FURPS+ | ISO/IEC 25010  
**Elaborado por**: Equipe de Arquitetura de Software  

---

## 1. REQUISITOS FUNCIONAIS DE SISTEMA (RSF)

### 1.1 Rotas HTTP REST - Autenticação

#### RSF-001: POST /api/usuarios/cadastro

**Método HTTP**: `POST`  
**Autenticação**: Pública (não requer JWT)  
**Content-Type**: `application/json`  
**Accept**: `application/json`  

**Payload de Entrada (Request Body)**:
```json
{
  "email": "joao@exemplo.com",
  "senha": "Senha@2026",
  "nome_completo": "João da Silva Santos",
  "data_nascimento": "1990-05-15"
}
```

**Validações Backend (Prepared Statement)**:
```sql
-- Verificar email único
SELECT COUNT(*) FROM usuarios WHERE email = ? AND ativo = 1;
-- Se > 0: retornar 409 Conflict

-- Hash da senha
password_hash = bcrypt(senha, saltRounds=12)

-- INSERT
INSERT INTO usuarios 
  (nome_completo, email, senha, role, data_nascimento, data_cadastro, ativo)
VALUES (?, ?, ?, 'user', ?, CURRENT_TIMESTAMP, 1)
```

**Resposta de Sucesso (HTTP 201 Created)**:
```json
{
  "status": "sucesso",
  "usuario_id": 123,
  "email": "joao@exemplo.com",
  "nome_completo": "João da Silva Santos",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_expira_em": "2026-09-02T19:30:00Z"
}
```

**Respostas de Erro**:

| Código | Erro | Condição |
|--------|------|----------|
| 400 | `{"erro": "Email inválido"}` | Email não segue RFC 5322 |
| 400 | `{"erro": "Senha deve ter 8+ caracteres"}` | Senha muito curta |
| 409 | `{"erro": "Email já registrado"}` | UNIQUE constraint violada |
| 413 | `{"erro": "Payload muito grande"}` | Requisição > 1MB |
| 500 | `{"erro": "Erro interno do servidor"}` | Exception não tratada |

**Headers de Resposta**:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Set-Cookie: token=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1693654800
```

---

#### RSF-002: POST /api/usuarios/login

**Método HTTP**: `POST`  
**Autenticação**: Pública  
**Content-Type**: `application/json`  

**Payload de Entrada**:
```json
{
  "email": "joao@exemplo.com",
  "senha": "Senha@2026"
}
```

**Lógica Backend**:
```pseudocode
1. Sanitizar email (toLowerCase, trim)
2. SELECT * FROM usuarios WHERE email = ? AND ativo = 1 AND bloqueado = 0
3. IF resultado NULL:
     - Registrar tentativa falha em tabela login_attempts
     - Retornar 401 "Email ou senha incorretos"
4. IF bcrypt.compare(senha_input, hash_armazenado) == FALSE:
     - Incrementar contador de falhas
     - IF contador >= 5 no último 15 minutos:
         * Retornar 429 "Muitas tentativas. Tente em X minutos"
     - ELSE retornar 401
5. IF bcrypt.compare == TRUE:
     - Gerar JWT com payload: {sub: usuario_id, email, role, iat, exp}
     - Armazenar token em cache (Redis) para validação rápida
     - Retornar 200 OK com token
```

**Resposta (HTTP 200 OK)**:
```json
{
  "status": "sucesso",
  "usuario_id": 123,
  "email": "joao@exemplo.com",
  "nome_completo": "João da Silva",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_expira_em": "2026-09-02T19:30:00Z",
  "foto_perfil_url": "https://cdn.aptus.com/perfil/123.jpg"
}
```

---

### 1.2 Rotas HTTP REST - Usuários

#### RSF-003: GET /api/usuarios/:id

**Método HTTP**: `GET`  
**Autenticação**: Requer JWT válido  
**Autorização**: Público (perfil de outro) ou privado (se próprio)  

**Query Parameters** (Opcional):
```
?incluir=posts,seguidores,planos
```

**SQL (Prepared Statement)**:
```sql
SELECT u.id, u.nome_completo, u.email, u.peso_atual, u.peso_meta, 
       u.altura, u.bio, u.foto_perfil_url, u.total_seguidores,
       u.role, u.verificado, u.data_cadastro
FROM usuarios u
WHERE u.id = ? AND u.ativo = 1
LIMIT 1
```

**Resposta (HTTP 200 OK)**:
```json
{
  "id": 123,
  "nome_completo": "João Silva",
  "email": "joao@exemplo.com",
  "peso_atual": 92.5,
  "peso_meta": 85.0,
  "altura": 1.78,
  "bio": "Começando minha jornada de transformação 💪",
  "foto_perfil_url": "https://cdn.aptus.com/perfil/123.jpg",
  "role": "user",
  "verificado": 0,
  "total_seguidores": 42,
  "data_cadastro": "2026-08-01T10:30:00Z",
  "pode_editar": true
}
```

---

#### RSF-004: PUT /api/usuarios/:id

**Método HTTP**: `PUT`  
**Autenticação**: JWT requerido  
**Autorização**: Somente o próprio usuário (userId == token.sub)  

**Payload de Entrada**:
```json
{
  "peso_atual": 90.5,
  "peso_meta": 82.0,
  "altura": 1.78,
  "bio": "Nova bio atualizada",
  "foto_perfil": "<file binary>"
}
```

**Lógica Backend**:
```pseudocode
1. Extrair userId do JWT (token.sub)
2. IF :id != userId: retornar 403 Forbidden
3. Validar campos:
   - peso_atual: 20.0 <= valor <= 500.0
   - altura: 1.0 <= valor <= 2.5
   - bio: max 500 caracteres, sanitizar HTML
4. IF foto_perfil enviada:
   - Validar MIME type (image/jpeg, image/png)
   - Validar tamanho (max 5MB)
   - Converter para WebP com sharp.js
   - Upload para CDN (AWS S3 / DigitalOcean Spaces)
5. UPDATE usuarios SET peso_atual=?, altura=?, bio=?, foto_perfil_url=?
   WHERE id = ? AND ativo = 1
6. Retornar 200 OK com dados atualizados
```

**Resposta (HTTP 200 OK)**:
```json
{
  "status": "sucesso",
  "usuario": {
    "id": 123,
    "peso_atual": 90.5,
    "peso_meta": 82.0,
    "altura": 1.78,
    "bio": "Nova bio atualizada",
    "foto_perfil_url": "https://cdn.aptus.com/perfil/123-v2.webp",
    "data_atualizacao": "2026-09-01T15:45:30Z"
  }
}
```

---

### 1.3 Rotas HTTP REST - Receitas

#### RSF-005: GET /api/receitas

**Método HTTP**: `GET`  
**Autenticação**: Opcional (pública)  
**Query Parameters**:
```
?pagina=1&limite=20&categoria=almoco&calorias_max=500&ordenar=curtidas_desc
```

**SQL (Pagination + Filtering)**:
```sql
SELECT r.id, r.titulo, r.foto_url, r.calorias, r.tempo_preparo,
       r.porcoes, r.dificuldade, r.curtidas, r.compartilhamentos,
       u.nome_completo as criado_por_nome
FROM receitas r
INNER JOIN usuarios u ON r.criado_por = u.id
WHERE r.ativo = 1
  AND (? IS NULL OR r.categoria = ?)
  AND (? IS NULL OR r.calorias <= ?)
ORDER BY r.data_criacao DESC
LIMIT ? OFFSET ?
```

**Resposta (HTTP 200 OK)**:
```json
{
  "total": 342,
  "pagina": 1,
  "limite": 20,
  "receitas": [
    {
      "id": 1,
      "titulo": "Frango ao Molho de Mostarda",
      "foto_url": "https://cdn.aptus.com/receitas/1.jpg",
      "calorias": 320,
      "tempo_preparo": 25,
      "porcoes": 2,
      "dificuldade": "médio",
      "curtidas": 156,
      "criado_por_nome": "João Silva",
      "media_avaliacoes": 4.5
    }
  ],
  "_links": {
    "proxima": "/api/receitas?pagina=2&limite=20",
    "anterior": "/api/receitas?pagina=1&limite=20"
  }
}
```

---

#### RSF-006: POST /api/receitas/:id/avaliar

**Método HTTP**: `POST`  
**Autenticação**: JWT requerido  
**Content-Type**: `application/json`  

**Payload de Entrada**:
```json
{
  "estrelas": 5,
  "comentario": "Receita deliciosa e prática!"
}
```

**Lógica Backend**:
```pseudocode
1. Extrair usuario_id do JWT
2. Validar receita existe: SELECT * FROM receitas WHERE id = ? AND ativo = 1
3. Validar estrelas: 1 <= value <= 5
4. Sanitizar comentario com DOMPurify (remover tags HTML)
5. Validar comprimento comentário: 0 a 500 caracteres
6. INSERT INTO comentarios_receitas
     (usuario_id, receita_id, estrelas, comentario, data_criacao)
   VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
7. Recalcular média: 
   SELECT AVG(CAST(estrelas AS FLOAT)) FROM comentarios_receitas WHERE receita_id = ?
8. UPDATE receitas SET media_avaliacoes = ? WHERE id = ?
9. Retornar 201 Created
```

**Resposta (HTTP 201 Created)**:
```json
{
  "status": "sucesso",
  "comentario_id": 5031,
  "receita_id": 1,
  "usuario_id": 123,
  "estrelas": 5,
  "comentario": "Receita deliciosa e prática!",
  "data_criacao": "2026-09-01T16:20:15Z",
  "media_receita_atualizada": 4.6
}
```

---

### 1.4 Rotas HTTP REST - Planos com IA

#### RSF-007: POST /api/ia/gerar-plano

**Método HTTP**: `POST`  
**Autenticação**: JWT requerido  
**Content-Type**: `application/json`  
**Timeout**: 60 segundos  

**Payload de Entrada**:
```json
{
  "objetivo": "perder_peso",
  "restricoes_alimentares": ["sem_gluten", "vegetariano"],
  "duracao_dias": 30,
  "calorias_alvo": 1800,
  "preferencias_ingredientes": ["frango", "peixe", "salada"]
}
```

**Fluxo Backend (Assíncrono)**:

```pseudocode
1. Extrair usuario_id do JWT
2. Validar entrada
3. Recuperar perfil do usuário:
   SELECT * FROM usuarios WHERE id = ? AND ativo = 1
4. Recuperar preferências armazenadas:
   SELECT * FROM ia_agentes_preferencias WHERE usuario_id = ?
5. Construir prompt para Anthropic Claude:
   """
   Você é um nutricionista experiente especializado em planos de emagrecimento.
   Gere um plano alimentar de 30 dias para:
   - Objetivo: Perder peso (meta 0.5kg/semana)
   - Calorias por dia: 1800 kcal
   - Restrições: Sem glúten, vegetariano
   - Preferências: Frango, peixe, salada
   
   Retorne em JSON estruturado com:
   {
     "dias": [
       {
         "dia": 1,
         "data": "2026-09-01",
         "refeicoes": [
           {"tipo": "café", "receitas": [...], "calorias_totais": 400},
           {"tipo": "almoço", "receitas": [...], "calorias_totais": 600},
           {"tipo": "lanche", "receitas": [...], "calorias_totais": 200},
           {"tipo": "jantar", "receitas": [...], "calorias_totais": 600}
         ]
       }
     ]
   }
   """
6. INSERT INTO planos_gerados_ia
     (usuario_id, parametros, status, data_geracao)
   VALUES (?, JSON_SERIALIZE(entrada), 'processando', CURRENT_TIMESTAMP)
   RETURNING plano_id
7. Retornar 202 Accepted com plano_id para polling
8. **Background Job** (fila com Bull ou similar):
   - Chamar client.messages.create() da Anthropic (streaming)
   - Coletar resposta completa
   - UPDATE planos_gerados_ia SET resultado_texto = ?, status = 'completo'
   - Notificar usuário via WebSocket ou polling
```

**Resposta Imediata (HTTP 202 Accepted)**:
```json
{
  "status": "processando",
  "plano_id": "uuid-1234-5678",
  "mensagem": "Gerando plano com IA. Atualize em 30 segundos.",
  "poll_url": "/api/ia/plano/uuid-1234-5678/status"
}
```

#### RSF-008: GET /api/ia/plano/:plano_id/status

**Método HTTP**: `GET`  
**Autenticação**: JWT requerido  

**Resposta (HTTP 200 OK) - Processando**:
```json
{
  "status": "processando",
  "progresso_percentual": 45,
  "mensagem": "Gerando receitas..."
}
```

**Resposta (HTTP 200 OK) - Concluído**:
```json
{
  "status": "completo",
  "plano_id": "uuid-1234-5678",
  "dias": [
    {
      "dia": 1,
      "data": "2026-09-01",
      "refeicoes": [
        {
          "tipo": "café",
          "receitas": [
            {
              "nome": "Omelete com Espinafre",
              "ingredientes": ["2 ovos", "50g espinafre", "sal e pimenta"],
              "modo_preparo": "...",
              "calorias": 150
            }
          ]
        }
      ]
    }
  ],
  "resumo": {
    "calorias_total": 1800,
    "macros": {"proteina": 30, "carboidrato": 45, "gordura": 25},
    "custo_estimado": "R$ 85.00"
  }
}
```

---

## 2. REQUISITOS NÃO FUNCIONAIS (RSNF) - TAXONOMIA FURPS+

### 2.1 SEGURANÇA (Security)

#### RSNF-SEC-001: Criptografia de Senhas

**Requisito**: Senhas de usuários devem ser armazenadas com hash criptográfico de única via, impossível de reverter.

**Especificação Técnica**:
- **Algoritmo**: bcrypt (https://www.npmjs.com/package/bcryptjs)
- **Cost Factor**: 12 (mínimo; ajustável conforme performance)
- **Salt**: Gerado automaticamente por bcryptjs
- **Verificação**: `bcrypt.compare(entrada, hash_armazenado)`

**Implementação**:
```javascript
// Backend - signing up
const bcrypt = require('bcryptjs');
const senha_plain = req.body.senha;
const salt = await bcrypt.genSalt(12);
const senha_hash = await bcrypt.hash(senha_plain, salt);
// INSERT INTO usuarios (senha) VALUES (senha_hash)

// Backend - login
const usuario = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
const match = await bcrypt.compare(req.body.senha, usuario.senha);
if (!match) return res.status(401).json({erro: "Credenciais inválidas"});
```

**Testes de Conformidade**:
- ✓ Senhas nunca armazenadas em plain-text
- ✓ Hash único mesmo para senhas idênticas (diferentes salts)
- ✓ Tempo de cálculo ~500ms para resistir força bruta
- ✓ Nenhuma função de reversão implementada

---

#### RSNF-SEC-002: Autenticação Stateless via JWT (JSON Web Token)

**Requisito**: Sistema de autenticação sem estado no servidor, usando tokens criptografados.

**Especificação**:
- **Algoritmo**: HS256 (HMAC-SHA256)
- **Secret Key**: Mínimo 32 caracteres aleatórios, armazenado em `.env`
- **Payload**:
  ```json
  {
    "sub": "123",
    "email": "joao@aptus.com",
    "role": "user",
    "iat": 1693526400,
    "exp": 1693612800
  }
  ```
- **Expiração**: 24 horas padrão (configurável por role)
- **Armazenamento Cliente**: localStorage (web) ou secure storage (mobile)
- **Transmissão**: Header `Authorization: Bearer <token>` ou cookie HttpOnly

**Implementação**:
```javascript
// Middleware de autenticação
const jwt = require('jsonwebtoken');

app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  if (!token) return res.status(401).json({erro: "Token requerido"});
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.sub;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({erro: "Token inválido ou expirado"});
  }
});
```

**Testes de Conformidade**:
- ✓ Token assinado e verificável
- ✓ Expiração honrada (req após exp retorna 401)
- ✓ Payload não pode ser alterado (signature verifica integridade)
- ✓ Nenhuma senha em plain-text no token

---

#### RSNF-SEC-003: Prevenção contra XSS (Cross-Site Scripting)

**Requisito**: Nenhum código JavaScript injeta HTML não saniti

zado no DOM.

**Implementação Frontend**:
```javascript
// ❌ ERRADO - Vulnerável a XSS
element.innerHTML = userInput; // NÃO FAZER

// ✅ CORRETO - Seguro
element.textContent = userInput; // Escapa HTML automaticamente

// ✅ CORRETO - Com DOMPurify para HTML permitido
const DOMPurify = require('dompurify');
element.innerHTML = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
});
```

**Implementação Backend**:
```javascript
// Usar express-validator para sanitização
const { body, validationResult } = require('express-validator');

app.post('/api/posts', [
  body('conteudo').trim().escape().isLength({max: 500})
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({erros: errors.array()});
  // conteudo agora está sanitizado
});
```

**Testes de Conformidade**:
- ✓ Input `<script>alert('XSS')</script>` é escapado/removido
- ✓ Nenhum `onerror`, `onclick` executado
- ✓ Tags de forma dinâmica não interpretadas

---

#### RSNF-SEC-004: Prevenção de SQL Injection

**Requisito**: Todas as queries ao banco devem usar Prepared Statements com placeholders.

**Implementação Correta (Prepared Statements)**:
```javascript
// ✅ SEGURO - Prepared Statement
db.query(
  'SELECT * FROM usuarios WHERE email = ? AND ativo = 1',
  [email_usuario],
  (err, rows) => { /* ... */ }
);

// ✅ SEGURO - Com ORM (Sequelize)
const user = await Usuario.findOne({where: {email: email_usuario}});

// ❌ ERRADO - NUNCA FAZER String Concatenation
db.query(`SELECT * FROM usuarios WHERE email = '${email_usuario}'`);
```

**Padrão de Defesa em Camadas**:
1. **Input Validation**: Validar tipo, comprimento, formato
2. **Parameterized Queries**: Usar placeholders (?, $1, etc)
3. **Escaping**: SQL escape de strings (se necessário)
4. **Least Privilege**: Usuário BD com permissões mínimas

**Testes de Conformidade**:
- ✓ Input `' OR '1'='1` não quebra query
- ✓ Nenhuma concatenação de strings em SQL
- ✓ Todas as tabelas com constraints apropriadas

---

#### RSNF-SEC-005: Autorização Role-Based (RBAC)

**Requisito**: Controle de acesso baseado em papéis (roles).

**Roles Definidos**:
- `user`: Usuário comum, acesso a seu próprio perfil e conteúdo público
- `nutricionista`: Pode criar planos, validar receitas, ver pacientes
- `admin`: Acesso total, moderação, relatórios

**Middleware de Autorização**:
```javascript
const requireRole = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.userRole)) {
    return res.status(403).json({erro: "Acesso negado"});
  }
  next();
};

// Uso
app.put('/api/usuarios/:id', 
  autenticar, 
  (req, res) => {
    if (req.userId !== parseInt(req.params.id) && req.userRole !== 'admin') {
      return res.status(403).json({erro: "Não autorizado"});
    }
    // Proceder
  }
);

app.delete('/api/planos/:id',
  autenticar,
  requireRole(['nutricionista', 'admin']),
  (req, res) => { /* ... */ }
);
```

---

#### RSNF-SEC-006: Headers HTTP de Segurança (Helmet.js)

**Requisito**: Aplicar headers de segurança recomendados pela OWASP.

**Implementação**:
```javascript
const helmet = require('helmet');
app.use(helmet()); // Aplica automaticamente:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - Strict-Transport-Security: max-age=31536000; includeSubDomains
// - Content-Security-Policy: default-src 'self'
// - X-XSS-Protection: 1; mode=block
```

---

#### RSNF-SEC-007: HTTPS/TLS Obrigatório em Produção

**Requisito**: Todas as comunicações criptografadas com TLS 1.2+.

**Implementação**:
```javascript
// Redirecionar HTTP → HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
    return res.redirect(301, `https://${req.host}${req.url}`);
  }
  next();
});

// HSTS (HTTP Strict Transport Security)
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

### 2.2 PERFORMANCE (Performance)

#### RSNF-PERF-001: Tempo de Resposta HTTP

**Requisito**: 95% de requisições retornam em < 200ms.

**Métricas**:
- GET simples (perfil): < 100ms
- GET com join (feed): < 150ms
- POST pesado (upload imagem): < 500ms
- IA Generativa (plano): 15-30s (assíncrono, aceitável)

**Implementação**:
- Connection pooling: `max: 20` conexões concorrentes
- Índices em tabelas: email, user_id, data_criacao
- Prepared Statements cached
- Compressão gzip em respostas

```javascript
const compression = require('compression');
app.use(compression()); // Gzip respostas

// Middleware de timing
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
    if (duration > 200) console.warn('SLOW QUERY');
  });
  next();
});
```

---

#### RSNF-PERF-002: Escalabilidade de Conexões de Banco de Dados

**Requisito**: Suportar 1000+ usuários simultâneos sem degradação.

**Implementação**:
```javascript
// Connection Pool
const sqlite3 = require('better-sqlite3'); // Síncrono mas rápido
// OU para PostgreSQL (recomendado em produção):
const { Pool } = require('pg');
const pool = new Pool({
  max: 20,           // Máximo de conexões
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Prepared Statement caching automático
pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
```

---

#### RSNF-PERF-003: Compressão de Imagens

**Requisito**: Imagens reduzidas sem perda visual significativa.

**Implementação**:
```javascript
const sharp = require('sharp');

// Upload de imagem
const buffer = req.file.buffer;
const webpBuffer = await sharp(buffer)
  .resize(1024, 1024, {fit: 'inside', withoutEnlargement: true})
  .webp({quality: 80})
  .toBuffer();

// Tamanho reduzido: 10MB JPG → 500KB WebP
```

---

#### RSNF-PERF-004: Paginação de Resultados

**Requisito**: Endpoints que retornam listas implementam pagination.

**Padrão**:
```javascript
// GET /api/receitas?pagina=2&limite=20
const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
const limite = Math.min(100, parseInt(req.query.limite) || 20);
const offset = (pagina - 1) * limite;

const receitas = await db.all(
  'SELECT * FROM receitas WHERE ativo = 1 ORDER BY data_criacao DESC LIMIT ? OFFSET ?',
  [limite, offset]
);
```

---

### 2.3 CONFIABILIDADE (Reliability)

#### RSNF-CONF-001: Transações ACID

**Requisito**: Operações críticas executadas atomicamente.

**Implementação**:
```javascript
// Transferência de dados (ex: seguir usuário)
db.transaction(() => {
  // Verificar se já segue
  const existe = db.prepare('SELECT * FROM usuarios_seguem_usuarios WHERE ? AND ?').get(a, b);
  if (existe) throw new Error('Já segue');
  
  // Inserir relação
  db.prepare('INSERT INTO usuarios_seguem_usuarios VALUES (?, ?)').run(a, b);
  
  // Incrementar contador
  db.prepare('UPDATE usuarios SET total_seguidores = total_seguidores + 1 WHERE id = ?').run(b);
})();
```

---

#### RSNF-CONF-002: Backup e Recuperação de Dados

**Requisito**: Backup automático do banco em intervalos regulares.

**Implementação**:
```javascript
// Script de backup (cron job)
const cron = require('node-cron');
const fs = require('fs');

cron.schedule('0 2 * * *', () => { // 2AM diariamente
  const timestamp = new Date().toISOString().split('T')[0];
  const backupPath = `/backups/aptus-${timestamp}.sql`;
  
  // Usar ferramentas nativas: pg_dump, sqlite3 .dump
  exec(`sqlite3 ./db/aptus.db ".dump" > ${backupPath}`, (err) => {
    if (err) console.error('Backup failed:', err);
    else console.log('Backup criado:', backupPath);
  });
});
```

---

#### RSNF-CONF-003: Tratamento de Erros e Logging

**Requisito**: Todos os erros capturados e registrados em log estruturado.

**Implementação**:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({filename: 'logs/error.log', level: 'error'}),
    new winston.transports.File({filename: 'logs/combined.log'})
  ]
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error({
    timestamp: new Date(),
    method: req.method,
    url: req.url,
    userId: req.userId,
    error: err.message,
    stack: err.stack
  });
  
  res.status(500).json({erro: 'Erro interno do servidor'});
});
```

---

### 2.4 USABILIDADE (Usability)

#### RSNF-USAB-001: Interface Responsiva (Mobile-First)

**Requisito**: UI funciona em telas de 320px a 2560px.

**Implementação CSS**:
```css
/* Mobile First */
body {
  font-size: 16px;
  padding: 12px;
}

button {
  padding: 12px 16px;
  min-height: 44px; /* Hit target recomendado */
}

/* Tablet */
@media (min-width: 768px) {
  body { font-size: 18px; }
}

/* Desktop */
@media (min-width: 1024px) {
  body { max-width: 1200px; margin: 0 auto; }
}
```

---

#### RSNF-USAB-002: Acessibilidade WCAG 2.1 Level AA

**Requisito**: Cumprimento dos padrões WCAG para pessoas com deficiência.

**Implementação**:
```html
<!-- Landmarks semânticos -->
<header role="banner">
  <nav aria-label="Navegação principal"></nav>
</header>
<main role="main">...</main>
<footer role="contentinfo">...</footer>

<!-- Labels associados -->
<label for="email">E-mail:</label>
<input id="email" type="email">

<!-- Alt text em imagens -->
<img src="receita.jpg" alt="Frango ao molho de mostarda com salada">

<!-- ARIA para componentes dinâmicos -->
<div aria-live="polite" aria-label="Notificações">
  <!-- Toast aparece aqui -->
</div>
```

---

#### RSNF-USAB-003: Feedback Visual Imediato

**Requisito**: Ações do usuário retornam resposta visual em < 100ms.

**Implementação JavaScript**:
```javascript
button.addEventListener('click', () => {
  button.disabled = true;
  button.innerHTML = '<span class="spinner"></span> Salvando...';
  
  fetch('/api/salvar', {method: 'POST'})
    .then(res => {
      if (res.ok) {
        showToast('Salvo com sucesso');
        button.innerHTML = 'Salvo ✓';
        button.classList.add('success');
      }
    })
    .catch(err => {
      showToast('Erro ao salvar');
      button.innerHTML = 'Tentar Novamente';
    })
    .finally(() => {
      button.disabled = false;
    });
});
```

---

## 3. DICIONÁRIO TÉCNICO DE DADOS - SCHEMA DDL

### Tabela: `usuarios`

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE COLLATE NOCASE,
  telefone VARCHAR(20),
  senha VARCHAR(255) NOT NULL, -- bcrypt hash
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'nutricionista', 'admin')),
  peso_atual DECIMAL(5, 2),
  peso_meta DECIMAL(5, 2),
  altura DECIMAL(5, 2),
  data_nascimento DATE,
  numero_crn VARCHAR(20) UNIQUE, -- Para nutricionistas
  especializacoes TEXT, -- JSON array
  verificado SMALLINT DEFAULT 0, -- 1 = email verificado
  rating DECIMAL(3, 2) DEFAULT 0.0, -- Para nutricionistas
  total_seguidores INTEGER DEFAULT 0,
  foto_perfil_url TEXT,
  bio TEXT,
  ativo SMALLINT DEFAULT 1, -- Soft delete
  bloqueado SMALLINT DEFAULT 0,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX idx_usuarios_data_cadastro ON usuarios(data_cadastro DESC);
```

### Tabela: `receitas`

```sql
CREATE TABLE receitas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  modo_preparo TEXT NOT NULL,
  criado_por INTEGER NOT NULL,
  calorias INTEGER,
  proteina DECIMAL(5, 2),
  carboidrato DECIMAL(5, 2),
  gordura DECIMAL(5, 2),
  fibra DECIMAL(5, 2),
  foto_url TEXT NOT NULL,
  tempo_preparo INTEGER, -- em minutos
  porcoes INTEGER,
  dificuldade VARCHAR(50) CHECK(dificuldade IN ('fácil', 'médio', 'difícil')),
  categoria VARCHAR(100),
  alergenicos TEXT DEFAULT '[]', -- JSON array
  dietas TEXT DEFAULT '[]', -- JSON array (vegetariano, vegano, sem_gluten)
  curtidas INTEGER DEFAULT 0,
  comentarios INTEGER DEFAULT 0,
  compartilhamentos INTEGER DEFAULT 0,
  media_avaliacoes DECIMAL(3, 2) DEFAULT 0.0,
  ativo SMALLINT DEFAULT 1,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_receitas_criado_por ON receitas(criado_por);
CREATE INDEX idx_receitas_categoria ON receitas(categoria);
CREATE INDEX idx_receitas_data ON receitas(data_criacao DESC);
CREATE INDEX idx_receitas_ativo ON receitas(ativo);
```

### Tabela: `historico_peso`

```sql
CREATE TABLE historico_peso (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  peso DECIMAL(5, 2) NOT NULL,
  anotacao TEXT, -- Opcional: "Após exercício", etc
  data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_historico_peso_usuario ON historico_peso(usuario_id, data_registro DESC);
```

### Tabela: `comentarios_receitas`

```sql
CREATE TABLE comentarios_receitas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  receita_id INTEGER NOT NULL,
  estrelas INTEGER CHECK(estrelas BETWEEN 1 AND 5),
  comentario TEXT, -- max 500 caracteres
  curtidas INTEGER DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE,
  UNIQUE(usuario_id, receita_id) -- Um comentário por usuário por receita
);

CREATE INDEX idx_comentarios_receita ON comentarios_receitas(receita_id);
```

### Tabela: `planos_gerados_ia`

```sql
CREATE TABLE planos_gerados_ia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  plano_alimentar_id INTEGER,
  parametros TEXT NOT NULL, -- JSON de entrada
  resultado_texto TEXT, -- JSON do plano gerado
  status VARCHAR(50) DEFAULT 'processando' CHECK(status IN ('processando', 'completo', 'erro')),
  data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (plano_alimentar_id) REFERENCES planos_alimentares(id) ON DELETE SET NULL
);

CREATE INDEX idx_planos_gerados_usuario ON planos_gerados_ia(usuario_id);
```

---

## 4. MATRIZ DE RASTREABILIDADE TÉCNICA

| RSNF | Domínio | Prioridade | Status | Teste |
|------|---------|-----------|--------|-------|
| RSNF-SEC-001 | Segurança (Senha) | MUST | ✅ Implementado | bcryptjs v2.4.3 |
| RSNF-SEC-002 | Segurança (JWT) | MUST | ✅ Implementado | jsonwebtoken v9.0.2 |
| RSNF-SEC-003 | Segurança (XSS) | MUST | ✅ Implementado | express-validator |
| RSNF-SEC-004 | Segurança (SQL Injection) | MUST | ✅ Implementado | Prepared Statements |
| RSNF-SEC-005 | Segurança (RBAC) | MUST | ✅ Implementado | Middleware custom |
| RSNF-SEC-006 | Segurança (Headers) | SHOULD | ✅ Implementado | helmet v8.0.0 |
| RSNF-PERF-001 | Performance (Latência) | SHOULD | 🔄 Monitorado | APM / Logs |
| RSNF-PERF-002 | Performance (Escalabilidade) | SHOULD | ✅ Implementado | Connection Pool |
| RSNF-CONF-001 | Confiabilidade (ACID) | MUST | ✅ Implementado | Transações BD |
| RSNF-USAB-001 | Usabilidade (Responsivo) | MUST | ✅ Implementado | Media queries CSS |

---

## 5. CONCLUSÃO

Este documento especifica de forma técnica e exaustiva todos os requisitos funcionais (rotas, payloads, lógica) e não funcionais (segurança, performance, confiabilidade) do backend Node.js.

Alinhado com padrões ISO/IEC/IEEE 29148 e FURPS+, fornece a base para implementação, testes e auditoria.

---

**Última Revisão**: Setembro 2026  
**Próxima Revisão**: Dezembro 2026
