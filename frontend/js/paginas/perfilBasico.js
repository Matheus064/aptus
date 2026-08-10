function renderPerfilBasico() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="auth-page" style="background:var(--cinza-50);">
      <div class="card card-grande auth-card" style="padding:40px 32px;">
        <div style="text-align:center;margin-bottom:36px;">
          <div style="width:72px;height:72px;border-radius:20px;background:var(--gradiente-laranja);display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;box-shadow:0 8px 24px rgba(245, 158, 11, 0.3);">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 class="auth-title">Vamos personalizar</h1>
          <p class="auth-subtitle">Conte nos sobre voce para melhorarmos sua experiencia</p>
        </div>
        <form id="formPerfilBasico" style="display:flex;flex-direction:column;gap:18px;">
          <div class="campo">
            <label>Data de nascimento</label>
            <input type="date" id="pb-nascimento">
          </div>
          <div class="input-filet">
            <div class="campo">
              <label>Peso atual (kg)</label>
              <input type="number" id="pb-peso" placeholder="80" step="0.1" min="1">
            </div>
            <div class="campo">
              <label>Peso meta (kg)</label>
              <input type="number" id="pb-meta" placeholder="70" step="0.1" min="1">
            </div>
          </div>
          <div class="campo">
            <label>Altura (cm)</label>
            <input type="number" id="pb-altura" placeholder="170" step="0.1" min="1">
          </div>
          <button type="submit" class="btn btn-primario btn-grande btn-cheio" id="btn-pb" style="margin-top:4px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span id="texto-btn-pb">Salvar e continuar</span>
            <span id="spinner-btn-pb" class="spinner" style="display:none;"></span>
          </button>
          <button type="button" class="btn btn-secundario btn-cheio" onclick="window.location.hash='#/home'" style="margin-top:4px;">
            Pular por agora
          </button>
        </form>
      </div>
    </div>
  `

  document.getElementById('formPerfilBasico').addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = document.getElementById('btn-pb')
    const texto = document.getElementById('texto-btn-pb')
    const spinner = document.getElementById('spinner-btn-pb')

    btn.disabled = true
    texto.style.display = 'none'
    spinner.style.display = 'block'

    try {
      await Api.atualizarPerfil({
        data_nascimento: document.getElementById('pb-nascimento').value || null,
        peso_atual: parseFloat(document.getElementById('pb-peso').value) || null,
        peso_meta: parseFloat(document.getElementById('pb-meta').value) || null,
        altura: parseFloat(document.getElementById('pb-altura').value) || null
      })

      showToast('Perfil atualizado!')
      window.location.hash = '#/home'
    } catch (erro) {
      showToast(erro.mensagem || 'Erro ao salvar perfil', 'erro')
    } finally {
      btn.disabled = false
      texto.style.display = 'inline'
      spinner.style.display = 'none'
    }
  })
}
