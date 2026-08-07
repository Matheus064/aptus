function renderCardRefeicao(refeicao) {
  return `
    <div class="card" style="margin-bottom:12px;display:flex;align-items:center;gap:16px;">
      <div style="width:48px;height:48px;border-radius:12px;background:var(--verde-claro);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--verde)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;font-size:14px;">${escapeHtml(refeicao.nome)}</div>
        <div style="font-size:12px;color:var(--cinza-500);">${refeicao.horario || 'Horario nao definido'}</div>
        ${refeicao.alimentos ? `<div style="font-size:12px;color:var(--cinza-500);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(refeicao.alimentos)}</div>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-weight:700;font-size:14px;color:var(--laranja);">${refeicao.calorias || 0}</div>
        <div style="font-size:11px;color:var(--cinza-500);">kcal</div>
      </div>
    </div>
  `
}
