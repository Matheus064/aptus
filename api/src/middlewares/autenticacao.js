const jwt = require('jsonwebtoken')
require('dotenv')

const CHAVE_SECRET = process.env.JWT_SECRET || 'aptus_chave_secreta_2026'

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization

  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    return res.status(401).json({ sucesso: false, mensagem: 'Acesso negado. Token nao fornecido.' })
  }

  const token = cabecalho.split(' ')[1]

  try {
    const decodificado = jwt.verify(token, CHAVE_SECRET)
    req.usuario = decodificado
    next()
  } catch (erro) {
    return res.status(401).json({ sucesso: false, mensagem: 'Token invalido ou expirado.' })
  }
}

function gerarToken(dados) {
  return jwt.sign(dados, CHAVE_SECRET, { expiresIn: '7d' })
}

function autenticarRole(...rolesPermitidos) {
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

module.exports = { autenticar, gerarToken, autenticarRole, autorizacao: autenticarRole }
