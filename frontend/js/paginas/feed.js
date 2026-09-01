async function renderFeed() {
  const app = document.getElementById('app')

  app.innerHTML = `
    ${renderNavbar('feed')}
    <div class="pagina">
      <div class="page-header-row fade-in" style="margin-bottom:24px;">
        <div>
          <h1 class="titulo">Comunidade</h1>
          <p class="subtitulo">Veja o que a galera esta compartilhando</p>
        </div>
        <a href="#/criar-post" class="btn btn-primario" style="font-size:13px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo post
        </a>
      </div>
      <div id="feed-conteudo">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `

  await carregarFeed(1)
}

async function carregarFeed(pagina) {
  const container = document.getElementById('feed-conteudo')

  try {
    const resultado = await Api.listarPosts(pagina)
    const posts = resultado.dados || []

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="empty-state fade-in">
          <div class="empty-state-icon"> ️</div>
          <h3>Nenhuma publicacao ainda</h3>
          <p>Seja o primeiro a compartilhar algo com a comunidade!</p>
          <a href="#/criar-post" class="btn btn-primario">Criar publicacao</a>
        </div>
      `
      return
    }

    container.innerHTML = posts.map(post => renderCardPost(post, true)).join('')

    if (resultado.total > pagina * 20) {
      container.innerHTML += `
        <button class="btn btn-secundario btn-cheio" onclick="carregarFeed(${pagina + 1})" style="margin-top:8px;">
          Carregar mais
        </button>
      `
    }
  } catch (erro) {
    container.innerHTML = `
      <div class="empty-state fade-in">
        <div class="empty-state-icon"> </div>
        <h3>Erro ao carregar feed</h3>
        <p>Tente novamente em alguns instantes.</p>
        <button class="btn btn-primario" onclick="carregarFeed(1)">Tentar novamente</button>
      </div>
    `
  }
}

function abrirComentarios(postId) {
  showToast('Sistema de comentarios em desenvolvimento!', 'info')
}
