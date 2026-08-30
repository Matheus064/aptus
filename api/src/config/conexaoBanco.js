const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

const databasePath = path.resolve(process.env.DATABASE_PATH || './db/aptus.db');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const banco = new sqlite3.Database(databasePath);
banco.run('PRAGMA foreign_keys = ON');

const executar = (sql, parametros = []) => new Promise((resolve, reject) => {
  banco.run(sql, parametros, function onRun(erro) {
    if (erro) reject(erro);
    else resolve({ id: this.lastID, alterados: this.changes });
  });
});

const buscar = (sql, parametros = []) => new Promise((resolve, reject) => {
  banco.get(sql, parametros, (erro, linha) => erro ? reject(erro) : resolve(linha));
});

const listar = (sql, parametros = []) => new Promise((resolve, reject) => {
  banco.all(sql, parametros, (erro, linhas) => erro ? reject(erro) : resolve(linhas));
});

const inicializarBanco = async () => {
  await executar(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    telefone TEXT,
    senha TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'nutricionista', 'admin')),
    peso_atual REAL,
    peso_meta REAL,
    altura REAL,
    data_nascimento DATE,
    numero_crn TEXT UNIQUE,
    especializacoes TEXT,
    verificado INTEGER DEFAULT 0,
    rating REAL DEFAULT 0.0,
    total_seguidores INTEGER DEFAULT 0,
    foto_perfil_url TEXT,
    bio TEXT,
    ativo INTEGER DEFAULT 1,
    bloqueado INTEGER DEFAULT 0,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `);
  await executar('CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)');
  await executar('CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role)');
  await executar(`CREATE TABLE IF NOT EXISTS receitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT NOT NULL,
    modo_preparo TEXT NOT NULL, criado_por INTEGER NOT NULL, calorias INTEGER,
    proteina REAL, carboidrato REAL, gordura REAL, fibra REAL, foto_url TEXT,
    tempo_preparo INTEGER, porcoes INTEGER, dificuldade TEXT, categoria TEXT,
    alergenicos TEXT DEFAULT '[]', dietas TEXT DEFAULT '[]', curtidas INTEGER DEFAULT 0,
    compartilhamentos INTEGER DEFAULT 0, ativo INTEGER DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, descricao TEXT NOT NULL,
    tecnica TEXT NOT NULL, criado_por INTEGER NOT NULL, video_url TEXT,
    musculos_trabalhados TEXT DEFAULT '[]', dificuldade INTEGER, series_recomendadas INTEGER,
    repeticoes_recomendadas INTEGER, descanso_segundos INTEGER, contraindicacoes TEXT,
    praticas INTEGER DEFAULT 0, curtidas INTEGER DEFAULT 0, ativo INTEGER DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS planos_alimentares (
    id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT NOT NULL,
    criado_por INTEGER NOT NULL, duracao_dias INTEGER, calorias_alvo INTEGER, dificuldade TEXT,
    tipo TEXT CHECK(tipo IN ('público', 'personalizado', 'desafio')), proteina_alvo REAL,
    carboidrato_alvo REAL, gordura_alvo REAL, data_inicio DATE, data_fim DATE,
    foto_capa_url TEXT, seguidores INTEGER DEFAULT 0, ativo INTEGER DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (criado_por) REFERENCES usuarios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS planos_receitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, plano_id INTEGER NOT NULL, receita_id INTEGER NOT NULL,
    dia_plano INTEGER, refeicao TEXT, FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id) ON DELETE CASCADE,
    FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS planos_exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, plano_id INTEGER NOT NULL, exercicio_id INTEGER NOT NULL,
    dia_semana INTEGER, ordem INTEGER, series_personalizado INTEGER, repeticoes_personalizado INTEGER,
    FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS curtidas_exercicios (
    usuario_id INTEGER NOT NULL, exercicio_id INTEGER NOT NULL,
    PRIMARY KEY (usuario_id, exercicio_id), FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, receita_id INTEGER,
    exercicio_id INTEGER, conteudo TEXT NOT NULL, foto_url TEXT, curtidas INTEGER DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK ((receita_id IS NOT NULL) != (exercicio_id IS NOT NULL)),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (receita_id) REFERENCES receitas(id), FOREIGN KEY (exercicio_id) REFERENCES exercicios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS curtidas_receitas (
    usuario_id INTEGER NOT NULL, receita_id INTEGER NOT NULL, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, receita_id), FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (receita_id) REFERENCES receitas(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS usuarios_salvam_receitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, receita_id INTEGER NOT NULL,
    data_salva TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(usuario_id, receita_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS usuarios_salvam_exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, exercicio_id INTEGER NOT NULL,
    data_salva TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(usuario_id, exercicio_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS usuarios_pontos (
    usuario_id INTEGER PRIMARY KEY, pontos INTEGER DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS acoes_pontuadas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, acao TEXT NOT NULL,
    referencia_id INTEGER, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, acao, referencia_id), FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS usuarios_medalhas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, medalha TEXT NOT NULL,
    data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(usuario_id, medalha),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`);
  await executar('CREATE INDEX IF NOT EXISTS idx_receitas_criado_em ON receitas(data_criacao DESC)');
  await executar('CREATE INDEX IF NOT EXISTS idx_exercicios_criado_em ON exercicios(data_criacao DESC)');
  await executar('CREATE INDEX IF NOT EXISTS idx_planos_tipo ON planos_alimentares(tipo)');
  await executar('CREATE INDEX IF NOT EXISTS idx_comentarios_receita ON comentarios(receita_id)');
  await executar(`CREATE TABLE IF NOT EXISTS historico_peso (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, peso REAL NOT NULL,
    anotacao TEXT, data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS usuarios_seguem_usuarios (
    seguidor_id INTEGER NOT NULL, seguindo_id INTEGER NOT NULL, data_seguindo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (seguidor_id, seguindo_id), CHECK (seguidor_id <> seguindo_id),
    FOREIGN KEY (seguidor_id) REFERENCES usuarios(id), FOREIGN KEY (seguindo_id) REFERENCES usuarios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS usuarios_seguem_planos (
    usuario_id INTEGER NOT NULL, plano_id INTEGER NOT NULL, data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dias_completos INTEGER DEFAULT 0, saiu_da_dieta INTEGER DEFAULT 0,
    PRIMARY KEY (usuario_id, plano_id), FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS mensagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT, remetente_id INTEGER NOT NULL, destinatario_id INTEGER NOT NULL,
    conteudo TEXT NOT NULL, tipo TEXT DEFAULT 'texto', arquivo_url TEXT, lido INTEGER DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS grupos_suporte (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, descricao TEXT NOT NULL, criado_por INTEGER NOT NULL,
    foto_grupo_url TEXT, ativo INTEGER DEFAULT 1, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS membros_grupo (
    grupo_id INTEGER NOT NULL, usuario_id INTEGER NOT NULL, papel TEXT DEFAULT 'membro',
    PRIMARY KEY (grupo_id, usuario_id), FOREIGN KEY (grupo_id) REFERENCES grupos_suporte(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS mensagens_grupo (
    id INTEGER PRIMARY KEY AUTOINCREMENT, grupo_id INTEGER NOT NULL, usuario_id INTEGER NOT NULL, conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (grupo_id) REFERENCES grupos_suporte(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS notificacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, tipo TEXT NOT NULL, titulo TEXT NOT NULL,
    conteudo TEXT, relacionado_id INTEGER, lido INTEGER DEFAULT 0, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS bloqueios (
    bloqueador_id INTEGER NOT NULL, bloqueado_id INTEGER NOT NULL, motivo TEXT,
    data_bloqueio TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (bloqueador_id, bloqueado_id),
    FOREIGN KEY (bloqueador_id) REFERENCES usuarios(id), FOREIGN KEY (bloqueado_id) REFERENCES usuarios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS reportes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, denunciante_id INTEGER NOT NULL, tipo TEXT NOT NULL, alvo_id INTEGER NOT NULL,
    motivo TEXT NOT NULL, status TEXT DEFAULT 'pendente', data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (denunciante_id) REFERENCES usuarios(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS desafios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT NOT NULL, dias INTEGER,
    criado_por INTEGER NOT NULL, ativo INTEGER DEFAULT 1, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
  )`);
  await executar('CREATE INDEX IF NOT EXISTS idx_mensagens_conversa ON mensagens(remetente_id, destinatario_id, data_criacao)');
  await executar('CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id, lido, data_criacao DESC)');
  await executar(`CREATE TABLE IF NOT EXISTS ingredientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL UNIQUE, 
    tipo_alimento TEXT, categoria TEXT, calorias_por_100g REAL, 
    proteina_por_100g REAL, carboidrato_por_100g REAL, gordura_por_100g REAL, 
    fibra_por_100g REAL, foto_url TEXT, ativo INTEGER DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS receitas_ingredientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, receita_id INTEGER NOT NULL, ingrediente_id INTEGER NOT NULL,
    quantidade REAL NOT NULL, unidade_medida TEXT NOT NULL, 
    FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE,
    FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id)
  )`);
  await executar(`CREATE TABLE IF NOT EXISTS planos_gerados_ia (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER, plano_alimentar_id INTEGER,
    parametros TEXT NOT NULL, resultado_texto TEXT, status TEXT DEFAULT 'processando',
    data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (plano_alimentar_id) REFERENCES planos_alimentares(id) ON DELETE SET NULL
  )`);
  await executar('CREATE INDEX IF NOT EXISTS idx_ingredientes_nome ON ingredientes(nome)');
  await executar('CREATE INDEX IF NOT EXISTS idx_receitas_ingredientes ON receitas_ingredientes(receita_id)');
  await executar('CREATE INDEX IF NOT EXISTS idx_planos_gerados_ia_usuario ON planos_gerados_ia(usuario_id)');
};
module.exports = { banco, executar, buscar, listar, inicializarBanco };
