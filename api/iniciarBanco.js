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
`)

console.log('Banco de dados inicializado com sucesso!')
