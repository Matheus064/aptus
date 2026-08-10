async function renderPerfil() {
  const app = document.getElementById('app')

  app.innerHTML = `
    ${renderNavbar('perfil')}
    <div class="pagina">
      <div class="page-header fade-in" style="margin-bottom:28px;">
        <h1 class="titulo">Meu Perfil</h1>
        <p class="subtitulo">Seus dados e configuracoes</p>
      </div>
      <div id="perfil-conteudo">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `

  try {
    const resultado = await Api.obterPerfil()
    const perfil = resultado.dados
    const primeiraLetra = perfil.nome_completo ? perfil.nome_completo.charAt(0).toUpperCase() : '?'

    document.getElementById('perfil-conteudo').innerHTML = `
      <div class="card fade-in delay-1" style="text-align:center;margin-bottom:24px;padding:32px 20px;">
        <div class="avATAR perfil-avatar-grande">${primeiraLetra}</div>
        <h2 style="font-size:20px;font-weight:700;">${escapeHtml(perfil.nome_completo)}</h2>
        <p style="font-size:14px;color:var(--cinza-500);margin-top:4px;">${escapeHtml(perfil.email)}</p>
      </div>

      <div class="stats-grid fade-in delay-2" style="margin-bottom:24px;">
        <div class="card stat-card">
          <div class="stat-value" style="color:var(--verde);">${perfil.peso_atual || '--'}</div>
          <div class="stat-label">Peso atual (kg)</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value" style="color:var(--laranja);">${perfil.peso_meta || '--'}</div>
          <div class="stat-label">Meta (kg)</div>
        </div>
      </div>

      <div class="card fade-in delay-2" style="margin-bottom:24px;padding:24px;">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--verde)" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar perfil
        </h3>
        <form id="formEditarPerfil" style="display:flex;flex-direction:column;gap:16px;">
          <div class="campo">
            <label>Data de nascimento</label>
            <input type="date" id="ep-nascimento" value="${perfil.data_nascimento || ''}">
          </div>
          <div class="input-filet">
            <div class="campo">
              <label>Peso atual (kg)</label>
              <input type="number" id="ep-peso" value="${perfil.peso_atual || ''}" step="0.1" min="1">
            </div>
            <div class="campo">
              <label>Peso meta (kg)</label>
              <input type="number" id="ep-meta" value="${perfil.peso_meta || ''}" step="0.1" min="1">
            </div>
          </div>
          <div class="campo">
            <label>Altura (cm)</label>
            <input type="number" id="ep-altura" value="${perfil.altura || ''}" step="0.1" min="1">
          </div>
          <button type="submit" class="btn btn-primario btn-cheio" id="btn-ep" style="margin-top:4px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span id="texto-btn-ep">Salvar alteracoes</span>
            <span id="spinner-btn-ep" class="spinner" style="display:none;"></span>
          </button>
        </form>
      </div>

      <div class="card fade-in delay-3" style="margin-bottom:24px;padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:12px;color:var(--cinza-500);font-weight:500;">Membro desde</div>
            <div style="font-size:15px;font-weight:700;margin-top:2px;">${perfil.data_cadastro ? new Date(perfil.data_cadastro).toLocaleDateString('pt-BR') : '--'}</div>
          </div>
          <div style="width:1px;height:40px;background:var(--cinza-200);"></div>
          <div style="text-align:right;">
            <div style="font-size:12px;color:var(--cinza-500);font-weight:500;">Altura</div>
            <div style="font-size:15px;font-weight:700;margin-top:2px;">${perfil.altura ? perfil.altura + ' cm' : '--'}</div>
          </div>
        </div>
      </div>

      <button class="btn btn-perigo btn-cheio fade-in delay-3" onclick="Auth.fazerLogout()" style="padding:16px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sair da conta
      </button>
    `

    document.getElementById('formEditarPerfil').addEventListener('submit', async (e) => {
      e.preventDefault()
      const btn = document.getElementById('btn-ep')
      const texto = document.getElementById('texto-btn-ep')
      const spinner = document.getElementById('spinner-btn-ep')

      btn.disabled = true
      texto.style.display = 'none'
      spinner.style.display = 'block'

      try {
        await Api.atualizarPerfil({
          data_nascimento: document.getElementById('ep-nascimento').value || null,
          peso_atual: parseFloat(document.getElementById('ep-peso').value) || null,
          peso_meta: parseFloat(document.getElementById('ep-meta').value) || null,
          altura: parseFloat(document.getElementById('ep-altura').value) || null
        })
        showToast('Perfil atualizado!')
      } catch (erro) {
        showToast(erro.mensagem || 'Erro ao atualizar perfil', 'erro')
      } finally {
        btn.disabled = false
        texto.style.display = 'inline'
        spinner.style.display = 'none'
      }
    })
  } catch (erro) {
    document.getElementById('perfil-conteudo').innerHTML = `
      <div class="empty-state fade-in">
        <div class="empty-state-icon"> </div>
        <h3>Erro ao carregar perfil</h3>
        <p>Tente novamente em alguns instantes.</p>
        <button class="btn btn-primario" onclick="renderPerfil()">Tentar novamente</button>
      </div>
    `
  }
}
