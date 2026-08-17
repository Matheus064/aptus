const validator = require('validator')

function sanitizar(texto) {
  return validator.trim(validator.escape(texto || ''))
}

function validarCadastro(dados) {
  const erros = []
  const nome = sanitizar(dados.nome_completo)
  const email = sanitizar(dados.email)
  const senha = dados.senha || ''

  if (!nome || nome.length < 3 || nome.length > 150)
    erros.push('Nome completo deve ter entre 3 e 150 caracteres.')

  if (!validator.isEmail(email))
    erros.push('E-mail invalido.')

  if (!senha || senha.length < 6)
    erros.push('Senha deve ter no minimo 6 caracteres.')

  return {
    valido: erros.length === 0,
    erros,
    dados: { nome_completo: nome, email, senha }
  }
}

function validarLogin(dados) {
  const erros = []
  const email = sanitizar(dados.email)
  const senha = dados.senha || ''

  if (!validator.isEmail(email))
    erros.push('E-mail invalido.')

  if (!senha)
    erros.push('Senha e obrigatoria.')

  return {
    valido: erros.length === 0,
    erros,
    dados: { email, senha }
  }
}

function validarPerfil(dados) {
  const erros = []

  if (dados.peso_atual !== undefined && (isNaN(dados.peso_atual) || dados.peso_atual <= 0))
    erros.push('Peso atual deve ser um numero positivo.')

  if (dados.peso_meta !== undefined && (isNaN(dados.peso_meta) || dados.peso_meta <= 0))
    erros.push('Peso meta deve ser um numero positivo.')

  if (dados.altura !== undefined && (isNaN(dados.altura) || dados.altura <= 0))
    erros.push('Altura deve ser um numero positivo.')

  return {
    valido: erros.length === 0,
    erros,
    dados: {
      peso_atual: dados.peso_atual || null,
      peso_meta: dados.peso_meta || null,
      altura: dados.altura || null,
      data_nascimento: dados.data_nascimento || null
    }
  }
}

function validarPost(dados) {
  const erros = []
  const conteudo = sanitizar(dados.conteudo)
  const tiposValidos = ['texto', 'dica', 'evolucao', 'receita']
  const tipo = sanitizar(dados.tipo || 'texto')

  if (!conteudo || conteudo.length < 1 || conteudo.length > 2000)
    erros.push('Conteudo deve ter entre 1 e 2000 caracteres.')

  if (!tiposValidos.includes(tipo))
    erros.push('Tipo de post invalido. Use: texto, dica, evolucao ou receita.')

  return {
    valido: erros.length === 0,
    erros,
    dados: { conteudo, tipo }
  }
}

function validarPlano(dados) {
  const erros = []
  const titulo = sanitizar(dados.titulo)
  const calorias_total = parseInt(dados.calorias_total)

  if (!titulo || titulo.length < 3 || titulo.length > 100)
    erros.push('Titulo deve ter entre 3 e 100 caracteres.')

  if (dados.calorias_total && (isNaN(calorias_total) || calorias_total <= 0))
    erros.push('Calorias totais deve ser um numero positivo.')

  return {
    valido: erros.length === 0,
    erros,
    dados: {
      titulo,
      descricao: sanitizar(dados.descricao || ''),
      calorias_total: calorias_total || null,
      data_inicio: dados.data_inicio || null,
      data_fim: dados.data_fim || null
    }
  }
}

function validarRefeicao(dados) {
  const erros = []
  const nome = sanitizar(dados.nome)

  if (!nome || nome.length < 3 || nome.length > 100)
    erros.push('Nome da refeicao deve ter entre 3 e 100 caracteres.')

  if (dados.calorias && (isNaN(parseInt(dados.calorias)) || parseInt(dados.calorias) <= 0))
    erros.push('Calorias deve ser um numero positivo.')

  return {
    valido: erros.length === 0,
    erros,
    dados: {
      nome,
      horario: sanitizar(dados.horario || ''),
      calorias: parseInt(dados.calorias) || null,
      alimentos: sanitizar(dados.alimentos || '')
    }
  }
}

function validarComentario(dados) {
  const erros = []
  const conteudo = sanitizar(dados.conteudo)

  if (!conteudo || conteudo.length < 1 || conteudo.length > 1000)
    erros.push('Comentario deve ter entre 1 e 1000 caracteres.')

  return {
    valido: erros.length === 0,
    erros,
    dados: { conteudo }
  }
}

function validarMensagem(dados) {
  const erros = []
  const conteudo = sanitizar(dados.conteudo)

  if (!conteudo || conteudo.length < 1 || conteudo.length > 2000)
    erros.push('Mensagem deve ter entre 1 e 2000 caracteres.')

  return {
    valido: erros.length === 0,
    erros,
    dados: { conteudo, destino_id: dados.destino_id || null }
  }
}

function validarGrupo(dados) {
  const erros = []
  const nome = sanitizar(dados.nome)
  const descricao = dados.descricao ? sanitizar(dados.descricao) : ''

  if (!nome || nome.length < 3 || nome.length > 100)
    erros.push('Nome do grupo deve ter entre 3 e 100 caracteres.')

  return {
    valido: erros.length === 0,
    erros,
    dados: { nome, descricao: descricao || null }
  }
}

module.exports = {
  sanitizar,
  validarCadastro,
  validarLogin,
  validarPerfil,
  validarPost,
  validarPlano,
  validarRefeicao,
  validarComentario,
  validarMensagem,
  validarGrupo
}
