async function renderHome() {
  const app = document.getElementById('app')
  const usuario = Auth.obterUsuario()

  app.innerHTML = `
    ${renderNavbar('home')}
    <div class="pagina">
      <div class="page-header fade-in">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:4px;">
          <div class="avATAR" style="width:48px;height:48px;font-size:18px;">
            ${usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <h1 class="titulo">Ola, ${usuario?.nome?.split(' ')[0] || 'Usuario'}!</h1>
            <p class="subtitulo">Como esta sua jornada hoje?</p>
          </div>
        </div>
      </div>
      <div id="home-conteudo">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `

  try {
    const [perfilRes, planosRes, postsRes] = await Promise.all([
      Api.obterPerfil(),
      Api.listarPlanos(),
      Api.listarPosts(1)
    ])

    const perfil = perfilRes.dados
    const planos = planosRes.dados || []
    const posts = (postsRes.dados || []).slice(0, 3)

    const pesoAtual = perfil.peso_atual || 0
    const pesoMeta = perfil.peso_meta || 0
    const percentualMeta = pesoMeta > 0 ? Math.min(100, Math.round((pesoAtual / pesoMeta) * 100)) : 0

    document.getElementById('home-conteudo').innerHTML = `
      <div class="stats-grid fade-in delay-1">
        <div class="card stat-card">
          <div class="stat-value" style="color:var(--verde);">${pesoAtual || '--'}</div>
          <div class="stat-label">Peso atual (kg)</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value" style="color:var(--laranja);">${pesoMeta || '--'}</div>
          <div class="stat-label">Meta (kg)</div>
        </div>
      </div>

      ${pesoMeta > 0 ? `
        <div class="card fade-in delay-2" style="margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <span style="font-size:14px;font-weight:600;">Progresso da meta</span>
            <span style="font-size:14px;color:var(--verde);font-weight:700;">${percentualMeta}%</span>
          </div>
          <div class="progresso-barra">
            <div class="progresso-barra-preenchimento" style="width:${percentualMeta}%;"></div>
          </div>
        </div>
      ` : ''}••••••••••

      <div class="section-header fade-in delay-2">
        <h2 class="section-title">Planos alimentares</h2>
        <a href="#/planos" class="section-link">Ver todos</a>
      </div>
      ${planos.length > 0 ? planos.slice(0, 2).map(plano => `
        <a href="#/planos/${plano.id}" class="card plano-card fade-in delay-2">
          <div c••••••••••lass="plano-header">
            <div>
              <div class="plano-title">${escapeHtml(plano.titulo)}</div>
              ${plano.descricao ? `<div class="plano-desc">${escapeHtml(plano.descricao)}</div>` : ''}
            </div>
            <span class="badge ${plano.ativo ? 'badge-dica' : 'badge-texto'}">${plano.ativo ? 'Ativo' : 'Inativo'}</span>
          </div>
          <div class="plano-footer">
            <div class="plano-stat"><strong>${plano.calorias_total || 0}</strong> kcal/dia</div>
          </div>
        </a>
      `).join('') : `
        <div class="empty-state fade-in delay-2">
          <div class="empty-state-icon"> </div>
          <h3>Nenhum plano criado ainda</h3>
          <p>Crie seu primeiro plano alimentar e comece sua jornada!</p>
          <a href="#/planos" class="btn btn-primario">Criar primeiro plano</a>
        </div>
      `}

      <div class="section-header fade-in delay-3" style="margin-top:28px;">
        <h2 class="section-title">Ultimas publicacoes</h2>
        <a href="#/feed" class="section-link">Ver feed</a>
      </div>
      ${posts.length > 0 ? posts.map(post => renderCardPost(post, false)).join('') : `
        <div class="empty-state fade-in delay-3">
          <div class="empty-state-icon"> ️</div>
          <h3>Nenhuma publicacao ainda</h3>
          <p>Seja o primeiro a compartilhar algo com a comunidade!</p>
        </div>
      `}

      <a href="#/criar-post" class="btn btn-laranja btn-grande btn-cheio fade-in delay-3" style="margin-top:28px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Criar publicacao
      </a>
    `
  } catch (erro) {
    document.getElementById('home-conteudo').innerHTML = `
      <div class="empty-state fade-in delay-3">
        <div class="empty-state-icon"> </div>
        <h3>Erro ao carregar dados</h3>
        <p>Tente novamente em alguns instantes.</p>
        <button class="btn btn-primario" onclick="renderHome()">Tentar novamente</button>
      </div>
    `
  }