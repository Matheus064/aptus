const jwt = require('jsonwebtoken');

const segredo = process.env.JWT_SECRET || 'desenvolvimento-chave-com-no-minimo-32-caracteres';
const expiracao = process.env.JWT_EXPIRACAO || '24h';

const gerarToken = (usuario) => jwt.sign(
  { sub: String(usuario.id), role: usuario.role },
  segredo,
  { expiresIn: expiracao }
);

const verificarToken = (token) => jwt.verify(token, segredo);

module.exports = { gerarToken, verificarToken };
