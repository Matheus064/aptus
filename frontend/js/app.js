const Rotas = {
  '#/onboarding': { render: renderOnboarding, auth: false },
  '#/login': { render: renderLogin, auth: false },
  '#/cadastro': { render: renderCadastro, auth: false },
  '#/perfil-basico': { render: renderPerfilBasico, auth: true },
  '#/home': { render: renderHome, auth: true },
  '#/planos': { render: renderPlanoAlimentar, auth: true },
  '#/planos/': { render: renderDetalhePlano, auth: true },
  '#/feed': { render: renderFeed, auth: true },
  '#/criar-post': { render: renderCriarPost, auth: true },
  '#/perfil': { render: renderPerfil, auth: true }
}

function roteador() {
  const hash = window.location.hash || '#/'
  const rota = Rotas[hash]

  if (!rota) {
    if (hash.startsWith('#/planos/')) {
      const id = hash.split('/')[2]
      if (Auth.verificarAuth()) renderDetalhePlano({ id })
      return
    }
    window.location.hash = Auth.usuarioLogado() ? '#/home' : '#/onboarding'
    return
  }

  if (rota.auth && !Auth.usuarioLogado()) {
    window.location.hash = '#/login'
    return
  }

  if (!rota.auth && Auth.usuarioLogado() && (hash === '#/onboarding' || hash === '#/login' || hash === '#/cadastro')) {
    window.location.hash = '#/home'
    return
  }

  rota.render()
}

window.addEventListener('hashchange', roteador)
window.addEventListener('load', () => {
  if (!window.location.hash) {
    window.location.hash = Auth.usuarioLogado() ? '#/home' : '#/onboarding'
  } else {
    roteador()
  }
})
