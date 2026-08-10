function renderOnboarding() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="hero-section">
      <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;">
        <div style="margin-bottom:36px;animation:fadeInUp 0.6s ease;">
          <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 4px 12px rgba(0,0,0,0.15));">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h1 style="font-size:40px;font-weight:800;margin-bottom:16px;letter-spacing:-0.03em;line-height:1.1;animation:fadeInUp 0.6s ease 0.1s both;">
          Bem-vindo ao<br>
          <span style="background:linear-gradient(135deg,#FFF 0%,#D1FAE5 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Aptus</span>
        </h1>
        <p style="font-size:17px;opacity:0.9;max-width:340px;margin-bottom:56px;line-height:1.6;animation:fadeInUp 0.6s ease 0.2s both;">
          Conecte-se com quem compartilha seus objetivos e receba planos de alimentacao personalizados.
        </p>
        <div style="display:flex;gap:10px;margin-bottom:56px;animation:fadeInUp 0.6s ease 0.3s both;">
          <div style="width:10px;height:10px;border-radius:50%;background:white;box-shadow:0 0 12px rgba(255,255,255,0.5);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.3);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.3);"></div>
        </div>
        <a href="#/cadastro" class="btn btn-grande" style="background:white;color:var(--verde-escuro);font-weight:700;min-width:240px;box-shadow:0 8px 24px rgba(0,0,0,0.15);animation:fadeInUp 0.6s ease 0.4s both;">
          Comecar agora
        </a>
        <a href="#/login" style="color:white;margin-top:20px;font-size:15px;opacity:0.85;text-decoration:none;font-weight:500;animation:fadeInUp 0.6s ease 0.5s both;transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.85">
          Ja tem conta? <strong>Entrar</strong>
        </a>
      </div>
    </div>
  `
}
