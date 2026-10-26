import { useEffect, useState } from 'react';
import { requisicao, urlDaApi } from '../api';

const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const diaAtual = () => dias[(new Date().getDay() + 6) % dias.length];
const lerArmazenamento = chave => {
  try { return JSON.parse(globalThis.localStorage?.getItem(chave) || '{}'); }
  catch { return {}; }
};
const salvarArmazenamento = (chave, valor) => {
  try { globalThis.localStorage?.setItem(chave, JSON.stringify(valor)); }
  catch { /* A semana continua disponível durante esta sessão se o armazenamento estiver bloqueado. */ }
};

const mapaImagensReceitas = {
  'Aveia cremosa com iogurte, chia e frutas': 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80',
  'Bowl brasileiro de frango, arroz integral e feijão': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
  'Salada morna de lentilha com tomate e pepino': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80',
  'Peixe assado com batata e brócolis': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
  'Omelete de espinafre e tomate com pão integral': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80',
  'Grão-de-bico com legumes e molho de tahine': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80',
};

const resultadoReceita = {
  'Aveia cremosa com iogurte, chia e frutas': 'Resultado: café da manhã leve, cremoso, saciante e cheio de energia.',
  'Bowl brasileiro de frango, arroz integral e feijão': 'Resultado: prato completo, nutritivo e ideal para manter a fome controlada.',
  'Salada morna de lentilha com tomate e pepino': 'Resultado: refeição fresca, digestiva e rica em fibras para o dia.',
  'Peixe assado com batata e brócolis': 'Resultado: jantar equilibrado com proteína e sabor úmido e suculento.',
  'Omelete de espinafre e tomate com pão integral': 'Resultado: café da manhã equilibrado, saboroso e bem energético.',
  'Grão-de-bico com legumes e molho de tahine': 'Resultado: prato hearty, colorido e muito satisfatório para a rotina.',
};

const imagemDaReceita = (receita) => mapaImagensReceitas[receita?.titulo] || mapaImagensReceitas[receita?.nome] || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80';
const resultadoDaReceita = (receita) => resultadoReceita[receita?.titulo] || resultadoReceita[receita?.nome] || 'Resultado: prato equilibrado, saboroso e prático para o dia a dia.';
const passosDaReceita = (receita) => {
  const texto = receita?.modo_preparo || receita?.descricao || '';
  const passos = texto.split(/[.!?]+/).map(item => item.trim()).filter(Boolean);
  return passos.length > 1 ? passos : ['Prepare os ingredientes.', 'Siga o modo de preparo indicado.', 'Sirva com atenção e confira o resultado.'];
};

export default function AlimentacaoPage({ token, convidado = false, receitaInicial = null, aoAdicionarReceita }) {
  const [aba, setAba] = useState('explorar');
  const [receitas, setReceitas] = useState([]);
  const [receitaSelecionada, setReceitaSelecionada] = useState(null);
  const [passoAtual, setPassoAtual] = useState(0);
  const [ingredientes, setIngredientes] = useState('');
  const [selecionadas, setSelecionadas] = useState(() => {
    return lerArmazenamento(`aptus_semana_${token?.slice(-12) || 'visitante'}`);
  });
  const [compras, setCompras] = useState([]);
  const [planoAtual, setPlanoAtual] = useState(null);
  const [consumidas, setConsumidas] = useState({});
  const [marcadas, setMarcadas] = useState(() => {
    return lerArmazenamento(`aptus_compras_marcadas_${token?.slice(-12) || 'visitante'}`);
  });
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisicao('/receitas?page=1&limit=12')
      .then(resposta => setReceitas(resposta.itens || resposta))
      .catch(error => setErro(error.message));
    if (token && !convidado) {
      requisicao('/usuarios/plano-atual', { token }).then(async plano => {
        setPlanoAtual(plano);
        setConsumidas(Object.fromEntries((plano.refeicoes_hoje || []).map(refeicao => [refeicao.id, refeicao.consumido])));
        const lista = await requisicao(`/usuarios/lista-compras?plano_id=${plano.id}`, { token });
        setCompras(lista.itens || []);
      }).catch(() => { setPlanoAtual(null); setCompras([]); });
    }
  }, [token, convidado]);

  useEffect(() => {
    if (!receitaInicial) return;
    setSelecionadas(atual => ({ ...atual, [diaAtual()]: receitaInicial }));
    setAba('planejar');
    aoAdicionarReceita?.();
  }, [receitaInicial, aoAdicionarReceita]);

  useEffect(() => {
    salvarArmazenamento(`aptus_compras_marcadas_${token?.slice(-12) || 'visitante'}`, marcadas);
  }, [marcadas, token]);

  useEffect(() => {
    salvarArmazenamento(`aptus_semana_${token?.slice(-12) || 'visitante'}`, selecionadas);
  }, [selecionadas, token]);

  const gerarIdeia = () => {
    const lista = ingredientes.split(',').map(item => item.trim()).filter(Boolean);
    if (!lista.length) { setErro('Digite pelo menos um ingrediente.'); return; }
    setErro('');
    setAba('planejar');
    setSelecionadas({ [diaAtual()]: { titulo: `Receita com ${lista.slice(0, 2).join(' e ')}`, descricao: 'Sugestão rápida para aproveitar o que você já tem.' } });
  };

  const adicionarDia = (dia, receita) => setSelecionadas(prev => ({ ...prev, [dia]: receita }));
  const removerDia = dia => setSelecionadas(prev => { const copia = { ...prev }; delete copia[dia]; return copia; });
  const abrirReceita = receita => {
    setReceitaSelecionada(receita);
    setPassoAtual(0);
  };
  const registrarRefeicao = async refeicao => {
    if (!planoAtual) return;
    setCarregando(true); setErro(''); setSucesso('');
    try {
      const consumido = !consumidas[refeicao.id];
      await requisicao(`/usuarios/planos/${planoAtual.id}/dia/${planoAtual.dia_atual}/refeicao/${encodeURIComponent(refeicao.refeicao || 'refeicao')}`, {
        method: 'PUT', token, body: { receita_id: refeicao.receita_id, data: new Date().toISOString().slice(0, 10), consumido },
      });
      setConsumidas(atual => ({ ...atual, [refeicao.id]: consumido }));
      setSucesso(consumido ? 'Refeição registrada no seu progresso.' : 'Refeição removida do progresso.');
    } catch (error) { setErro(error.message); }
    finally { setCarregando(false); }
  };

  return <section className="alimentacao-page">
    <header className="alimentacao-header"><div><p className="eyebrow">cozinha inteligente</p><h2>Comer bem, sem complicar.</h2><p>Encontre uma receita, planeje a semana e compre só o necessário.</p></div><div className="alimentacao-tabs"><button className={aba === 'explorar' ? 'selecionado' : ''} onClick={() => setAba('explorar')}>Explorar</button><button className={aba === 'planejar' ? 'selecionado' : ''} onClick={() => setAba('planejar')}>Minha semana</button><button className={aba === 'compras' ? 'selecionado' : ''} onClick={() => setAba('compras')}>Compras</button></div></header>
    <div className="geladeira"><div><span className="geladeira-icon">✦</span><div><strong>O que tem na sua geladeira?</strong><small>Separe os ingredientes por vírgula e monte uma ideia de refeição.</small></div></div><div className="geladeira-form"><input value={ingredientes} onChange={event => setIngredientes(event.target.value)} placeholder="frango, arroz, tomate..." /><button className="primario" onClick={gerarIdeia}>Criar ideia</button></div></div>
    {erro && <p className="erro">{erro}</p>}
    {sucesso && <p className="sucesso" role="status">{sucesso}</p>}
    {planoAtual && <div className="semana-area"><div className="section-heading"><div><p className="eyebrow">dia {planoAtual.dia_atual} do seu plano</p><h3>{planoAtual.titulo}</h3></div><span className="chip">{planoAtual.progresso_percentual}% concluído</span></div><div className="cartoes-grade">{(planoAtual.refeicoes_hoje || []).map(refeicao => <article className="cartao-interativo" key={refeicao.id}><h4>{refeicao.titulo}</h4><p>{refeicao.refeicao || 'Refeição'} · {refeicao.calorias || '—'} kcal</p><button className="primario" disabled={carregando} onClick={() => registrarRefeicao(refeicao)}>{consumidas[refeicao.id] ? 'Desfazer registro' : 'Marcar como consumida'}</button></article>)}</div></div>}
    {aba === 'explorar' && <div className="receitas-area"><div className="section-heading"><div><p className="eyebrow">para cozinhar hoje</p><h3>Receitas que cabem na rotina</h3></div><span className="chip">{receitas.length} disponíveis</span></div><div className="receitas-grid">{receitas.map(receita => <article className="receita-smart" key={receita.id}><div className="receita-imagem">{receita.foto_url ? <img src={urlDaApi(receita.foto_url)} loading="lazy" alt={receita.titulo} /> : <img src={imagemDaReceita(receita)} loading="lazy" alt={receita.titulo} />}</div><div className="receita-info"><span className="chip">{receita.categoria || 'caseira'}</span><h3>{receita.titulo}</h3><p>{receita.descricao}</p><p className="resultado-receita">{resultadoDaReceita(receita)}</p><div><span>{receita.tempo_preparo || '20'} min</span><span>{receita.calorias || '—'} kcal</span><button onClick={() => abrirReceita(receita)}>Ver passo a passo</button></div></div></article>)}</div>{!receitas.length && <p className="vazio">Ainda não há receitas publicadas.</p>}</div>}
    {aba === 'planejar' && <div className="semana-area"><div className="section-heading"><div><p className="eyebrow">planejamento</p><h3>Uma semana já encaminhada</h3></div><span className="chip">{Object.keys(selecionadas).length}/7 dias</span></div><div className="semana-grid">{dias.map(dia => <article className="dia-card" key={dia}><strong>{dia}</strong>{selecionadas[dia] ? <><h4>{selecionadas[dia].titulo}</h4><small>{selecionadas[dia].calorias || '—'} kcal</small><button onClick={() => removerDia(dia)}>Remover</button></> : <button onClick={() => receitas[0] && adicionarDia(dia, receitas[0])}>+ adicionar receita</button>}</article>)}</div></div>}
    {aba === 'compras' && <div className="compras-area"><div className="section-heading"><div><p className="eyebrow">próxima ida ao mercado</p><h3>Lista de compras</h3></div><span className="chip">{compras.filter(item => !marcadas[item.id]).length} pendentes</span></div>{compras.length ? compras.map(item => <label className={`compra-item ${marcadas[item.id] ? 'item-comprado' : ''}`} key={item.id}><input type="checkbox" checked={Boolean(marcadas[item.id])} onChange={evento => setMarcadas(atual => ({ ...atual, [item.id]: evento.target.checked }))} /> <span>{item.nome}</span><small>{item.quantidade} {item.unidade}</small></label>) : <p className="vazio">Siga um plano com receitas para montar sua lista de compras.</p>}</div>}
    {receitaSelecionada && <div className="receita-etapa-modal" role="dialog" aria-modal="true" aria-label={`Guia de ${receitaSelecionada.titulo}`}><div className="receita-etapa-card"><button className="guiao-fechar" onClick={() => { setReceitaSelecionada(null); setPassoAtual(0); }}>Fechar</button><div className="receita-etapa-cabeca"><div><p className="eyebrow">roteiro alimentar</p><h3>{receitaSelecionada.titulo}</h3><p>{receitaSelecionada.descricao}</p></div><span className="chip">{receitaSelecionada.tempo_preparo || 20} min</span></div><div className="receita-etapa-meta"><span>{receitaSelecionada.calorias || '—'} kcal</span><span>{receitaSelecionada.porcoes || 1} porção</span><span>{receitaSelecionada.categoria || 'caseira'}</span></div><div className="receita-etapa-progress"><span>Etapa {passoAtual + 1} de {passosDaReceita(receitaSelecionada).length}</span><progress value={passoAtual + 1} max={passosDaReceita(receitaSelecionada).length} /></div><div className="receita-etapa-passos"><article><span>{passoAtual + 1}</span><p>{passosDaReceita(receitaSelecionada)[passoAtual]}</p></article></div><div className="receita-etapa-acao"><button onClick={() => setPassoAtual(atual => Math.max(0, atual - 1))} disabled={passoAtual === 0}>Anterior</button><button className="primario" onClick={() => setPassoAtual(atual => Math.min(passosDaReceita(receitaSelecionada).length - 1, atual + 1))} disabled={passoAtual === passosDaReceita(receitaSelecionada).length - 1}>Próximo passo</button></div></div></div>}
  </section>;
}
