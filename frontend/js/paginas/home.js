async function renderHome() {
  const app = document.getElementById('app')
  const usuario = Auth.obterUsuario()

  app.innerHTML = `
    ${renderNavbar('home')}
    <div class="pagina">
      <div style="margin-bottom:24px;">
        <h1 class="titulo">Ola, ${usuario?.nome || 'Usuario'}!</h1>
        <p class="subtitulo">Como esta sua jornada hoje?</p>
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
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
        <div class="card" style="text-align:center;">
          <div style="font-size:28px;font-weight:800;color:var(--verde);">${pesoAtual || '--'}</div>
          <div style="font-size:12px;color:var(--cinza-500);">Peso atual (kg)</div>
        </div>
        <div class="card" style="text-align:center;">
          <div style="font-size:28px;font-weight:800;color:var(--laranja);">${pesoMeta || '--'}</div>
          <div style="font-size:12px;color:var(--cinza-500);">Meta (kg)</div>
        </div>
      </div>

      ${pesoMeta > 0 ? `
        <div class="card" style="margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:13px;font-weight:600;">Progresso da meta</span>
            <span style="font-size:13px;color:var(--verde);font-weight:600;">${percentualMeta}%</span>
          </div>
          <div class="progresso-barra">
            <div class="progresso-barra-preenchimento" style="width:${percentualMeta}%;"></div>
          </div>
        </div>
      ` : ''}

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h2 style="font-size:18px;font-weight:700;">Planos alimentares</h2>
        <a href="#/planos" style="font-size:13px;color:var(--verde);text-decoration:none;font-weight:600;">Ver todos</a>
      </div>
      ${planos.length > 0 ? planos.slice(0, 2).map(plano => `
        <a href="#/planos/${plano.id}" class="card" style="display:block;margin-bottom:12px;text-decoration:none;color:inherit;">
          <div style="font-weight:600;font-size:15px;">${escapeHtml(plano.titulo)}</div>
          <div style="font-size:13px;color:var(--cinza-500);margin-top:4px;">${plano.calorias_total || 0} kcal/dia</div>
        </a>
      `).join('') : `
        <div class="card" style="text-align:center;padding:24px;margin-bottom:12px;">
          <p style="color:var(--cinza-500);font-size:14px;margin-bottom:12px;">Nenhum plano criado ainda</p>
          <a href="#/planos" class="btn btn-primario" style="font-size:13px;">Criar primeiro plano</a>
        </div>
      `}

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;margin-bottom:16px;">
        <h2 style="font-size:18px;font-weight:700;">Ultimas publicacoes</h2>
        <a href="#/feed" style="font-size:13px;color:var(--verde);text-decoration:none;font-weight:600;">Ver feed</a>
      </div>
      ${posts.length > 0 ? posts.map(post => renderCardPost(post, false)).join('') : `
        <div class="card" style="text-align:center;padding:24px;">
          <p style="color:var(--cinza-500);font-size:14px;">Nenhuma publicacao ainda</p>
        </div>
      `}

      <a href="#/criar-post" class="btn btn-laranja btn-grande btn-cheio" style="margin-top:24px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Criar publicacao
      </a>
    `
  } catch (erro) {
    document.getElementById('home-conteudo').innerHTML = `
      <div class="card" style="text-align:center;padding:32px;">
        <p style="color:var(--erro);">Erro ao carregar dados.</p>
        <button class="btn btn-primario" onclick="renderHome()" style="margin-top:12px;">Tentar novamente</button>
      </div>
    `
  }
}
