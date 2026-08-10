async function renderDetalhePlano(params) {
  const app = document.getElementById('app')
  const planoId = params.id

  app.innerHTML = `
    ${renderNavbar('planos')}
    <div class="pagina">
      <div style="margin-bottom:20px;" class="fade-in">
        <a href="#/planos" style="font-size:13px;color:var(--verde);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar
        </a>
      </div>
      <div id="detalhe-plano-conteudo">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `

  try {
    const resultado = await Api.obterPlano(planoId)
    const plano = resultado.dados
    const refeicoes = plano.refeicoes || []

    document.getElementById('detalhe-plano-conteudo').innerHTML = `
      <div class="page-header-row fade-in delay-1" style="margin-bottom:24px;">
        <div style="flex:1;">
          <h1 class="titulo">${escapeHtml(plano.titulo)}</h1>
          ${plano.descricao ? `<p class="subtitulo">${escapeHtml(plano.descricao)}</p>` : ''}
        </div>
        <button class="btn btn-perigo" style="font-size:12px;padding:8px 14px;border-radius:12px;" onclick="deletarPlano(${plano.id})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Excluir
        </button>
      </div>

      <div class="stats-grid fade-in delay-2" style="grid-template-columns:repeat(3, 1fr);margin-bottom:28px;">
        <div class="card stat-card">
          <div class="stat-value" style="color:var(--laranja);font-size:26px;">${plano.calorias_total || '--'}</div>
          <div class="stat-label">kcal/dia</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value" style="color:var(--verde);font-size:26px;">${refeicoes.length}</div>
          <div class="stat-label">Refeicoes</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value" style="color:var(--info);font-size:26px;">${plano.ativo ? 'Sim' : 'Nao'}</div>
          <div class="stat-label">Ativo</div>
        </div>
      </div>

      <div class="section-header fade-in delay-2">
        <h2 class="section-title">Refeicoes</h2>
        <button class="btn btn-primario" onclick="abrirModalNovaRefeicao(${plano.id})" style="font-size:13px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar
        </button>
      </div>

      <div id="lista-refeicoes">
        ${refeicoes.length > 0 ? refeicoes.map((ref, i) => renderCardRefeicao(ref)).join('') : `
          <div class="empty-state fade-in delay-3">
            <div class="empty-state-icon"> </div>
            <h3>Nenhuma refeicao cadastrada</h3>
            <p>Adicione suas refeicoes para organizar seu plano!</p>
          </div>
        `}
      </div>
    `
  } catch (erro) {
    document.getElementById('detalhe-plano-conteudo').innerHTML = `
      <div class="empty-state fade-in">
        <div class="empty-state-icon"> </div>
        <h3>Erro ao carregar plano</h3>
        <p>Tente novamente em alguns instantes.</p>
        <button class="btn btn-primario" onclick="renderDetalhePlano({id:${planoId}})">Tentar novamente</button>
      </div>
    `
  }
}

async function deletarPlano(id) {
  showModal('Excluir plano', 'Tem certeza que deseja excluir este plano e todas as suas refeicoes?', async () => {
    try {
      await Api.deletarPlano(id)
      showToast('Plano excluido!')
      window.location.hash = '#/planos'
    } catch (erro) {
      showToast(erro.mensagem || 'Erro ao excluir plano', 'erro')
    }
  }, 'Excluir')
}

function abrirModalNovaRefeicao(planoId) {
  showModal('Nova Refeicao', `
    <form id="formNovaRefeicao" style="display:flex;flex-direction:column;gap:16px;">
      <div class="campo">
        <label>Nome</label>
        <input type="text" id="nr-nome" placeholder="Ex: Cafe da manha" required minlength="3">
      </div>
      <div class="input-filet">
        <div class="campo">
          <label>Horario</label>
          <input type="time" id="nr-horario">
        </div>
        <div class="campo">
          <label>Calorias</label>
          <input type="number" id="nr-calorias" placeholder="350" min="1">
        </div>
      </div>
      <div class="campo">
        <label>Alimentos</label>
        <textarea id="nr-alimentos" placeholder="Ex: Aveia, banana, mel..." rows="3"></textarea>
      </div>
    </form>
  `, async () => {
    const nome = document.getElementById('nr-nome').value.trim()
    if (!nome) { showToast('Informe o nome da refeicao', 'erro'); return }

    try {
      await Api.adicionarRefeicao(planoId, {
        nome,
        horario: document.getElementById('nr-horario').value || null,
        calorias: parseInt(document.getElementById('nr-calorias').value) || null,
        alimentos: document.getElementById('nr-alimentos').value.trim() || null
      })
      showToast('Refeicao adicionada!')
      await renderDetalhePlano({ id: planoId })
    } catch (erro) {
      showToast(erro.mensagem || 'Erro ao adicionar refeicao', 'erro')
    }
  }, 'Adicionar')
}
