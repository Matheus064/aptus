function renderCriarPost() {
  const app = document.getElementById('app')

  app.innerHTML = `
    ${renderNavbar('feed')}
    <div class="pagina">
      <div style="margin-bottom:16px;">
        <a href="#/feed" style="font-size:13px;color:var(--verde);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar
        </a>
      </div>
      <h1 class="titulo" style="margin-bottom:24px;">Nova publicacao</h1>

      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
        <button class="btn btn-secundario tipo-post-btn ativo" data-tipo="texto" onclick="selecionarTipo('texto')">Texto</button>
        <button class="btn btn-secundario tipo-post-btn" data-tipo="dica" onclick="selecionarTipo('dica')">Dica</button>
        <button class="btn btn-secundario tipo-post-btn" data-tipo="evolucao" onclick="selecionarTipo('evolucao')">Evolucao</button>
        <button class="btn btn-secundario tipo-post-btn" data-tipo="receita" onclick="selecionarTipo('receita')">Receita</button>
      </div>

      <form id="formCriarPost" style="display:flex;flex-direction:column;gap:16px;">
        <div class="campo">
          <label>O que voce quer compartilhar?</label>
          <textarea id="cp-conteudo" placeholder="Escreva aqui..." rows="6" maxlength="2000" required></textarea>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span id="cp-contador" style="font-size:12px;color:var(--cinza-500);">0/2000</span>
          <button type="submit" class="btn btn-primario" id="btn-cp">
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
  document.querySelectorAll('.tipo-post-btn').forEach(btn => {
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
