const banco = require('../config/conexaoBanco')
const bcrypt = require('bcryptjs')
const { validarCadastro, validarLogin, validarPerfil } = require('../utilitarios/validadores')
const { gerarToken, autenticarRole } = require('../middlewares/autenticacao')

function cadastrar(req, res) {
  const { valido, erros, dados } = validarCadastro(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const existente = banco.prepare('SELECT id FROM usuarios WHERE email = ?').get(dados.email)
  if (existente) return res.status(409).json({ sucesso: false, mensagem: 'E-mail ja cadastrado.' })

  const hash = bcrypt.hashSync(dados.senha, 10)
  const role = dados.role || 'user'

  let inserir
  let resultado

  if (role === 'nutricionista') {
    inserir = banco.prepare('INSERT INTO usuarios (nome_completo, email, senha, role, numero_crn, verificado, total_seguidores, rating) VALUES (?, ?, ?, ?, ?, 0, 0, 0)')
    resultado = inserir.run(dados.nome_completo, dados.email, hash, role, dados.numero_crn)
  } else {
    inserir = banco.prepare('INSERT INTO usuarios (nome_completo, email, senha, role) VALUES (?, ?, ?, ?)')
    resultado = inserir.run(dados.nome_completo, dados.email, hash, role)
  }

  const token = gerarToken({ id: resultado.lastInsertRowid, email: dados.email, role: role })

  res.status(201).json({
    sucesso: true,
    mensagem: 'Usuario cadastrado com sucesso!',
    dados: { id: resultado.lastInsertRowid, nome: dados.nome_completo, email: dados.email, role, token }
  })
}

function login(req, res) {
  const { valido, erros, dados } = validarLogin(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const usuario = banco.prepare('SELECT * FROM usuarios WHERE email = ?').get(dados.email)
  if (!usuario) return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha invalidos.' })

  const senhaValida = bcrypt.compareSync(dados.senha, usuario.senha)
  if (!senhaValida) return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha invalidos.' })

  const token = gerarToken({ id: usuario.id, email: usuario.email, role: usuario.role })

  const perfil = {
    id: usuario.id,
    nome: usuario.nome_completo,
    email: usuario.email,
    role: usuario.role,
    peso_atual: usuario.peso_atual,
    peso_meta: usuario.peso_meta,
    altura: usuario.altura,
    foto_perfil_url: usuario.foto_perfil_url,
    bio: usuario.bio,
    numero_crn: usuario.numero_crn,
    verificado: usuario.verificado,
    rating: usuario.rating,
    total_seguidores: usuario.total_seguidores
  }

  res.json({
    sucesso: true,
    mensagem: 'Login realizado com sucesso!',
    dados: { ...perfil, token }
  })
}

function obterPerfil(req, res) {
  const usuario = banco.prepare('SELECT id, nome_completo, email, data_nascimento, peso_atual, peso_meta, altura, data_cadastro, foto_perfil_url, bio, numero_crn, verificado, rating, total_seguidores FROM usuarios WHERE id = ?').get(req.usuario.id)
  if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuario nao encontrado.' })

  res.json({ sucesso: true, dados: usuario })
}

function atualizarPerfil(req, res) {
  const { valido, erros, dados } = validarPerfil(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const atualizar = banco.prepare('UPDATE usuarios SET peso_atual = ?, peso_meta = ?, altura = ?, data_nascimento = ?, bio = ?, foto_perfil_url = ? WHERE id = ?')
  atualizar.run(dados.peso_atual, dados.peso_meta, dados.altura, dados.data_nascimento, dados.bio || null, dados.foto_perfil_url || null, req.usuario.id)

  res.json({ sucesso: true, mensagem: 'Perfil atualizado com sucesso!' })
}

function verificarNutricionista(req, res) {
  const { numero_crn, especializacoes } = req.body

  const existente = banco.prepare('SELECT id FROM usuarios WHERE email = ? AND role = ?').get(req.usuario.email, 'nutricionista')
  if (!existente) return res.status(403).json({ sucesso: false, mensagem: 'Apenas nutricionistas podem ser verificados.' })

  const atualizar = banco.prepare('UPDATE usuarios SET numero_crn = ?, especializacoes = ?, verificado = 1 WHERE id = ?')
  atualizar.run(numero_crn || existente.numero_crn, especializacoes || [], existente.id)

  res.json({ sucesso: true, mensagem: 'Nutricionista verificado com sucesso!', dados: { verificado: 1 } })
}

module.exports = { cadastrar, login, obterPerfil, atualizarPerfil, verificarNutricionista }
