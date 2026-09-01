function autorizacao(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !req.usuario.role) {
      return res.status(401).json({ sucesso: false, mensagem: 'Acesso negado. Token inválido.' })
    }

    const roleUsuario = req.usuario.role
    const temPermissao = rolesPermitidos.some((role) => role === roleUsuario)

    if (!temPermissao) {
      const rolesFormatados = rolesPermitidos.join(', ')
      return res.status(403).json({
        sucesso: false,
        mensagem: `Acesso negado. Este recurso requer perfil: ${rolesFormatados}.`,
      })
    }

    next()
  }
}

module.exports = autorizacao