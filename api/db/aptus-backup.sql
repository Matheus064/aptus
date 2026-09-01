-- Dump gerado por api/scripts/exportarBanco.js
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
CREATE TABLE acoes_pontuadas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, acao TEXT NOT NULL,
    referencia_id INTEGER, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, acao, referencia_id), FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );
CREATE TABLE bloqueios (
    bloqueador_id INTEGER NOT NULL, bloqueado_id INTEGER NOT NULL, motivo TEXT,
    data_bloqueio TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (bloqueador_id, bloqueado_id),
    FOREIGN KEY (bloqueador_id) REFERENCES usuarios(id), FOREIGN KEY (bloqueado_id) REFERENCES usuarios(id)
  );
CREATE TABLE comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, receita_id INTEGER,
    exercicio_id INTEGER, conteudo TEXT NOT NULL, foto_url TEXT, curtidas INTEGER DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK ((receita_id IS NOT NULL) != (exercicio_id IS NOT NULL)),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (receita_id) REFERENCES receitas(id), FOREIGN KEY (exercicio_id) REFERENCES exercicios(id)
  );
CREATE TABLE comentarios_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, post_id INTEGER NOT NULL,
    conteudo TEXT NOT NULL, curtidas INTEGER DEFAULT 0, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY(post_id) REFERENCES posts_usuarios(id) ON DELETE CASCADE
  );
CREATE TABLE curtidas_exercicios (
    usuario_id INTEGER NOT NULL, exercicio_id INTEGER NOT NULL,
    PRIMARY KEY (usuario_id, exercicio_id), FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id)
  );
CREATE TABLE curtidas_posts (
    usuario_id INTEGER NOT NULL, post_id INTEGER NOT NULL, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(usuario_id, post_id), FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY(post_id) REFERENCES posts_usuarios(id) ON DELETE CASCADE
  );
CREATE TABLE curtidas_receitas (
    usuario_id INTEGER NOT NULL, receita_id INTEGER NOT NULL, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, receita_id), FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (receita_id) REFERENCES receitas(id)
  );
CREATE TABLE desafios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT NOT NULL, dias INTEGER,
    criado_por INTEGER NOT NULL, ativo INTEGER DEFAULT 1, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
  );
CREATE TABLE exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, descricao TEXT NOT NULL,
    tecnica TEXT NOT NULL, criado_por INTEGER NOT NULL, video_url TEXT,
    musculos_trabalhados TEXT DEFAULT '[]', dificuldade INTEGER, series_recomendadas INTEGER,
    repeticoes_recomendadas INTEGER, descanso_segundos INTEGER, contraindicacoes TEXT,
    praticas INTEGER DEFAULT 0, curtidas INTEGER DEFAULT 0, ativo INTEGER DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
  );
CREATE TABLE exercicios_execucao (
    id INTEGER PRIMARY KEY AUTOINCREMENT, exercicio_id INTEGER NOT NULL UNIQUE,
    execucao_estruturada TEXT DEFAULT '[]', tempo_total_execucao_segundos INTEGER DEFAULT 0,
    video_completo_url TEXT, video_curto_url TEXT, videos_por_angulo TEXT DEFAULT '{}',
    equipamento_necessario TEXT DEFAULT '[]', dicas_seguranca TEXT DEFAULT '[]',
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE
  );
CREATE TABLE grupos_suporte (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, descricao TEXT NOT NULL, criado_por INTEGER NOT NULL,
    foto_grupo_url TEXT, ativo INTEGER DEFAULT 1, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
  );
CREATE TABLE historico_consumo_usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, data DATE NOT NULL,
    receita_id INTEGER NOT NULL, refeicao TEXT, consumido INTEGER DEFAULT 1,
    porcoes_consumidas REAL, calorias_consumidas INTEGER, macros_consumidas TEXT DEFAULT '{}',
    foto_url TEXT, notas TEXT, sentimento INTEGER CHECK(sentimento BETWEEN 1 AND 5),
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(usuario_id, data, receita_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE
  );
CREATE TABLE historico_exercicios_usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, exercicio_id INTEGER NOT NULL,
    sessao_id TEXT, data_execucao DATE NOT NULL, completado INTEGER DEFAULT 0,
    series_completadas INTEGER, repeticoes_completadas INTEGER, peso_usado REAL,
    tempo_total_segundos INTEGER, dificuldade_percebida INTEGER CHECK(dificuldade_percebida BETWEEN 1 AND 10),
    tecnica_correcta INTEGER CHECK(tecnica_correcta BETWEEN 0 AND 100), dor_ou_desconforto TEXT,
    notas TEXT, analise_ia TEXT, score_execucao INTEGER CHECK(score_execucao BETWEEN 0 AND 100),
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE
  );
CREATE TABLE historico_peso (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, peso REAL NOT NULL,
    anotacao TEXT, data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );
CREATE TABLE ia_agentes_preferencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL UNIQUE,
    dietas_favoritas TEXT DEFAULT '[]', ingredientes_favoritos TEXT DEFAULT '[]', ingredientes_odeia TEXT DEFAULT '[]',
    calorias_preferidas INTEGER, tempo_preparo_maximo INTEGER, musculos_preferem_treinar TEXT DEFAULT '[]',
    dificuldade_exercicios INTEGER, tempo_treino_preferido INTEGER, objetivo_principal TEXT,
    meta_peso_kg REAL, data_meta DATE, horario_mais_ativo TEXT DEFAULT '[]', dias_mais_ativos TEXT DEFAULT '[]',
    score_compatibilidade_ultima_recomendacao REAL, last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );
CREATE TABLE ia_recomendacoes_usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, tipo TEXT NOT NULL,
    item_id INTEGER, score_compatibilidade REAL, motivo_recomendacao TEXT, motivos_detalhados TEXT DEFAULT '[]',
    mostrado INTEGER DEFAULT 0, clicado INTEGER DEFAULT 0, curtido INTEGER DEFAULT 0, salvo INTEGER DEFAULT 0,
    gerado_por_agente TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );
CREATE TABLE ingredientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL UNIQUE, 
    tipo_alimento TEXT, categoria TEXT, calorias_por_100g REAL, 
    proteina_por_100g REAL, carboidrato_por_100g REAL, gordura_por_100g REAL, 
    fibra_por_100g REAL, foto_url TEXT, ativo INTEGER DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
CREATE TABLE lista_compras_usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, plano_id INTEGER,
    data_criada TIMESTAMP DEFAULT CURRENT_TIMESTAMP, data_compra TIMESTAMP,
    itens TEXT NOT NULL DEFAULT '[]', total_estimado REAL DEFAULT 0, total_pago REAL DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id) ON DELETE CASCADE
  );
CREATE TABLE membros_grupo (
    grupo_id INTEGER NOT NULL, usuario_id INTEGER NOT NULL, papel TEXT DEFAULT 'membro',
    PRIMARY KEY (grupo_id, usuario_id), FOREIGN KEY (grupo_id) REFERENCES grupos_suporte(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );
CREATE TABLE mensagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT, remetente_id INTEGER NOT NULL, destinatario_id INTEGER NOT NULL,
    conteudo TEXT NOT NULL, tipo TEXT DEFAULT 'texto', arquivo_url TEXT, lido INTEGER DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
  );
CREATE TABLE mensagens_grupo (
    id INTEGER PRIMARY KEY AUTOINCREMENT, grupo_id INTEGER NOT NULL, usuario_id INTEGER NOT NULL, conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (grupo_id) REFERENCES grupos_suporte(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );
CREATE TABLE notificacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, tipo TEXT NOT NULL, titulo TEXT NOT NULL,
    conteudo TEXT, relacionado_id INTEGER, lido INTEGER DEFAULT 0, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );
CREATE TABLE planos_alimentares (
    id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT NOT NULL,
    criado_por INTEGER NOT NULL, duracao_dias INTEGER, calorias_alvo INTEGER, dificuldade TEXT,
    tipo TEXT CHECK(tipo IN ('público', 'personalizado', 'desafio')), proteina_alvo REAL,
    carboidrato_alvo REAL, gordura_alvo REAL, data_inicio DATE, data_fim DATE,
    foto_capa_url TEXT, seguidores INTEGER DEFAULT 0, ativo INTEGER DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (criado_por) REFERENCES usuarios(id)
  );
CREATE TABLE planos_exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, plano_id INTEGER NOT NULL, exercicio_id INTEGER NOT NULL,
    dia_semana INTEGER, ordem INTEGER, series_personalizado INTEGER, repeticoes_personalizado INTEGER,
    FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE
  );
CREATE TABLE planos_gerados_ia (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER, plano_alimentar_id INTEGER,
    parametros TEXT NOT NULL, resultado_texto TEXT, status TEXT DEFAULT 'processando',
    data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (plano_alimentar_id) REFERENCES planos_alimentares(id) ON DELETE SET NULL
  );
CREATE TABLE planos_receitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, plano_id INTEGER NOT NULL, receita_id INTEGER NOT NULL,
    dia_plano INTEGER, refeicao TEXT, FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id) ON DELETE CASCADE,
    FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE
  );
CREATE TABLE planos_receitas_detalhado (
    id INTEGER PRIMARY KEY AUTOINCREMENT, plano_id INTEGER NOT NULL, receita_id INTEGER NOT NULL,
    dia_plano INTEGER NOT NULL CHECK(dia_plano BETWEEN 1 AND 365), refeicao TEXT,
    ordem_refeicao INTEGER DEFAULT 1, porcoes_customizadas INTEGER, calorias_customizadas INTEGER,
    macros_customizadas TEXT DEFAULT '{}', notas TEXT, substitutos TEXT DEFAULT '[]',
    consumido INTEGER DEFAULT 0, data_consumo TIMESTAMP, foto_evidencia_url TEXT, ativo INTEGER DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id) ON DELETE CASCADE,
    FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE
  );
CREATE TABLE posts_usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, conteudo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('progresso','receita','exercicio','motivacao','antes_depois')),
    foto_url TEXT, video_url TEXT, hashtags TEXT DEFAULT '[]', mentions TEXT DEFAULT '[]',
    localizacao TEXT, curtidas INTEGER DEFAULT 0, comentarios_count INTEGER DEFAULT 0,
    compartilhamentos INTEGER DEFAULT 0, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );
CREATE TABLE receitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT NOT NULL,
    modo_preparo TEXT NOT NULL, criado_por INTEGER NOT NULL, calorias INTEGER,
    proteina REAL, carboidrato REAL, gordura REAL, fibra REAL, foto_url TEXT,
    tempo_preparo INTEGER, porcoes INTEGER, dificuldade TEXT, categoria TEXT,
    alergenicos TEXT DEFAULT '[]', dietas TEXT DEFAULT '[]', curtidas INTEGER DEFAULT 0,
    compartilhamentos INTEGER DEFAULT 0, ativo INTEGER DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
  );
CREATE TABLE receitas_ingredientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, receita_id INTEGER NOT NULL, ingrediente_id INTEGER NOT NULL,
    quantidade REAL NOT NULL, unidade_medida TEXT NOT NULL, 
    FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE,
    FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id)
  );
CREATE TABLE reportes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, denunciante_id INTEGER NOT NULL, tipo TEXT NOT NULL, alvo_id INTEGER NOT NULL,
    motivo TEXT NOT NULL, status TEXT DEFAULT 'pendente', data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (denunciante_id) REFERENCES usuarios(id)
  );
CREATE TABLE sessoes_exercicios (
    id TEXT PRIMARY KEY, usuario_id INTEGER NOT NULL, exercicio_id INTEGER NOT NULL,
    series_totais INTEGER NOT NULL, repeticoes_por_serie INTEGER, peso REAL,
    series_completadas INTEGER DEFAULT 0, tempo_total_segundos INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ativa', notas_gerais TEXT, data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP, FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE
  );
CREATE TABLE usuarios (
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
CREATE TABLE usuarios_medalhas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, medalha TEXT NOT NULL,
    data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(usuario_id, medalha),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );
CREATE TABLE usuarios_pontos (
    usuario_id INTEGER PRIMARY KEY, pontos INTEGER DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );
CREATE TABLE usuarios_salvam_exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, exercicio_id INTEGER NOT NULL,
    data_salva TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(usuario_id, exercicio_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE
  );
CREATE TABLE usuarios_salvam_receitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, receita_id INTEGER NOT NULL,
    data_salva TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(usuario_id, receita_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE
  );
CREATE TABLE usuarios_seguem_planos (
    usuario_id INTEGER NOT NULL, plano_id INTEGER NOT NULL, data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dias_completos INTEGER DEFAULT 0, saiu_da_dieta INTEGER DEFAULT 0,
    PRIMARY KEY (usuario_id, plano_id), FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (plano_id) REFERENCES planos_alimentares(id)
  );
CREATE TABLE usuarios_seguem_usuarios (
    seguidor_id INTEGER NOT NULL, seguindo_id INTEGER NOT NULL, data_seguindo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (seguidor_id, seguindo_id), CHECK (seguidor_id <> seguindo_id),
    FOREIGN KEY (seguidor_id) REFERENCES usuarios(id), FOREIGN KEY (seguindo_id) REFERENCES usuarios(id)
  );
CREATE INDEX idx_comentarios_receita ON comentarios(receita_id);
CREATE INDEX idx_consumo_usuario_data ON historico_consumo_usuario(usuario_id, data);
CREATE INDEX idx_exercicios_criado_em ON exercicios(data_criacao DESC);
CREATE INDEX idx_historico_exercicios_data ON historico_exercicios_usuario(usuario_id, data_execucao);
CREATE INDEX idx_ingredientes_nome ON ingredientes(nome);
CREATE INDEX idx_mensagens_conversa ON mensagens(remetente_id, destinatario_id, data_criacao);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id, lido, data_criacao DESC);
CREATE INDEX idx_planos_gerados_ia_usuario ON planos_gerados_ia(usuario_id);
CREATE INDEX idx_planos_receitas_dia ON planos_receitas_detalhado(plano_id, dia_plano);
CREATE INDEX idx_planos_tipo ON planos_alimentares(tipo);
CREATE INDEX idx_receitas_criado_em ON receitas(data_criacao DESC);
CREATE INDEX idx_receitas_ingredientes ON receitas_ingredientes(receita_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_role ON usuarios(role);
COMMIT;
PRAGMA foreign_keys = ON;
