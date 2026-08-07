async function renderDetalhePlano(params) {
  const app = document.getElementById('app')
  const planoId = params.id

  app.innerHTML = `
    ${renderNavbar('planos')}
    <div class="pagina">
      <div style="margin-bottom:16px;">
        <a href="#/planos" style="font-size:13px;color:var(--verde);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
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
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px;">
        <div>
          <h1 class="titulo">${escapeHtml(plano.titulo)}</h1>
          ${plano.descricao ? `<p class="subtitulo">${escapeHtml(plano.descricao)}</p>` : ''}
        </div>
        <button class="btn btn-perigo" style="font-size:12px;padding:8px 12px;" onclick="deletarPlano(${plano.id})">Excluir</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px;">
        <div class="card" style="text-align:center;">
          <div style="font-size:22px;font-weight:700;color:var(--laranja);">${plano.calorias_total || '--'}</div>
          <div style="font-size:11px;color:var(--cinza-500);">kcal/dia</div>
        </div>
        <div class="card" style="text-align:center;">
          <div style="font-size:22px;font-weight:700;color:var(--verde);">${refeicoes.length}</div>
          <div style="font-size:11px;color:var(--cinza-500);">Refeicoes</div>
        </div>
        <div class="card" style="text-align:center;">
          <div style="font-size:22px;font-weight:700;color:var(--info);">${plano.ativo ? 'Sim' : 'Nao'}</div>
          <div style="font-size:11px;color:var(--cinza-500);">Ativo</div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h2 style="font-size:18px;font-weight:700;">Refeicoes</h2>
        <button class="btn btn-primario" onclick="abrirModalNovaRefeicao(${plano.id})" style="font-size:13px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar
        </button>
      </div>

      <div id="lista-refeicoes">
        ${refeicoes.length > 0 ? refeicoes.map(ref => renderCardRefeicao(ref)).join('') : `
          <div class="card" style="text-align:center;padding:32px;">
            <div style="font-size:48px;margin-bottom:12px;"> </div>
            <p style="color:var(--cinza-500);font-size:14px;">Nenhuma refeicao cadastrada</p>
          </div>
        `}
      </div>
    `
  } catch (erro) {
    document.getElementById('detalhe-plano-conteudo').innerHTML = `
      <div class="card" style="text-align:center;padding:32px;">
        <p style="color:var(--erro);">Erro ao carregar plano.</p>
        <button class="btn btn-primario" onclick="renderDetalhePlano({id:${planoId}})" style="margin-top:12px;">Tentar novamente</button>
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
    <form id="formNovaRefeicao" style="display:flex;flex-direction:column;gap:12px;">
      <div class="campo">
        <label>Nome</label>
        <input type="text" id="nr-nome" placeholder="Ex: Cafe da manha" required minlength="3">
      </div>
      <div class="campo">
        <label>Horario</label>
        <input type="time" id="nr-horario">
      </div>
      <div class="campo">
        <label>Calorias</label>
        <input type="number" id="nr-calorias" placeholder="350" min="1">
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
