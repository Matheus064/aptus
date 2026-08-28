const autorizar = (...roles) => (req, res, next) => (
  roles.includes(req.usuario?.role) ? next() : res.status(403).json({ erro: 'Você não tem permissão para esta ação.' })
);
module.exports = autorizar;
