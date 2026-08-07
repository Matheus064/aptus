async function renderPerfil() {
  const app = document.getElementById('app')

  app.innerHTML = `
    ${renderNavbar('perfil')}
    <div class="pagina">
      <div style="margin-bottom:24px;">
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
      <div class="card" style="text-align:center;margin-bottom:20px;">
        <div class="avATAR" style="width:72px;height:72px;font-size:28px;margin:0 auto 12px;">${primeiraLetra}</div>
        <h2 style="font-size:18px;font-weight:700;">${escapeHtml(perfil.nome_completo)}</h2>
        <p style="font-size:13px;color:var(--cinza-500);">${escapeHtml(perfil.email)}</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
        <div class="card" style="text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--verde);">${perfil.peso_atual || '--'}</div>
          <div style="font-size:12px;color:var(--cinza-500);">Peso atual (kg)</div>
        </div>
        <div class="card" style="text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--laranja);">${perfil.peso_meta || '--'}</div>
          <div style="font-size:12px;color:var(--cinza-500);">Meta (kg)</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px;">Editar perfil</h3>
        <form id="formEditarPerfil" style="display:flex;flex-direction:column;gap:12px;">
          <div class="campo">
            <label>Data de nascimento</label>
            <input type="date" id="ep-nascimento" value="${perfil.data_nascimento || ''}">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
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
          <button type="submit" class="btn btn-primario btn-cheio" id="btn-ep">
            <span id="texto-btn-ep">Salvar alteracoes</span>
            <span id="spinner-btn-ep" class="spinner" style="display:none;"></span>
          </button>
        </form>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:13px;color:var(--cinza-500);">Membro desde</div>
            <div style="font-size:14px;font-weight:600;">${perfil.data_cadastro ? new Date(perfil.data_cadastro).toLocaleDateString('pt-BR') : '--'}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13px;color:var(--cinza-500);">Altura</div>
            <div style="font-size:14px;font-weight:600;">${perfil.altura ? perfil.altura + ' cm' : '--'}</div>
          </div>
        </div>
      </div>

      <button class="btn btn-perigo btn-cheio" onclick="Auth.fazerLogout()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
      <div class="card" style="text-align:center;padding:32px;">
        <p style="color:var(--erro);">Erro ao carregar perfil.</p>
        <button class="btn btn-primario" onclick="renderPerfil()" style="margin-top:12px;">Tentar novamente</button>
      </div>
    `
  }
}
