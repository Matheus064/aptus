let chatEstado = {
  conversas: [],
  conversaAtiva: null,
  mensagens: [],
  grupos: [],
  grupoAtivo: null,
  mensagensGrupo: [],
  usuariosBusca: [],
  modo: 'conversas',
  carregando: true
}

let chatIntervalo = null

function formatarHora(data) {
  if (!data) return ''
  const d = new Date(data)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function renderChat() {
  const app = document.getElementById('app')

  app.innerHTML = `
    ${renderNavbar('chat')}
    <div class="pagina">
      <div class="page-header fade-in" style="margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 class="titulo">Conversas</h1>
            <p class="subtitulo">Conecte-se com a comunidade</p>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secundario" onclick="mostrarBuscaUsuarios()" style="font-size:13px;padding:10px 16px;border-radius:12px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
              Nova conversa
            </button>
            <button class="btn btn-primario" onclick="mostrarCriarGrupo()" style="font-size:13px;padding:10px 16px;border-radius:12px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Grupo
            </button>
          </div>
        </div>
      </div>
      <div id="chat-conteudo">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `
}

async function carregarChat() {
  try {
    const resultado = await Api.listarConversas()
    chatEstado.conversas = resultado.dados || []
    await carregarGruposChat()
    renderizarListaConversas()
  } catch (erro) {
    document.getElementById('chat-conteudo').innerHTML = `
      <div class="lista-vazia fade-in">
        <div class="empty-state-icon"> </div>
        <h3>Erro ao carregar conversas</h3>
        <p>Tente novamente em alguns instantes.</p>
        <button class="btn btn-primario" onclick="carregarChat()">Tentar novamente</button>
      </div>
    `
  }
}

async function carregarGruposChat() {
  try {
    const resultado = await Api.listarGrupos()
    chatEstado.grupos = resultado.dados || []
  } catch (erro) {
    chatEstado.grupos = []
  }
}

function renderizarListaConversas() {
  const container = document.getElementById('chat-conteudo')

  let html = `
    <div class="chat-abas" style="display:flex;gap:4px;margin-bottom:16px;">
      <button class="btn ${chatEstado.modo === 'conversas' ? 'btn-primario' : 'btn-secundario'}" onclick="mostrarModoConversas()" style="flex:1;font-size:13px;border-radius:12px;">
        Diretas
      </button>
      <button class="btn ${chatEstado.modo === 'grupos' ? 'btn-primario' : 'btn-secundario'}" onclick="mostrarModoGrupos()" style="flex:1;font-size:13px;border-radius:12px;">
        Grupos
      </button>
    </div>
  `

  if (chatEstado.modo === 'grupos') {
    if (chatEstado.grupos.length === 0) {
      html += `
        <div class="empty-state fade-in">
          <div class="empty-state-icon">👥</div>
          <h3>Nenhum grupo ainda</h3>
          <p>Crie ou entre em um grupo para começar a conversar!</p>
          <div style="display:flex;gap:8px;justify-content:center;">
            <button class="btn btn-primario" onclick="mostrarCriarGrupo()">Criar grupo</button>
            <button class="btn btn-secundario" onclick="mostrarGruposDisponiveis()">Ver grupos</button>
          </div>
        </div>
      `
    } else {
      html += chatEstado.grupos.map((grupo, i) => `
        <div class="card chat-conversa-item fade-in" style="animation-delay:${i * 0.05}s;cursor:pointer;" onclick="abrirGrupo(${grupo.id})">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--verde),var(--info));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:white;flex-shrink:0;">
              👥
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:14px;">${escapeHtml(grupo.nome)}</div>
              <div style="font-size:12px;color:var(--cinza-500);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">
                ${grupo.ultima_mensagem ? escapeHtml(grupo.ultima_mensagem) : 'Grupo criado'}
              </div>
            </div>
            <div style="font-size:11px;color:var(--cinza-500);white-space:nowrap;margin-left:8px;">
              ${grupo.ultima_data ? formatarData(grupo.ultima_data, true) : ''}
            </div>
          </div>
        </div>
      `).join('')
    }
  } else {
    if (chatEstado.conversas.length === 0) {
      html += `
        <div class="empty-state fade-in">
          <div class="empty-state-icon">💬</div>
          <h3>Nenhuma conversa ainda</h3>
          <p>Clique em "Nova conversa" para começar a conversar com alguém!</p>
        </div>
      `
    } else {
      html += chatEstado.conversas.filter(c => c.tipo === 'direta').map((conv, i) => `
        <div class="card chat-conversa-item fade-in" style="animation-delay:${i * 0.05}s;cursor:pointer;" onclick="abrirConversa(${conv.id})">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="avATAR" style="width:44px;height:44px;font-size:18px;">
              ${conv.nome ? conv.nome.charAt(0).toUpperCase() : '?'}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:14px;">${escapeHtml(conv.nome || 'Usuario')}</div>
              <div style="font-size:12px;color:var(--cinza-500);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">
                ${conv.ultima_mensagem ? escapeHtml(conv.ultima_mensagem) : 'Nova conversa'}
              </div>
            </div>
            ${conv.nao_lidas > 0 ? `<span class="navbar-badge" style="position:static;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--info);color:white;font-size:11px;font-weight:700;">${conv.nao_lidas}</span>` : ''}
            <div style="font-size:11px;color:var(--cinza-500);white-space:nowrap;margin-left:8px;">
              ${conv.ultima_data ? formatarData(conv.ultima_data, true) : ''}
            </div>
          </div>
        </div>
      `).join('')

      const conversasDireta = chatEstado.conversas.filter(c => c.tipo === 'direta')
      const gruposLista = chatEstado.conversas.filter(c => c.tipo === 'grupo')

      if (gruposLista.length > 0) {
        html += '<hr style="margin:16px 0;border-color:var(--cinza-200);">'
        html += '<div style="font-size:12px;font-weight:600;color:var(--cinza-500);margin-bottom:8px;">Grupos</div>'
        html += gruposLista.map((grupo, i) => `
          <div class="card chat-conversa-item fade-in" style="animation-delay:${i * 0.05}s;cursor:pointer;" onclick="abrirGrupo(${grupo.id})">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--verde),var(--info));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:white;flex-shrink:0;">
                👥
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:14px;">${escapeHtml(grupo.nome || 'Grupo')}</div>
                <div style="font-size:12px;color:var(--cinza-500);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">
                  ${grupo.ultima_mensagem ? escapeHtml(grupo.ultima_mensagem) : 'Grupo criado'}
                </div>
              </div>
              <div style="font-size:11px;color:var(--cinza-500);white-space:nowrap;margin-left:8px;">
                ${grupo.ultima_data ? formatarData(grupo.ultima_data, true) : ''}
              </div>
            </div>
          </div>
        `).join('')
      }
    }
  }

  container.innerHTML = html
}

function renderizarChatDireto() {
  const container = document.getElementById('chat-conteudo')

  container.innerHTML = `
    <div class="chat-header fade-in" style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <a href="#/chat" style="font-size:13px;color:var(--verde);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar
      </a>
      <div class="avATAR" style="width:40px;height:40px;font-size:16px;">
        ${chatEstado.conversaAtiva?.nome ? chatEstado.conversaAtiva.nome.charAt(0).toUpperCase() : '?'}
      </div>
      <div>
        <div style="font-weight:700;font-size:15px;">${escapeHtml(chatEstado.conversaAtiva?.nome || 'Usuario')}</div>
        <div style="font-size:12px;color:var(--cinza-500);">Online</div>
      </div>
    </div>
    <div class="chat-mensagens" id="chat-mensagens" style="height:400px;overflow-y:auto;margin-bottom:16px;padding:16px;background:var(--cinza-50);border-radius:var(--raio);">
      ${chatEstado.mensagens.length === 0 ? '<div class="lista-vazia" style="padding:24px;">Nenhuma mensagem ainda. Comece a conversar!</div>' : chatEstado.mensagens.map(renderMensagem).join('')}
    </div>
    <form id="formMensagem" style="display:flex;gap:12px;">
      <input type="text" id="msg-conteudo" placeholder="Digite uma mensagem..." maxlength="2000" required style="flex:1;">
      <button type="submit" class="btn btn-primario" style="padding:12px 20px;border-radius:12px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  `

  const usuario = Auth.obterUsuario()

  document.getElementById('formMensagem').addEventListener('submit', async (e) => {
    e.preventDefault()
    const input = document.getElementById('msg-conteudo')
    const conteudo = input.value.trim()
    if (!conteudo) return

    try {
      await Api.enviarMensagem(chatEstado.conversaAtiva.id, { conteudo })
      input.value = ''
      await carregarMensagens()
    } catch (erro) {
      showToast(erro.mensagem || 'Erro ao enviar mensagem', 'erro')
    }
  })

  setTimeout(() => {
    const el = document.getElementById('chat-mensagens')
    if (el) el.scrollTop = el.scrollHeight
  }, 100)
}

function renderizarGrupo() {
  const container = document.getElementById('chat-conteudo')

  container.innerHTML = `
    <div class="chat-header fade-in" style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <a href="#/chat" style="font-size:13px;color:var(--verde);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar
      </a>
      <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--verde),var(--info));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:white;flex-shrink:0;">
        👥
      </div>
      <div style="flex:1;">
        <div style="font-weight:700;font-size:15px;">${escapeHtml(chatEstado.grupoAtivo?.nome || 'Grupo')}</div>
        <div style="font-size:12px;color:var(--cinza-500);">${chatEstado.grupoAtivo?.total_membros || 0} membros</div>
      </div>
      <button class="btn btn-secundario btn-icon" onclick="mostrarMembrosGrupo()" title="Membros">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12.5" cy="10" r="3"/><path d="M4 20.4V13a4 4 0 0 1 9-2.5 3.5 3.5 0 0 1 7 0 4 4 0 0 1 0 7.5v7.4"/></svg>
      </button>
    </div>
    <div class="chat-mensagens" id="chat-mensagens-grupo" style="height:360px;overflow-y:auto;margin-bottom:16px;padding:16px;background:var(--cinza-50);border-radius:var(--raio);">
      ${chatEstado.mensagensGrupo.length === 0 ? '<div class="lista-vazia" style="padding:24px;">Nenhuma mensagem ainda. Seja o primeiro a escrever!</div>' : chatEstado.mensagensGrupo.map(renderMensagemGrupo).join('')}
    </div>
    <form id="formMensagemGrupo" style="display:flex;gap:12px;">
      <input type="text" id="msg-grupo-conteudo" placeholder="Mensagem para o grupo..." maxlength="2000" required style="flex:1;">
      <button type="submit" class="btn btn-primario" style="padding:12px 20px;border-radius:12px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  `

  document.getElementById('formMensagemGrupo').addEventListener('submit', async (e) => {
    e.preventDefault()
    const input = document.getElementById('msg-grupo-conteudo')
    const conteudo = input.value.trim()
    if (!conteudo) return

    try {
      await Api.enviarMensagemGrupo(chatEstado.grupoAtivo.id, { conteudo })
      input.value = ''
      await carregarMensagensGrupo()
    } catch (erro) {
      showToast(erro.mensagem || 'Erro ao enviar mensagem', 'erro')
    }
  })

  setTimeout(() => {
    const el = document.getElementById('chat-mensagens-grupo')
    if (el) el.scrollTop = el.scrollHeight
  }, 100)
}

function renderMensagem(msg) {
  const usuario = Auth.obterUsuario()
  const ehMinha = msg.remetente_id === usuario?.id
  const avatar = msg.remetente_nome ? msg.remetente_nome.charAt(0).toUpperCase() : '?'

  return `
    <div style="display:flex;gap:8px;justify-content:${ehMinha ? 'flex-end' : 'flex-start'};margin-bottom:12px;">
      ${!ehMinha ? `<div class="avATAR avatar-pequeno" style="width:30px;height:30px;font-size:12px;">${avatar}</div>` : ''}
      <div style="max-width:70%;">
        <div style="background:${ehMinha ? 'var(--verde-bg)' : 'var(--branco)'};padding:10px 14px;border-radius:${ehMinha ? '16px 4px 16px 16px' : '4px 16px 16px 16px'};font-size:14px;line-height:1.5;">
          ${escapeHtml(msg.conteudo)}
        </div>
        <div style="font-size:10px;color:var(--cinza-500);margin-top:2px;text-align:${ehMinha ? 'right' : 'left'};">
          ${formatarHora(msg.data_envio)}
        </div>
      </div>
    </div>
  `
}

function renderMensagemGrupo(msg) {
  const usuario = Auth.obterUsuario()
  const ehMinha = msg.remetente_id === usuario?.id
  const avatar = msg.remetente_nome ? msg.remetente_nome.charAt(0).toUpperCase() : '?'

  return `
    <div style="display:flex;gap:8px;justify-content:${ehMinha ? 'flex-end' : 'flex-start'};margin-bottom:12px;">
      ${!ehMinha ? `<div class="avATAR avatar-pequeno" style="width:30px;height:30px;font-size:12px;">${avatar}</div>` : ''}
      <div style="max-width:70%;">
        <div style="background:${ehMinha ? 'var(--verde-bg)' : 'var(--branco)'};padding:10px 14px;border-radius:${ehMinha ? '16px 4px 16px 16px' : '4px 16px 16px 16px'};font-size:14px;line-height:1.5;">
          <div style="font-weight:600;font-size:11px;margin-bottom:2px;color:var(--cinza-700);text-transform:uppercase;letter-spacing:0.03em;">
            ${escapeHtml(msg.remetente_nome || 'Usuario')}
          </div>
          ${escapeHtml(msg.conteudo)}
        </div>
        <div style="font-size:10px;color:var(--cinza-500);margin-top:2px;text-align:${ehMinha ? 'right' : 'left'};">
          ${formatarHora(msg.data_envio)}
        </div>
      </div>
    </div>
  `
}

function mostrarModoConversas() {
  chatEstado.modo = 'conversas'
  renderizarListaConversas()
}

function mostrarModoGrupos() {
  chatEstado.modo = 'grupos'
  renderizarListaConversas()
}

async function abrirConversa(conversaId) {
  const conv = chatEstado.conversas.find(c => c.id === conversaId)
  if (!conv) return

  chatEstado.conversaAtiva = { id: conv.id, nome: conv.nome, tipo: 'direta' }
  chatEstado.mensagens = []

  renderizarChatDireto()
  await carregarMensagens()
}

async function abrirGrupo(grupoId) {
  const grupo = chatEstado.grupos.find(g => g.id === grupoId)
  if (!grupo) return

  chatEstado.grupoAtivo = {
    id: grupo.id,
    nome: grupo.nome,
    total_membros: grupo.total_membros
  }
  chatEstado.mensagensGrupo = []

  renderizarGrupo()
  await carregarMensagensGrupo()
}

async function carregarMensagens() {
  try {
    chatEstado.conversaAtiva.id
    const conv = await Api.obterConversa(chatEstado.conversaAtiva.id)

    if (conv.dados && conv.dados.mensagens) {
      const usuario = Auth.obterUsuario()
      chatEstado.mensagens = conv.dados.mensagens.map(m => ({
        ...m,
        remetente_id: m.remetente_id || (m.remetente_nome === (usuario?.nome || '') ? usuario.id : null)
      }))

      const mensagensComRemetente = chatEstado.mensagens.map(m => {
        if (!m.remetente_id) {
          return { ...m, remetente_id: null }
        }
        return m
      })

      const usuarioLogado = Auth.obterUsuario()
      const mensagensComId = conv.dados.mensagens.map(m => {
        const ehMinha = m.remetente_nome === usuarioLogado?.nome || m.remetente_id === usuarioLogado?.id
        return {
          ...m,
          remetente_id: ehMinha ? usuarioLogado.id : null
        }
      })
      chatEstado.mensagens = mensagensComId

      renderizarChatDireto()
      const el = document.getElementById('chat-mensagens')
      if (el) el.scrollTop = el.scrollHeight
    }
  } catch (erro) {
    showToast(erro.mensagem || 'Erro ao carregar mensagens', 'erro')
  }
}

async function carregarMensagensGrupo() {
  try {
    const grupo = await Api.obterGrupo(chatEstado.grupoAtivo.id)

    if (grupo.dados && grupo.dados.mensagens) {
      const usuarioLogado = Auth.obterUsuario()
      chatEstado.mensagensGrupo = grupo.dados.mensagens.map(m => {
        const ehMinha = m.remetente_nome === usuarioLogado?.nome
        return {
          ...m,
          remetente_id: ehMinha ? usuarioLogado.id : null
        }
      })

      chatEstado.grupoAtivo.total_membros = grupo.dados.membros?.length || 0

      renderizarGrupo()
      const el = document.getElementById('chat-mensagens-grupo')
      if (el) el.scrollTop = el.scrollHeight
    }
  } catch (erro) {
    showToast(erro.mensagem || 'Erro ao carregar mensagens do grupo', 'erro')
  }
}

function mostrarBuscaUsuarios() {
  const container = document.getElementById('chat-conteudo')
  let htmlBusca = `
    <div class="chat-header fade-in" style="margin-bottom:16px;">
      <a href="#/chat" style="font-size:13px;color:var(--verde);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar
      </a>
      <h2 class="titulo" style="margin-top:16px;">Nova conversa</h2>
      <p class="subtitulo">Pesquise um usuario para conversar</p>
    </div>
    <div class="campo fade-in">
      <input type="text" id="busca-usuario" placeholder="Digite o nome do usuario..." oninput="buscarUsuariosChat()" style="width:100%;">
    </div>
    <div id="lista-busca-usuarios" class="fade-in" style="margin-top:16px;">
      <div class="loading"><div class="spinner"></div></div>
    </div>
  `
  container.innerHTML = htmlBusca
}

async function buscarUsuariosChat() {
  const termo = document.getElementById('busca-usuario').value.trim()
  const container = document.getElementById('lista-busca-usuarios')

  if (!termo || termo.length < 2) {
    container.innerHTML = '<div class="lista-vazia" style="padding:24px;">Digite ao menos 2 caracteres para buscar.</div>'
    return
  }

  try {
    const resultado = await Api.buscarUsuarios(termo)
    const usuarios = resultado.dados || []

    if (usuarios.length === 0) {
      container.innerHTML = '<div class="lista-vazia" style="padding:24px;">Nenhum usuario encontrado.</div>'
      return
    }

    container.innerHTML = usuarios.map(u => `
      <div class="card chat-conversa-item fade-in" style="cursor:pointer;" onclick="iniciarConversa(${u.id}, '${escapeHtml(u.nome_completo).replace(/'/g, "\\'")}'))">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="avATAR" style="width:44px;height:44px;font-size:18px;">
            ${u.nome_completo ? u.nome_completo.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div style="font-weight:700;font-size:14px;">${escapeHtml(u.nome_completo)}</div>
            <div style="font-size:12px;color:var(--cinza-500);">${escapeHtml(u.email)}</div>
          </div>
        </div>
      </div>
    `).join('')
  } catch (erro) {
    container.innerHTML = '<div class="lista-vazia" style="padding:24px;">Erro ao buscar usuarios.</div>'
  }
}

async function iniciarConversa(destinatarioId, nome) {
  chatEstado.conversaAtiva = { id: destinatarioId, nome, tipo: 'direta' }
  chatEstado.mensagens = []

  renderizarChatDireto()
  await carregarMensagens()
}

function mostrarCriarGrupo() {
  const container = document.getElementById('chat-conteudo')

  container.innerHTML = `
    <div class="chat-header fade-in" style="margin-bottom:16px;">
      <a href="#/chat" style="font-size:13px;color:var(--verde);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar
      </a>
      <h2 class="titulo" style="margin-top:16px;">Criar novo grupo</h2>
      <p class="subtitulo">Crie um grupo para conversar com varias pessoas</p>
    </div>
    <form id="formCriarGrupo" style="display:flex;flex-direction:column;gap:18px;">
      <div class="campo">
        <label>Nome do grupo</label>
        <input type="text" id="grupo-nome" placeholder="Ex: Emagrecimento com a galera" required minlength="3">
      </div>
      <div class="campo">
        <label>Descricao (opcional)</label>
        <textarea id="grupo-descricao" rows="3" placeholder="Conte um pouco sobre o grupo..."></textarea>
      </div>
      <button type="submit" class="btn btn-primario btn-grande btn-cheio" id="btn-criar-grupo">
        <span id="texto-btn-grupo">Criar grupo</span>
        <span id="spinner-btn-grupo" class="spinner" style="display:none;"></span>
      </button>
    </form>
  `

  document.getElementById('formCriarGrupo').addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = document.getElementById('btn-criar-grupo')
    const texto = document.getElementById('texto-btn-grupo')
    const spinner = document.getElementById('spinner-btn-grupo')

    btn.disabled = true
    texto.style.display = 'none'
    spinner.style.display = 'block'

    try {
      const resultado = await Api.criarGrupo({
        nome: document.getElementById('grupo-nome').value.trim(),
        descricao: document.getElementById('grupo-descricao').value.trim() || null
      })

      showToast('Grupo criado com sucesso!')
      chatEstado.grupoAtivo = { id: resultado.dados.id, nome: resultado.dados.nome, total_membros: 1 }
      chatEstado.mensagensGrupo = []
      renderizarGrupo()
    } catch (erro) {
      showToast(erro.mensagem || 'Erro ao criar grupo', 'erro')
    } finally {
      btn.disabled = false
      texto.style.display = 'inline'
      spinner.style.display = 'none'
    }
  })
}

async function mostrarGruposDisponiveis() {
  const container = document.getElementById('chat-conteudo')

  container.innerHTML = `
    <div class="chat-header fade-in" style="margin-bottom:16px;">
      <a href="#/chat" style="font-size:13px;color:var(--verde);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar
      </a>
      <h2 class="titulo" style="margin-top:16px;">Grupos disponiveis</h2>
      <p class="subtitulo">Junte-se a grupos da comunidade</p>
    </div>
    <div id="lista-grupos-disponiveis" class="fade-in">
      <div class="loading"><div class="spinner"></div></div>
    </div>
  `

  try {
    const resultado = await Api.listarGruposDisponiveis()
    const grupos = resultado.dados || []

    if (grupos.length === 0) {
      document.getElementById('lista-grupos-disponiveis').innerHTML = `
        <div class="empty-state fade-in">
          <div class="empty-state-icon">👥</div>
          <h3>Nenhum grupo disponivel</h3>
          <p>Crie um novo grupo para começar!</p>
          <button class="btn btn-primario" onclick="mostrarCriarGrupo()">Criar grupo</button>
        </div>
      `
      return
    }

    document.getElementById('lista-grupos-disponiveis').innerHTML = grupos.map((grupo, i) => `
      <div class="card fade-in" style="margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--verde),var(--info));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:white;flex-shrink:0;">
            👥
          </div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:14px;">${escapeHtml(grupo.nome)}</div>
            <div style="font-size:12px;color:var(--cinza-500);margin-top:2px;">${grupo.total_membros || 0} membros</div>
            ${grupo.descricao ? `<div style="font-size:12px;color:var(--cinza-500);margin-top:2px;">${escapeHtml(grupo.descricao)}</div>` : ''}
          </div>
          <button class="btn btn-primario" style="font-size:12px;padding:8px 14px;border-radius:10px;" onclick="entrarGrupo(${grupo.id})">
            Entrar
          </button>
        </div>
      </div>
    `).join('')
  } catch (erro) {
    document.getElementById('lista-grupos-disponiveis').innerHTML = `
      <div class="empty-state fade-in">
        <div class="empty-state-icon"> </div>
        <h3>Erro ao carregar grupos</h3>
        <p>Tente novamente mais tarde.</p>
      </div>
    `
  }
}

async function entrarGrupo(grupoId) {
  try {
    await Api.entrarGrupo(grupoId)
    showToast('Entrou no grupo com sucesso!')
    await carregarGruposChat()
  } catch (erro) {
    showToast(erro.mensagem || 'Erro ao entrar no grupo', 'erro')
  }
}

function mostrarMembrosGrupo() {
  showModal('Membros do grupo', `
    <div id="lista-membros-grupo" style="max-height:300px;overflow-y:auto;">
      <div class="loading"><div class="spinner"></div></div>
    </div>
  `, null, 'Fechar')
}