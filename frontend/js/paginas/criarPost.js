function renderCriarPost() {
  const app = document.getElementById('app')

  app.innerHTML = `
    ${renderNavbar('feed')}
    <div class="pagina">
      <div style="margin-bottom:20px;" class="fade-in">
        <a href="#/feed" style="font-size:13px;color:var(--verde);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar
        </a>
      </div>
      <h1 class="titulo fade-in delay-1" style="margin-bottom:24px;">Nova publicacao</h1>

      <div class="tipos-grid fade-in delay-2" style="margin-bottom:20px;">
        <button class="btn btn-secundario tipo-btn ativo" data-tipo="texto" onclick="selecionarTipo('texto')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Texto
        </button>
        <button class="btn btn-secundario tipo-btn" data-tipo="dica" onclick="selecionarTipo('dica')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          Dica
        </button>
        <button class="btn btn-secundario tipo-btn" data-tipo="evolucao" onclick="selecionarTipo('evolucao')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          Evolucao
        </button>
        <button class="btn btn-secundario tipo-btn" data-tipo="receita" onclick="selecionarTipo('receita')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
          Receita
        </button>
      </div>

      <form id="formCriarPost" style="display:flex;flex-direction:column;gap:16px;">
        <div class="campo fade-in delay-2">
          <label style="font-size:15px;">O que voce quer compartilhar?</label>
          <textarea id="cp-conteudo" placeholder="Escreva aqui sua dica, receita ou evolucao..." rows="6" maxlength="2000" required style="font-size:15px;"></textarea>
        </div>
        <div class="textarea-counter fade-in delay-3">
          <span id="cp-contador" class="counter-text">0/2000</span>
          <button type="submit" class="btn btn-primario" id="btn-cp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span id="texto-btn-cp">Publicar</span>
            <span id="spinner-btn-cp" class="spinner" style="display:none;"></span>
          </button>
        </div>
      </form>
    </div>
  `

  const textarea = document.getElementById('cp-conteudo')
  const contador = document.getElementById('cp-contador')

  textarea.addEventListener('input', () => {
    contador.textContent = `${textarea.value.length}/2000`
  })

  document.getElementById('formCriarPost').addEventListener('submit', async (e) => {
    e.preventDefault()
    const conteudo = textarea.value.trim()
    if (!conteudo) { showToast('Escreva algo para publicar', 'erro'); return }

    const btn = document.getElementById('btn-cp')
    const texto = document.getElementById('texto-btn-cp')
    const spinner = document.getElementById('spinner-btn-cp')

    btn.disabled = true
    texto.style.display = 'none'
    spinner.style.display = 'block'

    try {
      await Api.criarPost({
        conteudo,
        tipo: tipoPostSelecionado || 'texto'
      })
      showToast('Publicacao criada!')
      window.location.hash = '#/feed'
    } catch (erro) {
      showToast(erro.mensagem || 'Erro ao publicar', 'erro')
    } finally {
      btn.disabled = false
      texto.style.display = 'inline'
      spinner.style.display = 'none'
    }
  })
}

let tipoPostSelecionado = 'texto'

function selecionarTipo(tipo) {
  tipoPostSelecionado = tipo
  document.querySelectorAll('.tipo-btn').forEach(btn => {
    btn.classList.toggle('ativo', btn.dataset.tipo === tipo)
    if (btn.dataset.tipo === tipo) {
      btn.style.background = 'var(--verde)'
      btn.style.color = 'white'
    } else {
      btn.style.background = ''
      btn.style.color = ''
    }
  })
}
