async function renderMedalhas() {
  const app = document.getElementById('app')

  app.innerHTML = `
    ${renderNavbar('medalhas')}
    <div class="pagina">
      <div class="page-header fade-in" style="margin-bottom:28px;">
        <h1 class="titulo">Medalhas e Pontos</h1>
        <p class="subtitulo">Suas conquistas na jornada de emagrecimento</p>
      </div>
      <div id="medalhas-conteudo">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `

  await carregarMedalhas()
}

async function carregarMedalhas() {
  const container = document.getElementById('medalhas-conteudo')

  try {
    const [pontuacaoRes, rankingRes] = await Promise.all([
      Api.obterPontuacao(),
      Api.obterRanking()
    ])

    const pontuacao = pontuacaoRes.dados
    const ranking = rankingRes.dados || []

    let html = `
      <div class="card fade-in delay-1" style="margin-bottom:24px;text-align:center;padding:28px 20px;">
        <div style="font-size:48px;font-weight:800;color:var(--verde);letter-spacing:-0.03em;margin-bottom:4px;">
          ${pontuacao.pontuacao_total}
        </div>
        <div style="font-size:14px;color:var(--cinza-500);">pontos acumulados</div>
      </div>
    `

    html += `
      <div class="section-header fade-in delay-2" style="margin-bottom:16px;">
        <h2 class="section-title">Minhas medalhas</h2>
        <span style="font-size:13px;color:var(--cinza-500);">${pontuacao.medalhas.filter(m => m.conquistada).length} de ${pontuacao.medalhas.length} conquistadas</span>
      </div>
    `

    html += `
      <div class="medalhas-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px;margin-bottom:28px;">
        ${pontuacao.medalhas.map(medalha => `
          <div class="card" style="text-align:center;padding:20px 12px;">
            <div style="font-size:${medalha.conquistada ? '32px' : '28px'};margin-bottom:8px;opacity:${medalha.conquistada ? '1' : '0.35'};">
              ${medalha.icone || '★'}
            </div>
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:${medalha.conquistada ? 'var(--cinza-900)' : 'var(--cinza-400)'};">
              ${escapeHtml(medalha.nome)}
            </div>
            <div style="font-size:11px;color:var(--cinza-500);margin-bottom:8px;">
              ${medalha.pontos_necessarios} pts
            </div>
            ${!medalha.conquistada ? `
              <div class="progresso-barra" style="margin-top:8px;">
                <div class="progresso-barra-preenchimento" style="width:${medalha.progresso}%;height:6px;"></div>
              </div>
            ` : ''}
            ${medalha.conquistada && medalha.data_conquista ? `
              <div style="font-size:10px;color:var(--verde);margin-top:6px;font-weight:600;">
                Conquistada em ${new Date(medalha.data_conquista).toLocaleDateString('pt-BR')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `

    html += `
      <div class="section-header fade-in delay-3" style="margin-bottom:16px;">
        <h2 class="section-title">Ranking da comunidade</h2>
        <span style="font-size:13px;color:var(--cinza-500);"></span>
      </div>

      <div class="card fade-in delay-3" style="padding:0;overflow:hidden;">
        ${ranking.length === 0 ? `
          <div class="lista-vazia" style="padding:32px;">
            <div class="empty-state-icon">🏆</div>
            <h3>Ninguem no ranking ainda</h3>
            <p>Comecie a ganhar pontos para aparecer aqui!</p>
          </div>
        ` : ranking.map((u, i) => `
          <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--cinza-100);">
            <div style="width:32px;height:32px;border-radius:50%;background:${i === 0 ? 'linear-gradient(135deg,#FFD700,#FFA500)' : i === 1 ? 'linear-gradient(135deg,#C0C0C0,#808080)' : i === 2 ? 'linear-gradient(135deg,#CD7F32,#8B4513)' : 'var(--verde-claro)'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:${i < 3 ? 'white' : 'var(--cinza-900)'};">
              ${i + 1}
            </div>
            <div class="avATAR avatar-pequeno">${u.nome_completo ? u.nome_completo.charAt(0).toUpperCase() : '?'}</div>
            <div style="flex:1;">
              <div style="font-weight:700;font-size:14px;">${escapeHtml(u.nome_completo)}</div>
              <div style="font-size:12px;color:var(--cinza-500);">${u.total_medalhas || 0} medalhas</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:800;font-size:16px;color:var(--laranja);">${u.pontuacao} pts</div>
            </div>
          </div>
        `).join('')}
      </div>
    `

    container.innerHTML = html
  } catch (erro) {
    container.innerHTML = `
      <div class="empty-state fade-in">
        <div class="empty-state-icon"> </div>
        <h3>Erro ao carregar medalhas</h3>
        <p>Tente novamente em alguns instantes.</p>
        <button class="btn btn-primario" onclick="renderMedalhas()">Tentar novamente</button>
      </div>
    `
  }
}
