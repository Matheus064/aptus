const jwt = require('jsonwebtoken');

const segredoConfigurado = process.env.JWT_SECRET;
const segredoPadrao = /^(troque-esta-chave|desenvolvimento-chave|aptus_chave_secreta|sua-chave)/i.test(segredoConfigurado || '');

if (process.env.NODE_ENV === 'production' && (!segredoConfigurado || segredoConfigurado.length < 32 || segredoPadrao)) {
  throw new Error('JWT_SECRET precisa ser definido como segredo aleatório com pelo menos 32 caracteres em produção.');
}

const segredo = segredoConfigurado || 'desenvolvimento-chave-com-no-minimo-32-caracteres';
const expiracao = process.env.JWT_EXPIRACAO || '24h';

const gerarToken = (usuario) => jwt.sign(
  { sub: String(usuario.id), role: usuario.role },
  segredo,
  { expiresIn: expiracao }
);

const verificarToken = (token) => jwt.verify(token, segredo);

module.exports = { gerarToken, verificarToken };
