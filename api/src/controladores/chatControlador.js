const banco = require('../config/conexaoBanco')
const { validarMensagem, validarGrupo } = require('../utilitarios/validadores')

function listarConversas(req, res) {
  const conversas = banco.prepare(`
    SELECT c.id, c.data_criacao,
      u1.nome_completo AS usuario1_nome,
      u2.nome_completo AS usuario2_nome
    FROM conversas c
    JOIN usuarios u1 ON c.usuario1_id = u1.id
    JOIN usuarios u2 ON c.usuario2_id = u2.id
    WHERE c.usuario1_id = ? OR c.usuario2_id = ?
    ORDER BY c.data_criacao DESC
  `).all(req.usuario.id, req.usuario.id)

  const conversasFormatadas = conversas.map(conv => {
    const outroId = conv.usuario1_id === req.usuario.id ? conv.usuario2_id : conv.usuario1_id
    const outroNome = conv.usuario2_id === req.usuario.id ? conv.usuario1_nome : conv.usuario2_nome

    const ultimaMensagem = banco.prepare(
      'SELECT m.conteudo, m.data_envio, m.lida FROM mensagens m WHERE m.conversa_id = ? ORDER BY m.data_envio DESC LIMIT 1'
    ).get(conv.id)

    const naoLidas = banco.prepare(
      'SELECT COUNT(*) AS total FROM mensagens WHERE conversa_id = ? AND remetente_id != ? AND lida = 0'
    ).get(conv.id, req.usuario.id)

    return {
      id: conv.id,
      tipo: 'direta',
      nome: outroNome,
      data_criacao: conv.data_criacao,
      ultima_mensagem: ultimaMensagem ? ultimaMensagem.conteudo : null,
      ultima_data: ultimaMensagem ? ultimaMensagem.data_envio : null,
      nao_lidas: naoLidas.total
    }
  })

  const grupos = banco.prepare(`
    SELECT g.id, g.nome, g.descricao, g.data_criacao
    FROM grupos g
    JOIN grupo_membros gm ON g.id = gm.grupo_id
    WHERE gm.usuario_id = ?
    ORDER BY g.data_criacao DESC
  `).all(req.usuario.id)

  grupos.forEach(grupo => {
    const ultimaMensagem = banco.prepare(
      'SELECT conteudo, data_envio FROM mensagens_grupo WHERE grupo_id = ? ORDER BY data_envio DESC LIMIT 1'
    ).get(grupo.id)
    grupo.tipo = 'grupo'
    grupo.ultima_mensagem = ultimaMensagem ? ultimaMensagem.conteudo : null
    grupo.ultima_data = ultimaMensagem ? ultimaMensagem.data_envio : null
    grupo.nao_lidas = 0
  })

  res.json({ sucesso: true, dados: [...conversasFormatadas, ...grupos] })
}

function obterConversa(req, res) {
  const outroId = parseInt(req.params.id)
  if (!outroId || isNaN(outroId)) {
    return res.status(422).json({ sucesso: false, mensagem: 'ID de usuario invalido.' })
  }

  if (outroId === req.usuario.id) {
    return res.status(400).json({ sucesso: false, mensagem: 'Nao e possivel iniciar uma conversa consigo mesmo.' })
  }

  const outroUsuario = banco.prepare('SELECT id FROM usuarios WHERE id = ?').get(outroId)
  if (!outroUsuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuario nao encontrado.' })

  let conversa = banco.prepare(
    'SELECT id FROM conversas WHERE (usuario1_id = ? AND usuario2_id = ?) OR (usuario1_id = ? AND usuario2_id = ?)'
  ).get(req.usuario.id, outroId, outroId, req.usuario.id)

  if (!conversa) {
    const inserir = banco.prepare('INSERT INTO conversas (usuario1_id, usuario2_id) VALUES (?, ?)')
    const resultado = inserir.run(req.usuario.id, outroId)
    conversa = { id: resultado.lastInsertRowid }
  }

  banco.prepare('UPDATE mensagens SET lida = 1 WHERE conversa_id = ? AND remetente_id = ? AND lida = 0')
    .run(conversa.id, outroId)

  const mensagens = banco.prepare(`
    SELECT m.id, m.conteudo, m.data_envio, m.lida,
      u.nome_completo AS remetente_nome
    FROM mensagens m
    JOIN usuarios u ON m.remetente_id = u.id
    WHERE m.conversa_id = ?
    ORDER BY m.data_envio ASC
  `).all(conversa.id)

  const usuarioDestino = banco.prepare('SELECT id, nome_completo, email FROM usuarios WHERE id = ?').get(outroId)

  res.json({
    sucesso: true,
    dados: {
      conversa_id: conversa.id,
      tipo: 'direta',
      destinatario: usuarioDestino,
      mensagens
    }
  })
}

function enviarMensagem(req, res) {
  const { valido, erros, dados } = validarMensagem(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const conversaId = parseInt(req.params.id)
  if (!conversaId || isNaN(conversaId)) {
    return res.status(422).json({ sucesso: false, mensagem: 'ID de conversa invalido.' })
  }

  let conversa = banco.prepare(
    'SELECT id FROM conversas WHERE (usuario1_id = ? AND usuario2_id = ?) OR (usuario1_id = ? AND usuario2_id = ?)'
  ).get(req.usuario.id, dados.destino_id, dados.destino_id, req.usuario.id)

  if (!conversa) {
    const inserirConv = banco.prepare('INSERT INTO conversas (usuario1_id, usuario2_id) VALUES (?, ?)')
    const resultadoConv = inserirConv.run(req.usuario.id, dados.destino_id)
    conversa = { id: resultadoConv.lastInsertRowid }
  }

  const inserir = banco.prepare('INSERT INTO mensagens (conversa_id, remetente_id, conteudo) VALUES (?, ?, ?)')
  const resultado = inserir.run(conversa.id, req.usuario.id, dados.conteudo)

  const pontosControlador = require('./pontosControlador')
  pontosControlador.atribuirPontos(req.usuario.id, 5, 'mensagem_enviada')

  res.status(201).json({
    sucesso: true,
    mensagem: 'Mensagem enviada!',
    dados: { id: resultado.lastInsertRowid, ...dados }
  })
}

function criarGrupo(req, res) {
  const { valido, erros, dados } = validarGrupo(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const inserir = banco.prepare('INSERT INTO grupos (nome, descricao, criador_id) VALUES (?, ?, ?)')
  const resultado = inserir.run(dados.nome, dados.descricao, req.usuario.id)

  const inserirMembro = banco.prepare('INSERT INTO grupo_membros (grupo_id, usuario_id, administrador) VALUES (?, ?, 1)')
  inserirMembro.run(resultado.lastInsertRowid, req.usuario.id)

  const pontosControlador = require('./pontosControlador')
  pontosControlador.atribuirPontos(req.usuario.id, 20, 'grupo_criado')

  res.status(201).json({
    sucesso: true,
    mensagem: 'Grupo criado com sucesso!',
    dados: { id: resultado.lastInsertRowid, ...dados }
  })
}

function listarGrupos(req, res) {
  const grupos = banco.prepare(`
    SELECT g.id, g.nome, g.descricao, g.data_criacao, g.criador_id, u.nome_completo AS criador_nome
    FROM grupos g
    JOIN usuarios u ON g.criador_id = u.id
    JOIN grupo_membros gm ON g.id = gm.grupo_id
    WHERE gm.usuario_id = ?
    ORDER BY g.data_criacao DESC
  `).all(req.usuario.id)

  const totalMembros = grupos.map(grupo => {
    const count = banco.prepare('SELECT COUNT(*) AS total FROM grupo_membros WHERE grupo_id = ?').get(grupo.id)
    return { ...grupo, total_membros: count.total }
  })

  res.json({ sucesso: true, dados: totalMembros })
}

function obterGrupo(req, res) {
  const grupoId = parseInt(req.params.id)
  if (!grupoId || isNaN(grupoId)) {
    return res.status(422).json({ sucesso: false, mensagem: 'ID de grupo invalido.' })
  }

  const grupo = banco.prepare(`
    SELECT g.*, u.nome_completo AS criador_nome
    FROM grupos g
    JOIN usuarios u ON g.criador_id = u.id
    WHERE g.id = ?
  `).get(grupoId)

  if (!grupo) return res.status(404).json({ sucesso: false, mensagem: 'Grupo nao encontrado.' })

  const membro = banco.prepare('SELECT id FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ?').get(grupoId, req.usuario.id)
  if (!membro) return res.status(403).json({ sucesso: false, mensagem: 'Voce nao e membro deste grupo.' })

  const membros = banco.prepare(`
    SELECT u.id, u.nome_completo, gm.administrador, gm.data_entrada
    FROM grupo_membros gm
    JOIN usuarios u ON gm.usuario_id = u.id
    WHERE gm.grupo_id = ?
    ORDER BY gm.data_entrada ASC
  `).all(grupoId)

  const mensagens = banco.prepare(`
    SELECT mg.id, mg.conteudo, mg.data_envio, u.nome_completo AS remetente_nome
    FROM mensagens_grupo mg
    JOIN usuarios u ON mg.remetente_id = u.id
    WHERE mg.grupo_id = ?
    ORDER BY mg.data_envio ASC
  `).all(grupoId)

  res.json({ sucesso: true, dados: { ...grupo, membros, mensagens } })
}

function enviarMensagemGrupo(req, res) {
  const { valido, erros, dados } = validarMensagem(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados invalidos.', erros })

  const grupoId = parseInt(req.params.id)
  if (!grupoId || isNaN(grupoId)) {
    return res.status(422).json({ sucesso: false, mensagem: 'ID de grupo invalido.' })
  }

  const grupo = banco.prepare('SELECT id FROM grupos WHERE id = ?').get(grupoId)
  if (!grupo) return res.status(404).json({ sucesso: false, mensagem: 'Grupo nao encontrado.' })

  const membro = banco.prepare('SELECT id FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ?').get(grupoId, req.usuario.id)
  if (!membro) return res.status(403).json({ sucesso: false, mensagem: 'Voce nao e membro deste grupo.' })

  const inserir = banco.prepare('INSERT INTO mensagens_grupo (grupo_id, remetente_id, conteudo) VALUES (?, ?, ?)')
  const resultado = inserir.run(grupoId, req.usuario.id, dados.conteudo)

  const pontosControlador = require('./pontosControlador')
  pontosControlador.atribuirPontos(req.usuario.id, 5, 'mensagem_grupo_enviada')

  res.status(201).json({
    sucesso: true,
    mensagem: 'Mensagem enviada!',
    dados: { id: resultado.lastInsertRowid, ...dados }
  })
}

function entrarGrupo(req, res) {
  const grupoId = parseInt(req.params.id)
  if (!grupoId || isNaN(grupoId)) {
    return res.status(422).json({ sucesso: false, mensagem: 'ID de grupo invalido.' })
  }

  const grupo = banco.prepare('SELECT id FROM grupos WHERE id = ?').get(grupoId)
  if (!grupo) return res.status(404).json({ sucesso: false, mensagem: 'Grupo nao encontrado.' })

  const membro = banco.prepare('SELECT id FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ?').get(grupoId, req.usuario.id)
  if (membro) return res.status(400).json({ sucesso: false, mensagem: 'Voce ja e membro deste grupo.' })

  const inserir = banco.prepare('INSERT INTO grupo_membros (grupo_id, usuario_id) VALUES (?, ?)')
  inserir.run(grupoId, req.usuario.id)

  res.status(201).json({ sucesso: true, mensagem: 'Entrou no grupo com sucesso!' })
}

function listarGruposDisponiveis(req, res) {
  const grupos = banco.prepare(`
    SELECT g.id, g.nome, g.descricao, g.data_criacao, u.nome_completo AS criador_nome,
      (SELECT COUNT(*) FROM grupo_membros WHERE grupo_id = g.id) AS total_membros
    FROM grupos g
    JOIN usuarios u ON g.criador_id = u.id
    WHERE g.id NOT IN (
      SELECT gm.grupo_id FROM grupo_membros gm WHERE gm.usuario_id = ?
    )
    ORDER BY g.data_criacao DESC
  `).all(req.usuario.id)

  res.json({ sucesso: true, dados: grupos })
}

function buscarUsuarios(req, res) {
  const termo = req.query.termo ? req.query.termo.trim() : ''
  if (!termo) return res.json({ sucesso: true, dados: [] })

  const usuarios = banco.prepare(
    'SELECT id, nome_completo, email FROM usuarios WHERE nome_completo LIKE ? AND id != ? LIMIT 20'
  ).all(`%${termo}%`, req.usuario.id)

  res.json({ sucesso: true, dados: usuarios })
}

module.exports = {
  listarConversas,
  obterConversa,
  enviarMensagem,
  criarGrupo,
  listarGrupos,
  obterGrupo,
  enviarMensagemGrupo,
  entrarGrupo,
  listarGruposDisponiveis,
  buscarUsuarios
}
