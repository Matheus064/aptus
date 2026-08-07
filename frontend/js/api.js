const API_URL = '/api'

const Api = {
  async requisicao(method, endpoint, body = null) {
    const config = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }

    const token = Auth.obterToken()
    if (token) config.headers['Authorization'] = `Bearer ${token}`

    if (body) config.body = JSON.stringify(body)

    const resposta = await fetch(`${API_URL}${endpoint}`, config)
    const dados = await resposta.json()

    if (!resposta.ok) throw { status: resposta.status, ...dados }

    return dados
  },

  async cadastrar(dados) {
    return this.requisicao('POST', '/usuarios/cadastro', dados)
  },

  async login(dados) {
    return this.requisicao('POST', '/usuarios/login', dados)
  },

  async obterPerfil() {
    return this.requisicao('GET', '/usuarios/perfil')
  },

  async atualizarPerfil(dados) {
    return this.requisicao('PUT', '/usuarios/perfil', dados)
  },

  async criarPost(dados) {
    return this.requisicao('POST', '/posts', dados)
  },

  async listarPosts(pagina = 1) {
    return this.requisicao('GET', `/posts?pagina=${pagina}`)
  },

  async obterPost(id) {
    return this.requisicao('GET', `/posts/${id}`)
  },

  async deletarPost(id) {
    return this.requisicao('DELETE', `/posts/${id}`)
  },

  async criarComentario(postId, dados) {
    return this.requisicao('POST', `/posts/${postId}/comentarios`, dados)
  },

  async listarComentarios(postId) {
    return this.requisicao('GET', `/posts/${postId}/comentarios`)
  },

  async criarPlano(dados) {
    return this.requisicao('POST', '/planos', dados)
  },

  async listarPlanos() {
    return this.requisicao('GET', '/planos')
  },

  async obterPlano(id) {
    return this.requisicao('GET', `/planos/${id}`)
  },

  async atualizarPlano(id, dados) {
    return this.requisicao('PUT', `/planos/${id}`, dados)
  },

  async deletarPlano(id) {
    return this.requisicao('DELETE', `/planos/${id}`)
  },

  async adicionarRefeicao(planoId, dados) {
    return this.requisicao('POST', `/planos/${planoId}/refeicoes`, dados)
  }
}
