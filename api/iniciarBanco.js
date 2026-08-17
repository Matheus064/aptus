const banco = require('./src/config/conexaoBanco')

banco.exec(`
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

  CREATE TABLE IF NOT EXISTS conversas (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario1_id     INTEGER NOT NULL,
      usuario2_id     INTEGER NOT NULL,
      data_criacao    TEXT    DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (usuario1_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario2_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_conversas_u1 ON conversas(usuario1_id);
  CREATE INDEX IF NOT EXISTS idx_conversas_u2 ON conversas(usuario2_id);

  CREATE TABLE IF NOT EXISTS mensagens (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      conversa_id     INTEGER NOT NULL,
      remetente_id    INTEGER NOT NULL,
      conteudo        TEXT    NOT NULL,
      data_envio      TEXT    DEFAULT (datetime('now','localtime')),
      lida            INTEGER DEFAULT 0,
      FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
      FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_mensagens_conversa ON mensagens(conversa_id);
  CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens(remetente_id);

  CREATE TABLE IF NOT EXISTS grupos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nome            TEXT    NOT NULL,
      descricao       TEXT    DEFAULT NULL,
      criador_id      INTEGER NOT NULL,
      data_criacao    TEXT    DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (criador_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_grupos_criador ON grupos(criador_id);

  CREATE TABLE IF NOT EXISTS grupo_membros (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      grupo_id        INTEGER NOT NULL,
      usuario_id      INTEGER NOT NULL,
      data_entrada    TEXT    DEFAULT (datetime('now','localtime')),
      administrador   INTEGER DEFAULT 0,
      UNIQUE (grupo_id, usuario_id),
      FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_grupo_membros_grupo ON grupo_membros(grupo_id);
  CREATE INDEX IF NOT EXISTS idx_grupo_membros_usuario ON grupo_membros(usuario_id);

  CREATE TABLE IF NOT EXISTS mensagens_grupo (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      grupo_id        INTEGER NOT NULL,
      remetente_id    INTEGER NOT NULL,
      conteudo        TEXT    NOT NULL,
      data_envio      TEXT    DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
      FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_mensagens_grupo_id ON mensagens_grupo(grupo_id);

  CREATE TABLE IF NOT EXISTS pontos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id      INTEGER NOT NULL,
      quantidade      INTEGER NOT NULL DEFAULT 0,
      origem          TEXT    NOT NULL,
      data_atribuicao TEXT    DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_pontos_usuario ON pontos(usuario_id);

  CREATE TABLE IF NOT EXISTS medalhas (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nome            TEXT    NOT NULL,
      descricao       TEXT    DEFAULT NULL,
      icone           TEXT    DEFAULT NULL,
      pontos_necessarios INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_medalhas_nome ON medalhas(nome);

  CREATE TABLE IF NOT EXISTS medalhas_usuario (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id      INTEGER NOT NULL,
      medalha_id      INTEGER NOT NULL,
      data_conquista  TEXT    DEFAULT (datetime('now','localtime')),
      UNIQUE (usuario_id, medalha_id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (medalha_id) REFERENCES medalhas(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_medalhas_usuario_u ON medalhas_usuario(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_medalhas_usuario_m ON medalhas_usuario(medalha_id);
`)

console.log('Banco de dados inicializado com sucesso!')
