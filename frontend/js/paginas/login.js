function renderLogin() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="auth-page">
      <div class="card card-grande auth-card">
        <div style="text-align:center;margin-bottom:36px;">
          <div class="auth-logo">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 class="auth-title">Entrar no Aptus</h1>
          <p class="auth-subtitle">Acesse sua conta para continuar</p>
        </div>
        <form id="formLogin" style="display:flex;flex-direction:column;gap:18px;">
          <div class="campo">
            <label>E-mail</label>
            <input type="email" id="login-email" placeholder="seu@email.com" required>
          </div>
          <div class="campo">
            <label>Senha</label>
            <input type="password" id="login-senha" placeholder="Sua senha" required minlength="6">
          </div>
          <button type="submit" class="btn btn-primario btn-grande btn-cheio" id="btn-login" style="margin-top:4px;">
            <span id="texto-btn-login">Entrar</span>
            <span id="spinner-btn-login" class="spinner" style="display:none;"></span>
          </button>
        </form>
        <p style="text-align:center;margin-top:28px;font-size:14px;color:var(--cinza-500);">
          Nao tem conta? <a href="#/cadastro" style="color:var(--verde);font-weight:600;text-decoration:none;">Cadastre-se</a>
        </p>
      </div>
    </div>
  `

  document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = document.getElementById('btn-login')
    const texto = document.getElementById('texto-btn-login')
    const spinner = document.getElementById('spinner-btn-login')

    btn.disabled = true
    texto.style.display = 'none'
    spinner.style.display = 'block'

    try {
      const resultado = await Api.login({
        email: document.getElementById('login-email').value.trim(),
        senha: document.getElementById('login-senha').value
      })

      Auth.salvarToken(resultado.dados.token)
      Auth.salvarUsuario(resultado.dados)
      showToast('Login realizado com sucesso!')
      window.location.hash = '#/home'
    } catch (erro) {
      showToast(erro.mensagem || 'Erro ao fazer login', 'erro')
    } finally {
      btn.disabled = false
      texto.style.display = 'inline'
      spinner.style.display = 'none'
    }
  })
}
