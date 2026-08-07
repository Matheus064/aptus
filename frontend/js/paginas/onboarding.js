function renderOnboarding() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;background:linear-gradient(135deg,var(--verde) 0%,var(--verde-escuro) 100%);color:white;text-align:center;">
      <div style="margin-bottom:32px;">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <h1 style="font-size:32px;font-weight:800;margin-bottom:12px;">Bem-vindo ao Aptus</h1>
      <p style="font-size:16px;opacity:0.9;max-width:320px;margin-bottom:48px;line-height:1.5;">
        Conecte-se com quem compartilha seus objetivos e receba planos de alimentacao personalizados.
      </p>
      <div style="display:flex;gap:8px;margin-bottom:48px;">
        <div style="width:8px;height:8px;border-radius:50%;background:white;"></div>
        <div style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.4);"></div>
        <div style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.4);"></div>
      </div>
      <a href="#/cadastro" class="btn btn-grande" style="background:white;color:var(--verde);font-weight:700;min-width:200px;">
        Comecar agora
      </a>
      <a href="#/login" style="color:white;margin-top:16px;font-size:14px;opacity:0.8;text-decoration:none;">
        Ja tem conta? Entrar
      </a>
    </div>
  `
}
