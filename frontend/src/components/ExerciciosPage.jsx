import { useEffect, useState } from 'react';
import { requisicao } from '../api';

const grupos = {
  casa: ['perna', 'glúteo', 'core', 'braço'],
  academia: ['peito', 'costas', 'ombro', 'perna'],
};

function VideoExercicio({ item }) {
  const [falhou, setFalhou] = useState(false);
  if (item.video_url && !falhou) return <video className="exercicio-video" src={item.video_url} muted autoPlay loop playsInline controls onError={() => setFalhou(true)} />;
  return <div className="exercicio-video exercicio-placeholder"><span>▶</span><small>Vídeo de execução em breve</small></div>;
}

export default function ExerciciosPage({ token, convidado = false }) {
  const [modo, setModo] = useState('casa');
  const [musculo, setMusculo] = useState('');
  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState('');
  const [sessao, setSessao] = useState(null);
  const [serieAtual, setSerieAtual] = useState(1);
  const [acaoPendente, setAcaoPendente] = useState(false);

  useEffect(() => {
    const filtro = musculo ? `&musculo=${encodeURIComponent(musculo)}` : '';
    requisicao(`/exercicios?page=1&limit=30${filtro}`)
      .then(resposta => setItens(resposta.itens || resposta))
      .catch(error => setErro(error.message));
  }, [musculo]);

  const visiveis = itens.filter(item => (!musculo || (item.musculos_trabalhados || '').includes(musculo)) && (() => { try { return JSON.parse(item.ambientes || '["casa","academia"]').includes(modo); } catch { return true; } })());
  const iniciar = async item => {
    try {
      const resposta = await requisicao(`/exercicios/${item.id}/iniciar-sessao`, { method: 'POST', token, body: { series: item.series_recomendadas || 3, repeticoes: item.repeticoes_recomendadas || 12 } });
      setSessao({ ...resposta, nome: item.nome, completas: 0, finalizada: false });
      setSerieAtual(1);
    } catch (error) { setErro(error.message); }
  };

  const completarSerie = async () => {
    if (!sessao || acaoPendente) return;
    setAcaoPendente(true);
    try {
      await requisicao(`/exercicios/${sessao.exercicio_id}/sessao/${sessao.sessao_id}/serie-completa`, {
        method: 'POST', token, body: { numero_serie: serieAtual },
      });
      setSessao(atual => ({ ...atual, completas: serieAtual }));
      setSerieAtual(atual => Math.min(atual + 1, sessao.series_totais));
    } catch (error) { setErro(error.message); }
    finally { setAcaoPendente(false); }
  };

  const finalizarSessao = async () => {
    if (!sessao || acaoPendente) return;
    setAcaoPendente(true);
    try {
      const resultado = await requisicao(`/exercicios/${sessao.exercicio_id}/sessao/${sessao.sessao_id}/finalizar`, { method: 'POST', token, body: {} });
      setSessao(atual => ({ ...atual, finalizada: true, resumo: resultado.sessao_completa }));
    } catch (error) { setErro(error.message); }
    finally { setAcaoPendente(false); }
  };

  return <section className="exercicios-page">
    <div className="exercicios-heading"><div><p className="eyebrow">movimento</p><h2>Exercícios para sua rotina</h2><p>Escolha o ambiente e aprenda a executar com segurança.</p></div><div className="modo-tabs"><button className={modo === 'casa' ? 'selecionado' : ''} onClick={() => setModo('casa')}>Em casa</button><button className={modo === 'academia' ? 'selecionado' : ''} onClick={() => setModo('academia')}>Academia</button></div></div>
    <div className="exercicios-filtros">{grupos[modo].map(opcao => <button className={musculo === opcao ? 'selecionado' : ''} onClick={() => setMusculo(musculo === opcao ? '' : opcao)} key={opcao}>{opcao}</button>)}</div>
    {erro && <p className="erro">{erro}</p>}
    <div className="exercicios-grid">{visiveis.map(item => <article className="exercicio-card" key={item.id}><VideoExercicio item={item} /><div className="exercicio-card-body"><span className="chip">{modo}</span><h3>{item.nome}</h3><p>{item.descricao}</p><div className="exercicio-meta"><span>★ {item.dificuldade || 1}/5</span><span>{item.series_recomendadas || '-'} séries</span><span>{item.repeticoes_recomendadas || '-'} reps</span></div><button className="primario" disabled={convidado} title={convidado ? 'Entre em uma conta para registrar sua sessão.' : ''} onClick={() => iniciar(item)}>{convidado ? 'Entre para registrar' : 'Iniciar execução'}</button></div></article>)}</div>
    {!visiveis.length && <p className="vazio">Nenhum exercício disponível para este filtro.</p>}
    {sessao && <div className="sessao-dialog"><div><button className="fechar" onClick={() => sessao.finalizada && setSessao(null)} disabled={!sessao.finalizada}>{sessao.finalizada ? 'Fechar' : 'Finalize para fechar'}</button><p className="eyebrow">sessão guiada</p><h3>{sessao.nome}</h3>{sessao.finalizada ? <><p>Sessão registrada: {sessao.resumo?.series_completas || 0} séries concluídas.</p><strong>Bom trabalho!</strong></> : <><p>Série {Math.min(serieAtual, sessao.series_totais)} de {sessao.series_totais} · {sessao.repeticoes_por_serie} repetições</p><progress value={sessao.completas} max={sessao.series_totais} /><div className="acoes-card"><button className="primario" disabled={acaoPendente || sessao.completas >= sessao.series_totais} onClick={completarSerie}>{acaoPendente ? 'Salvando…' : sessao.completas >= sessao.series_totais ? 'Todas as séries concluídas' : `Concluir série ${serieAtual}`}</button><button onClick={finalizarSessao} disabled={acaoPendente}>Finalizar sessão</button></div></>}</div></div>}
  </section>;
}
