const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || (import.meta.env.DEV ? '/api' : '');

export async function requisicao(caminho, opcoes = {}) {
  if (!API_URL) throw new Error('A API pública ainda não foi configurada. Defina VITE_API_URL nas variáveis do GitHub Actions.');
  const ehFormData = opcoes.body instanceof FormData;
  const resposta = await fetch(`${API_URL}${caminho}`, {
    headers: { ...(ehFormData ? {} : { 'Content-Type': 'application/json' }), ...(opcoes.token ? { Authorization: `Bearer ${opcoes.token}` } : {}) },
    ...opcoes,
    body: opcoes.body ? (ehFormData ? opcoes.body : JSON.stringify(opcoes.body)) : undefined,
  });
  const texto = await resposta.text();
  let dados = null;
  if (texto) {
    try { dados = JSON.parse(texto); }
    catch { dados = { mensagem: texto }; }
  }
  if (!resposta.ok) throw new Error(dados?.mensagem || dados?.erro || 'Não foi possível concluir a operação.');
  return dados;
}
