function renderCadastro() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="auth-page">
      <div class="card card-grande auth-card">
        <div style="text-align:center;margin-bottom:36px;">
          <div class="auth-logo">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h1 class="auth-title">Criar conta</h1>
          <p class="auth-subtitle">Comece sua jornada de bem-estar</p>
        </div>
        <form id="formCadastro" style="display:flex;flex-direction:column;gap:16px;">
          <div class="campo">
            <label>Nome completo</label>
            <input type="text" id="cad-nome" placeholder="Seu nome" required minlength="3" maxlength="150">
          </div>
          <div class="campo">
            <label>E-mail</label>
            <input type="email" id="cad-email" placeholder="seu@email.com" required>
          </div>
          <div class="campo">
            <label>Senha</label>
            <input type="password" id="cad-senha" placeholder="Minimo 6 caracteres" required minlength="6">
          </div>
          <div class="campo">
            <label>Confirmar senha</label>
            <input type="password" id="cad-confirmar" placeholder="Repita a senha" required minlength="6">
          </div>
          <button type="submit" class="btn btn-primario btn-grande btn-cheio" id="btn-cadastro" style="margin-top:4px;">
            <span id="texto-btn-cadastro">Criar conta</span>
            <span id="spinner-btn-cadastro" class="spinner" style="display:none;"></span>
          </button>
        </form>
        <p style="text-align:center;margin-top:28px;font-size:14px;color:var(--cinza-500);">
          Ja tem conta? <a href="#/login" style="color:var(--verde);font-weight:600;text-decoration:none;">Faca login</a>
        </p>
      </div>
    </div>
  `

  document.getElementById('formCadastro').addEventListener('submit', async (e) => {
    e.preventDefault()
    const senha = document.getElementById('cad-senha').value
    const confirmar = document.getElementById('cad-confirmar').value

    if (senha !== confirmar) {
      showToast('As senhas nao coincidem!', 'erro')
      return
    }

    const btn = document.getElementById('btn-cadastro')
    const texto = document.getElementById('texto-btn-cadastro')
    const spinner = document.getElementById('spinner-btn-cadastro')

    btn.disabled = true
    texto.style.display = 'none'
    spinner.style.display = 'block'

    try {
      const resultado = await Api.cadastrar({
        nome_completo: document.getElementById('cad-nome').value.trim(),
        email: document.getElementById('cad-email').value.trim(),
        senha
      })

      Auth.salvarToken(resultado.dados.token)
      Auth.salvarUsuario(resultado.dados)
      showToast('Conta criada com sucesso!')
      window.location.hash = '#/perfil-basico'
    } catch (erro) {
      showToast(erro.erros ? erro.erros.join(' ') : erro.mensagem || 'Erro ao criar conta', 'erro')
    } finally {
      btn.disabled = false
      texto.style.display = 'inline'
      spinner.style.display = 'none'
    }
  })
}
