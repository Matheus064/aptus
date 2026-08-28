const { executar, buscar } = require('../config/conexaoBanco');
const { gerarToken } = require('../config/auth');
const { criarHash, compararHash } = require('../utilitarios/hash');
const { rolesPublicas, emailValido, senhaValida, textoObrigatorio } = require('../utilitarios/validadores');
const seguro = ({ senha, ...usuario }) => usuario;

async function registro(req, res, next) {
  try {
    const { nome_completo, email, senha, role = 'user', numero_crn, ...dados } = req.body;
    if (!textoObrigatorio(nome_completo) || !emailValido(email) || !senhaValida(senha) || !rolesPublicas.has(role)) return res.status(422).json({ erro: 'Informe nome, e-mail válido, senha de no mínimo 8 caracteres e um papel permitido.' });
    if (role === 'nutricionista' && !textoObrigatorio(numero_crn)) return res.status(422).json({ erro: 'O CRN é obrigatório para nutricionistas.' });
    const resultado = await executar(`INSERT INTO usuarios (nome_completo, email, senha, role, numero_crn, telefone, peso_atual, peso_meta, altura, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [nome_completo.trim(), email.trim().toLowerCase(), await criarHash(senha), role, numero_crn || null, dados.telefone || null, dados.peso_atual || null, dados.peso_meta || null, dados.altura || null, dados.bio || null]);
    const usuario = await buscar('SELECT * FROM usuarios WHERE id = ?', [resultado.id]);
    return res.status(201).json({ usuario: seguro(usuario), token: gerarToken(usuario) });
  } catch (erro) { return next(erro); }
}
async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const usuario = email && await buscar('SELECT * FROM usuarios WHERE email = ?', [email.trim().toLowerCase()]);
    if (!usuario || !await compararHash(senha || '', usuario.senha)) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    if (!usuario.ativo || usuario.bloqueado) return res.status(403).json({ erro: 'Esta conta não está disponível.' });
    return res.json({ usuario: seguro(usuario), token: gerarToken(usuario) });
  } catch (erro) { return next(erro); }
}
async function verificarNutricionista(req, res, next) {
  try {
    const { numero_crn, especializacoes = [] } = req.body;
    if (!numero_crn || !Array.isArray(especializacoes)) return res.status(422).json({ erro: 'Informe um CRN e especializações válidos.' });
    const ocupado = await buscar('SELECT id FROM usuarios WHERE numero_crn = ? AND id <> ?', [numero_crn.trim(), req.usuario.sub]);
    if (ocupado) return res.status(409).json({ erro: 'Este CRN já está em uso.' });
    await executar('UPDATE usuarios SET numero_crn = ?, especializacoes = ?, verificado = 0, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?', [numero_crn.trim(), JSON.stringify(especializacoes), req.usuario.sub]);
    return res.json({ sucesso: true, mensagem: 'Dados enviados para verificação.' });
  } catch (erro) { return next(erro); }
}
module.exports = { registro, login, verificarNutricionista, seguro };
