function renderNavbar(paginaAtual = '') {
  if (!Auth.usuarioLogado()) return ''

  const usuario = Auth.obterUsuario()
  const avisoChat = (usuario?.avisos_chat || 0) > 0

  return `
    <nav class="navbar">
      <a href="#/home" class="navbar-item ${paginaAtual === 'home' ? 'ativo' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Inicio</span>
      </a>
      <a href="#/planos" class="navbar-item ${paginaAtual === 'planos' ? 'ativo' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span>Planos</span>
      </a>
      <a href="#/feed" class="navbar-item ${paginaAtual === 'feed' ? 'ativo' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Feed</span>
      </a>
      <a href="#/chat" class="navbar-item ${paginaAtual === 'chat' ? 'ativo' : ''}" style="position:relative;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 2 17.5V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v13.5a2.5 2.5 0 0 1-2.5 2.5H9.5L5.5 23v-4H4z"/>
        </svg>
        <span>Chat</span>
        ${avisoChat ? `<span class="navbar-badge" style="position:absolute;top:2px;right:18px;width:8px;height:8px;border-radius:50%;background:var(--info);border:2px solid rgba(255,255,255,0.85);"></span>` : ''}
      </a>
      <a href="#/medalhas" class="navbar-item ${paginaAtual === 'medalhas' ? 'ativo' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>Medalhas</span>
      </a>
      <a href="#/perfil" class="navbar-item ${paginaAtual === 'perfil' ? 'ativo' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Perfil</span>
      </a>
    </nav>
  `
}
