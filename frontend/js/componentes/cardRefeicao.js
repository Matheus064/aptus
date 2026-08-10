function renderCardRefeicao(refeicao) {
  return `
    <div class="card" style="margin-bottom:12px;display:flex;align-items:center;gap:16px;padding:18px;">
      <div style="width:52px;height:52px;border-radius:14px;background:var(--verde-claro);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--verde)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          <line x1="6" y1="1" x2="6" y2="4"/>
          <line x1="10" y1="1" x2="10" y2="4"/>
          <line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:15px;">${escapeHtml(refeicao.nome)}</div>
        <div style="font-size:13px;color:var(--cinza-500);margin-top:2px;">${refeicao.horario || 'Horario nao definido'}</div>
        ${refeicao.alimentos ? `<div style="font-size:12px;color:var(--cinza-500);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">${escapeHtml(refeicao.alimentos)}</div>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-weight:800;font-size:18px;color:var(--laranja);line-height:1;">${refeicao.calorias || 0}</div>
        <div style="font-size:11px;color:var(--cinza-500);font-weight:500;">kcal</div>
      </div>
    </div>
  `
}
