import { useEffect, useState } from 'react';
import { requisicao } from '../api';

const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function AlimentacaoPage({ token }) {
  const [aba, setAba] = useState('explorar');
  const [receitas, setReceitas] = useState([]);
  const [ingredientes, setIngredientes] = useState('');
  const [selecionadas, setSelecionadas] = useState({});
  const [compras, setCompras] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisicao('/receitas?page=1&limit=12')
      .then(resposta => setReceitas(resposta.itens || resposta))
      .catch(error => setErro(error.message));
    if (token) requisicao('/usuarios/lista-compras', { token }).then(resposta => setCompras(resposta.itens || [])).catch(() => {});
  }, [token]);

  const gerarIdeia = () => {
    const lista = ingredientes.split(',').map(item => item.trim()).filter(Boolean);
    if (!lista.length) { setErro('Digite pelo menos um ingrediente.'); return; }
    setErro('');
    setAba('planejar');
    setSelecionadas({ [dias[new Date().getDay() - 1] || 'Seg']: { titulo: `Receita com ${lista.slice(0, 2).join(' e ')}`, descricao: 'Sugestão rápida para aproveitar o que você já tem.' } });
  };

  const adicionarDia = (dia, receita) => setSelecionadas(prev => ({ ...prev, [dia]: receita }));
  const removerDia = dia => setSelecionadas(prev => { const copia = { ...prev }; delete copia[dia]; return copia; });

  return <section className="alimentacao-page">
    <header className="alimentacao-header"><div><p className="eyebrow">cozinha inteligente</p><h2>Comer bem, sem complicar.</h2><p>Encontre uma receita, planeje a semana e compre só o necessário.</p></div><div className="alimentacao-tabs"><button className={aba === 'explorar' ? 'selecionado' : ''} onClick={() => setAba('explorar')}>Explorar</button><button className={aba === 'planejar' ? 'selecionado' : ''} onClick={() => setAba('planejar')}>Minha semana</button><button className={aba === 'compras' ? 'selecionado' : ''} onClick={() => setAba('compras')}>Compras</button></div></header>
    <div className="geladeira"><div><span className="geladeira-icon">✦</span><div><strong>O que tem na sua geladeira?</strong><small>Separe os ingredientes por vírgula e monte uma ideia de refeição.</small></div></div><div className="geladeira-form"><input value={ingredientes} onChange={event => setIngredientes(event.target.value)} placeholder="frango, arroz, tomate..." /><button className="primario" onClick={gerarIdeia}>Criar ideia</button></div></div>
    {erro && <p className="erro">{erro}</p>}
    {aba === 'explorar' && <div className="receitas-area"><div className="section-heading"><div><p className="eyebrow">para cozinhar hoje</p><h3>Receitas que cabem na rotina</h3></div><span className="chip">{receitas.length} disponíveis</span></div><div className="receitas-grid">{receitas.map(receita => <article className="receita-smart" key={receita.id}><div className="receita-imagem">{receita.foto_url ? <img src={receita.foto_url} loading="lazy" alt="" /> : <span>🥗</span>}</div><div className="receita-info"><span className="chip">{receita.categoria || 'caseira'}</span><h3>{receita.titulo}</h3><p>{receita.descricao}</p><div><span>{receita.tempo_preparo || '20'} min</span><span>{receita.calorias || '—'} kcal</span><button onClick={() => adicionarDia('Seg', receita)}>＋ semana</button></div></div></article>)}</div>{!receitas.length && <p className="vazio">Ainda não há receitas publicadas.</p>}</div>}
    {aba === 'planejar' && <div className="semana-area"><div className="section-heading"><div><p className="eyebrow">planejamento</p><h3>Uma semana já encaminhada</h3></div><span className="chip">{Object.keys(selecionadas).length}/7 dias</span></div><div className="semana-grid">{dias.map(dia => <article className="dia-card" key={dia}><strong>{dia}</strong>{selecionadas[dia] ? <><h4>{selecionadas[dia].titulo}</h4><small>{selecionadas[dia].calorias || '—'} kcal</small><button onClick={() => removerDia(dia)}>Remover</button></> : <button onClick={() => receitas[0] && adicionarDia(dia, receitas[0])}>+ adicionar receita</button>}</article>)}</div></div>}
    {aba === 'compras' && <div className="compras-area"><div className="section-heading"><div><p className="eyebrow">próxima ida ao mercado</p><h3>Lista de compras</h3></div><span className="chip">{compras.length} itens</span></div>{compras.length ? compras.map(item => <label className="compra-item" key={item.id}><input type="checkbox" /> <span>{item.nome}</span><small>{item.quantidade} {item.unidade}</small></label>) : <p className="vazio">Adicione receitas à sua semana para montar a lista automaticamente.</p>}</div>}
  </section>;
}
