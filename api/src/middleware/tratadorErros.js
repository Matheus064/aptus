function tratadorErros(erro, req, res, next) { // eslint-disable-line no-unused-vars
  if (erro?.code === 'SQLITE_CONSTRAINT') return res.status(409).json({ erro: 'Esse dado já está em uso.' });
  console.error(erro);
  return res.status(500).json({ erro: 'Ocorreu um erro inesperado.' });
}
module.exports = tratadorErros;
