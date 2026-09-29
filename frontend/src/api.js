import { exerciciosDemo, receitasDemo } from './demoData';

const apiConfigurada = import.meta.env.VITE_API_URL?.trim();
const apontaParaOFrontend = (() => {
  if (!apiConfigurada || typeof globalThis.location === 'undefined') return false;
  try {
    return new URL(apiConfigurada, globalThis.location.href).origin === globalThis.location.origin;
  } catch {
    return true;
  }
})();
const API_URL = (apiConfigurada && !apontaParaOFrontend ? apiConfigurada.replace(/\/+$/, '') : '') || (import.meta.env.DEV ? '/api' : '');
export const modoDemo = !API_URL;

export function urlDaApi(caminho) {
  if (!caminho) return undefined;
  if (/^(?:data:|blob:|https?:\/\/)/i.test(caminho)) return caminho;
  if (!API_URL) return caminho;
  try {
    const origem = new URL(API_URL, globalThis.location?.href || 'http://localhost').origin;
    return new URL(caminho, `${origem}/`).href;
  } catch {
    return caminho;
  }
}

function respostaDemo(caminho, metodo) {
  const [rota, query = ''] = caminho.split('?');
  if (metodo !== 'GET') throw new Error('Modo demonstração: API pública indisponível. Esta ação não foi salva.');
  if (rota === '/receitas') return { itens: receitasDemo, pagina: 1, total: receitasDemo.length };
  if (rota === '/exercicios') return { itens: exerciciosDemo, pagina: 1, total: exerciciosDemo.length };
  if (rota === '/feed/infinito') return { dados: receitasDemo.map(item => ({ ...item, tipo: 'receita', titulo: item.titulo, criado_por: { nome: item.autor_nome }, curtido_por_usuario: false, salvo_por_usuario: false })), pagina: 1, tem_proximo: false };
  if (rota === '/posts') return { posts: [] };
  if (rota === '/planos') return [];
  if (rota === '/mensagens/conversas' || rota === '/notificacoes' || rota === '/usuarios/me/peso' || rota === '/usuarios/lista-compras') return [];
  if (rota === '/discover') {
    const parametros = new URLSearchParams(query);
    const exercicios = parametros.get('tipo') === 'exercicios';
    const itens = exercicios ? exerciciosDemo : receitasDemo;
    const filtro = parametros.get(exercicios ? 'musculo' : 'categoria');
    const filtrados = filtro ? itens.filter(item => exercicios ? item.musculos_trabalhados.includes(filtro) : item.categoria === filtro) : itens;
    return { sucesso: true, itens: filtrados, pagina: 1, tem_proximo: false };
  }
  if (rota.startsWith('/receitas/')) {
    const id = Number(rota.split('/')[2]);
    const receita = receitasDemo.find(item => item.id === id);
    if (receita) return receita;
  }
  throw new Error('Modo demonstração: esta função precisa da API pública, que ainda não está configurada.');
}

export async function requisicao(caminho, opcoes = {}) {
  if (!API_URL) return respostaDemo(caminho, opcoes.method || 'GET');
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
