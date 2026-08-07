async function renderPlanoAlimentar() {
  const app = document.getElementById('app')

  app.innerHTML = `
    ${renderNavbar('planos')}
    <div class="pagina">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <div>
          <h1 class="titulo">Planos Alimentares</h1>
          <p class="subtitulo">Organize suas refeicoes do dia</p>
        </div>
        <button class="btn btn-primario" onclick="abrirModalNovoPlano()" style="font-size:13px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
        <div class="card" style="text-align:center;padding:40px;">
          <div style="font-size:48px;margin-bottom:12px;"> </div>
          <h3 style="font-size:16px;margin-bottom:8px;">Nenhum plano ainda</h3>
          <p style="color:var(--cinza-500);font-size:14px;margin-bottom:16px;">Crie seu primeiro plano alimentar</p>
          <button class="btn btn-primario" onclick="abrirModalNovoPlano()">Criar plano</button>
        </div>
      `
      return
    }

    container.innerHTML = planos.map(plano => `
      <a href="#/planos/${plano.id}" class="card" style="display:block;margin-bottom:12px;text-decoration:none;color:inherit;">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <h3 style="font-size:16px;font-weight:600;">${escapeHtml(plano.titulo)}</h3>
            ${plano.descricao ? `<p style="font-size:13px;color:var(--cinza-500);margin-top:4px;">${escapeHtml(plano.descricao)}</p>` : ''}
          </div>
          <span class="badge ${plano.ativo ? 'badge-dica' : 'badge-texto'}">${plano.ativo ? 'Ativo' : 'Inativo'}</span>
        </div>
        <div style="display:flex;gap:16px;margin-top:12px;padding-top:12px;border-top:1px solid var(--cinza-200);">
          <div style="font-size:13px;color:var(--cinza-500);">
            <strong style="color:var(--laranja);">${plano.calorias_total || 0}</strong> kcal/dia
          </div>
          ${plano.data_inicio ? `<div style="font-size:13px;color:var(--cinza-500);">Inicio: ${plano.data_inicio}</div>` : ''}
        </div>
      </a>
    `).join('')
  } catch (erro) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:32px;">
        <p style="color:var(--erro);">Erro ao carregar planos.</p>
        <button class="btn btn-primario" onclick="carregarPlanos()" style="margin-top:12px;">Tentar novamente</button>
      </div>
    `
  }
}

function abrirModalNovoPlano() {
  showModal('Novo Plano Alimentar', `
    <form id="formNovoPlano" style="display:flex;flex-direction:column;gap:12px;">
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
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
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
