async function renderPlanoAlimentar() {
  const app = document.getElementById('app')

  app.innerHTML = `
    ${renderNavbar('planos')}
    <div class="pagina">
      <div class="page-header-row fade-in" style="margin-bottom:28px;">
        <div>
          <h1 class="titulo">Planos Alimentares</h1>
          <p class="subtitulo">Organize suas refeicoes do dia</p>
        </div>
        <button class="btn btn-primario" onclick="abrirModalNovoPlano()" style="font-size:13px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo
        </button>
      </div>
      <div id="lista-planos">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `

  await carregarPlanos()
}

async function carregarPlanos() {
  const container = document.getElementById('lista-planos')

  try {
    const resultado = await Api.listarPlanos()
    const planos = resultado.dados || []

    if (planos.length === 0) {
      container.innerHTML = `
        <div class="empty-state fade-in">
          <div class="empty-state-icon"> </div>
          <h3>Nenhum plano ainda</h3>
          <p>Crie seu primeiro plano alimentar e organize sua dieta!</p>
          <button class="btn btn-primario" onclick="abrirModalNovoPlano()">Criar plano</button>
        </div>
      `
      return
    }

    container.innerHTML = planos.map((plano, i) => `
      <a href="#/planos/${plano.id}" class="card plano-card fade-in" style="animation-delay:${i * 0.05}s;">
        <div class="plano-header">
          <div style="flex:1;">
            <div class="plano-title">${escapeHtml(plano.titulo)}</div>
            ${plano.descricao ? `<div class="plano-desc">${escapeHtml(plano.descricao)}</div>` : ''}
          </div>
          <span class="badge ${plano.ativo ? 'badge-dica' : 'badge-texto'}">${plano.ativo ? 'Ativo' : 'Inativo'}</span>
        </div>
        <div class="plano-footer">
          <div class="plano-stat"><strong>${plano.calorias_total || 0}</strong> kcal/dia</div>
          ${plano.data_inicio ? `<div class="plano-stat">Inicio: ${plano.data_inicio}</div>` : ''}
        </div>
      </a>
    `).join('')
  } catch (erro) {
    container.innerHTML = `
      <div class="empty-state fade-in">
        <div class="empty-state-icon"> </div>
        <h3>Erro ao carregar planos</h3>
        <p>Tente novamente em alguns instantes.</p>
        <button class="btn btn-primario" onclick="carregarPlanos()">Tentar novamente</button>
      </div>
    `
  }
}

function abrirModalNovoPlano() {
  showModal('Novo Plano Alimentar', `
    <form id="formNovoPlano" style="display:flex;flex-direction:column;gap:16px;">
      <div class="campo">
        <label>Titulo</label>
        <input type="text" id="np-titulo" placeholder="Ex: Plano de emagrecimento" required minlength="3">
      </div>
      <div class="campo">
        <label>Descricao (opcional)</label>
        <input type="text" id="np-descricao" placeholder="Descreva seu plano">
      </div>
      <div class="campo">
        <label>Calorias totais por dia</label>
        <input type="number" id="np-calorias" placeholder="1800" min="1">
      </div>
      <div class="input-filet">
        <div class="campo">
          <label>Data inicio</label>
          <input type="date" id="np-inicio">
        </div>
        <div class="campo">
          <label>Data fim</label>
          <input type="date" id="np-fim">
        </div>
      </div>
    </form>
  `, async () => {
    const titulo = document.getElementById('np-titulo').value.trim()
    if (!titulo) { showToast('Informe um titulo', 'erro'); return }

    try {
      await Api.criarPlano({
        titulo,
        descricao: document.getElementById('np-descricao').value.trim(),
        calorias_total: parseInt(document.getElementById('np-calorias').value) || null,
        data_inicio: document.getElementById('np-inicio').value || null,
        data_fim: document.getElementById('np-fim').value || null
      })
      showToast('Plano criado com sucesso!')
      await carregarPlanos()
    } catch (erro) {
      showToast(erro.mensagem || 'Erro ao criar plano', 'erro')
    }
  }, 'Criar plano')
}
