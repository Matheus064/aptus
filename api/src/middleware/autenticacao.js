const { verificarToken } = require('../config/auth');

function autenticacao(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
  if (!token) return res.status(401).json({ erro: 'Token de acesso ausente.' });
  try { req.usuario = verificarToken(token); return next(); }
  catch { return res.status(401).json({ erro: 'Token de acesso inválido ou expirado.' }); }
}
module.exports = autenticacao;
