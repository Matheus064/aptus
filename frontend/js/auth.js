const Auth = {
  salvarToken(token) {
    localStorage.setItem('aptus_token', token)
  },

  obterToken() {
    return localStorage.getItem('aptus_token')
  },

  removerToken() {
    localStorage.removeItem('aptus_token')
    localStorage.removeItem('aptus_usuario')
  },

  salvarUsuario(usuario) {
    localStorage.setItem('aptus_usuario', JSON.stringify(usuario))
  },

  obterUsuario() {
    const dados = localStorage.getItem('aptus_usuario')
    return dados ? JSON.parse(dados) : null
  },

  usuarioLogado() {
    return !!this.obterToken()
  },

  fazerLogout() {
    this.removerToken()
    window.location.hash = '#/login'
  },

  verificarAuth() {
    const rotasPublicas = ['#/onboarding', '#/login', '#/cadastro', '#/', '']
    const hash = window.location.hash || '#/'

    if (!this.usuarioLogado() && !rotasPublicas.includes(hash)) {
      window.location.hash = '#/login'
      return false
    }

    if (this.usuarioLogado() && rotasPublicas.includes(hash)) {
      window.location.hash = '#/home'
      return false
    }

    return true
  }
}
