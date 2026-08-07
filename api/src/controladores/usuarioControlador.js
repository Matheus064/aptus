const banco = require('../config/conexaoBanco')
const bcrypt = require('bcryptjs')
const { validarCadastro, validarLogin, validarPerfil } = require('../utilitarios/validadores')
const { gerarToken } = require('../middlewares/autenticacao')

function cadastrar(req, res) {
  const { valido, erros, dados } = validarCadastro(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const existente = banco.prepare('SELECT id FROM usuarios WHERE email = ?').get(dados.email)
  if (existente) return res.status(409).json({ sucesso: false, mensagem: 'E-mail ja cadastrado.' })

  const hash = bcrypt.hashSync(dados.senha, 10)
  const inserir = banco.prepare('INSERT INTO usuarios (nome_completo, email, senha) VALUES (?, ?, ?)')
  const resultado = inserir.run(dados.nome_completo, dados.email, hash)

  const token = gerarToken({ id: resultado.lastInsertRowid, email: dados.email })

  res.status(201).json({
    sucesso: true,
    mensagem: 'Usuario cadastrado com sucesso!',
    dados: { id: resultado.lastInsertRowid, nome: dados.nome_completo, email: dados.email, token }
  })
}

function login(req, res) {
  const { valido, erros, dados } = validarLogin(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const usuario = banco.prepare('SELECT * FROM usuarios WHERE email = ?').get(dados.email)
  if (!usuario) return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha invalidos.' })

  const senhaValida = bcrypt.compareSync(dados.senha, usuario.senha)
  if (!senhaValida) return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha invalidos.' })

  const token = gerarToken({ id: usuario.id, email: usuario.email })

  res.json({
    sucesso: true,
    mensagem: 'Login realizado com sucesso!',
    dados: {
      id: usuario.id,
      nome: usuario.nome_completo,
      email: usuario.email,
      peso_atual: usuario.peso_atual,
      peso_meta: usuario.peso_meta,
      altura: usuario.altura,
      token
    }
  })
}

function obterPerfil(req, res) {
  const usuario = banco.prepare('SELECT id, nome_completo, email, data_nascimento, peso_atual, peso_meta, altura, data_cadastro FROM usuarios WHERE id = ?').get(req.usuario.id)
  if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuario nao encontrado.' })

  res.json({ sucesso: true, dados: usuario })
}

function atualizarPerfil(req, res) {
  const { valido, erros, dados } = validarPerfil(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const atualizar = banco.prepare('UPDATE usuarios SET peso_atual = ?, peso_meta = ?, altura = ?, data_nascimento = ? WHERE id = ?')
  atualizar.run(dados.peso_atual, dados.peso_meta, dados.altura, dados.data_nascimento, req.usuario.id)

  res.json({ sucesso: true, mensagem: 'Perfil atualizado com sucesso!' })
}

module.exports = { cadastrar, login, obterPerfil, atualizarPerfil }
