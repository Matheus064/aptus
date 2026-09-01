function showModal(titulo, conteudo, onConfirmar, textoConfirmar = 'Confirmar') {
  const container = document.getElementById('modal-container')
  container.innerHTML = `
    <div class="modal-overlay" onclick="fecharModal(event)">
      <div class="modal-conteudo" onclick="event.stopPropagation()">
        <h3 style="margin-bottom:16px;font-size:18px;font-weight:700;">${titulo}</h3>
        <div style="margin-bottom:24px;color:var(--cinza-700);font-size:14px;">${conteudo}</div>
        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button class="btn btn-secundario" onclick="fecharModal()">Cancelar</button>
          <button class="btn btn-primario" id="btn-confirmar-modal">${textoConfirmar}</button>
        </div>
      </div>
    </div>
  `
  document.getElementById('btn-confirmar-modal').onclick = () => {
    if (onConfirmar) onConfirmar()
    fecharModal()
  }
}

function fecharModal(event) {
  if (event && event.target !== event.currentTarget) return
  document.getElementById('modal-container').innerHTML = ''
}
