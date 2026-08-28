const { executar, buscar } = require('../config/conexaoBanco');
const { gerarToken } = require('../config/auth');
const { criarHash, compararHash } = require('../utilitarios/hash');
const { rolesPublicas, emailValido, senhaValida, textoObrigatorio } = require('../utilitarios/validadores');

const perfil = (usuario) => ({
  id: usuario.id,
  nome_completo: usuario.nome_completo,
  email: usuario.email,
  telefone: usuario.telefone,
  role: usuario.role,
  peso_atual: usuario.peso_atual,
  peso_meta: usuario.peso_meta,
  altura: usuario.altura,
  data_nascimento: usuario.data_nascimento,
  numero_crn: usuario.numero_crn,
  especializacoes: usuario.especializacoes ? JSON.parse(usuario.especializacoes) : [],
  verificado: Boolean(usuario.verificado),
  foto_perfil_url: usuario.foto_perfil_url,
  bio: usuario.bio,
});

const registro = async (req, res, next) => {
  try {
    const { nome_completo, email, senha, role = 'user' } = req.body;
    if (!textoObrigatorio(nome_completo) || !emailValido(email) || !senhaValida(senha) || !rolesPublicas.has(role)) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nome, email, senha (mínimo 8 caracteres) ou role inválidos.' });
    }
    const existente = await buscar('SELECT id FROM usuarios WHERE email = ?', [email.trim()]);
    if (existente) return res.status(409).json({ sucesso: false, mensagem: 'Email já está em uso.' });

    const resultado = await executar(
      'INSERT INTO usuarios (nome_completo, email, senha, role) VALUES (?, ?, ?, ?)',
      [nome_completo.trim(), email.trim().toLowerCase(), await criarHash(senha), role]
    );
    const usuario = await buscar('SELECT * FROM usuarios WHERE id = ?', [resultado.id]);
    return res.status(201).json({ token: gerarToken(usuario), usuario: perfil(usuario) });
  } catch (erro) { return next(erro); }
};

const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const usuario = await buscar('SELECT * FROM usuarios WHERE email = ?', [String(email || '').trim()]);
    if (!usuario || !(await compararHash(String(senha || ''), usuario.senha))) {
      return res.status(401).json({ sucesso: false, mensagem: 'Email ou senha inválidos.' });
    }
    if (!usuario.ativo || usuario.bloqueado) return res.status(403).json({ sucesso: false, mensagem: 'Usuário bloqueado ou inativo.' });
    return res.json({ token: gerarToken(usuario), usuario: perfil(usuario) });
  } catch (erro) { return next(erro); }
};

const logout = (req, res) => res.json({ sucesso: true });

const verificarNutricionista = async (req, res, next) => {
  try {
    const { numero_crn, especializacoes = [] } = req.body;
    if (req.usuarioRole !== 'nutricionista' || !textoObrigatorio(numero_crn) || !Array.isArray(especializacoes)) {
      return res.status(400).json({ sucesso: false, mensagem: 'Dados profissionais inválidos.' });
    }
    const crnEmUso = await buscar('SELECT id FROM usuarios WHERE numero_crn = ? AND id <> ?', [numero_crn.trim(), req.usuarioId]);
    if (crnEmUso) return res.status(409).json({ sucesso: false, mensagem: 'CRN já está em uso.' });
    await executar('UPDATE usuarios SET numero_crn = ?, especializacoes = ?, verificado = 0, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?', [numero_crn.trim(), JSON.stringify(especializacoes), req.usuarioId]);
    return res.json({ sucesso: true, mensagem: 'Dados enviados para verificação.' });
  } catch (erro) { return next(erro); }
};

const obterPerfil = async (req, res, next) => {
  try {
    const usuario = await buscar('SELECT * FROM usuarios WHERE id = ?', [req.usuarioId]);
    if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    return res.json({ usuario: perfil(usuario) });
  } catch (erro) { return next(erro); }
};

const atualizarSaude = async (req, res, next) => {
  try {
    const { peso_atual, peso_meta, altura, data_nascimento } = req.body;
    if (![peso_atual, peso_meta, altura].every((valor) => Number.isFinite(Number(valor)) && Number(valor) > 0)) return res.status(400).json({ sucesso: false, mensagem: 'Dados de saúde inválidos.' });
    await executar('UPDATE usuarios SET peso_atual = ?, peso_meta = ?, altura = ?, data_nascimento = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?', [peso_atual, peso_meta, altura, data_nascimento || null, req.usuarioId]);
    return obterPerfil(req, res, next);
  } catch (erro) { return next(erro); }
};

module.exports = { registro, login, logout, verificarNutricionista, obterPerfil, atualizarSaude };
