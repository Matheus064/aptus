const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function requisicao(caminho, opcoes = {}) {
  const ehFormData = opcoes.body instanceof FormData;
  const resposta = await fetch(`${API_URL}${caminho}`, {
    headers: { ...(ehFormData ? {} : { 'Content-Type': 'application/json' }), ...(opcoes.token ? { Authorization: `Bearer ${opcoes.token}` } : {}) },
    ...opcoes,
    body: opcoes.body ? (ehFormData ? opcoes.body : JSON.stringify(opcoes.body)) : undefined,
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || dados.erro || 'Não foi possível concluir a operação.');
  return dados;
}
