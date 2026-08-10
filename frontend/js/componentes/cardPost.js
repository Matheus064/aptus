function renderCardPost(post, onComentar) {
  const primeiraLetra = post.autor_nome ? post.autor_nome.charAt(0).toUpperCase() : '?'
  const badgeClass = `badge-${post.tipo}`
  const tipoLabel = { texto: 'Texto', dica: 'Dica', evolucao: 'Evolucao', receita: 'Receita' }

  return `
    <div class="card post-card fade-in">
      <div class="post-header">
        <div class="avATAR">${primeiraLetra}</div>
        <div style="flex:1;">
          <div style="font-weight:700;font-size:14px;">${post.autor_nome || 'Usuario'}</div>
          <div class="post-meta">${formatarData(post.data_criacao)}</div>
        </div>
        <span class="badge ${badgeClass}">${tipoLabel[post.tipo] || post.tipo}</span>
      </div>
      <p class="post-content">${escapeHtml(post.conteudo)}</p>
      <div class="post-actions">
        <button class="post-action-btn" onclick="curtirPost(${post.id})" title="Curtir">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Curtir
        </button>
        <button class="post-action-btn" onclick="${onComentar ? `abrirComentarios(${post.id})` : ''}" title="Comentar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Comentar
        </button>
        <span style="font-size:12px;color:var(--cinza-500);margin-left:auto;">${post.total_comentarios || 0} comentarios</span>
      </div>
    </div>
  `
}

function curtirPost(id) {
  showToast('Funcao de curtir em desenvolvimento!', 'info')
}

function formatarData(data) {
  if (!data) return ''
  const d = new Date(data)
  const agora = new Date()
  const diff = agora - d
  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)

  if (minutos < 1) return 'Agora'
  if (minutos < 60) return `${minutos}min atras`
  if (horas < 24) return `${horas}h atras`
  if (dias < 7) return `${dias}d atras`
  return d.toLocaleDateString('pt-BR')
}

function escapeHtml(texto) {
  const div = document.createElement('div')
  div.textContent = texto
  return div.innerHTML
}
