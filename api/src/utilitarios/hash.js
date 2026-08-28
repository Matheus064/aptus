const bcrypt = require('bcryptjs');

const custo = Number(process.env.BCRYPT_ROUNDS || 10);
const criarHash = (senha) => bcrypt.hash(senha, custo);
const compararHash = (senha, hash) => bcrypt.compare(senha, hash);

module.exports = { criarHash, compararHash };
