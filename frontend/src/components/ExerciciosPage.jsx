import { useEffect, useState } from 'react';
import { requisicao } from '../api';

const grupos = {
  casa: ['perna', 'glúteo', 'core', 'braço'],
  academia: ['peito', 'costas', 'ombro', 'perna'],
};

function VideoExercicio({ item }) {
  if (item.video_url) return <video className="exercicio-video" src={item.video_url} muted autoPlay loop playsInline controls />;
  return <div className="exercicio-video exercicio-placeholder"><span>▶</span><small>Vídeo de execução em breve</small></div>;
}

export default function ExerciciosPage({ token }) {
  const [modo, setModo] = useState('casa');
  const [musculo, setMusculo] = useState('');
  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState('');
  const [sessao, setSessao] = useState(null);

  useEffect(() => {
    const filtro = musculo ? `&musculo=${encodeURIComponent(musculo)}` : '';
    requisicao(`/exercicios?page=1&limit=30${filtro}`)
      .then(resposta => setItens(resposta.itens || resposta))
      .catch(error => setErro(error.message));
  }, [musculo]);

  const visiveis = itens.filter(item => !musculo || (item.musculos_trabalhados || '').includes(musculo));
  const iniciar = async item => {
    try {
      const resposta = await requisicao(`/exercicios/${item.id}/iniciar-sessao`, { method: 'POST', token, body: { series: item.series_recomendadas || 3, repeticoes: item.repeticoes_recomendadas || 12 } });
      setSessao({ ...resposta, nome: item.nome });
    } catch (error) { setErro(error.message); }
  };

  return <section className="exercicios-page">
    <div className="exercicios-heading"><div><p className="eyebrow">movimento</p><h2>Exercícios para sua rotina</h2><p>Escolha o ambiente e aprenda a executar com segurança.</p></div><div className="modo-tabs"><button className={modo === 'casa' ? 'selecionado' : ''} onClick={() => setModo('casa')}>Em casa</button><button className={modo === 'academia' ? 'selecionado' : ''} onClick={() => setModo('academia')}>Academia</button></div></div>
    <div className="exercicios-filtros">{grupos[modo].map(opcao => <button className={musculo === opcao ? 'selecionado' : ''} onClick={() => setMusculo(musculo === opcao ? '' : opcao)} key={opcao}>{opcao}</button>)}</div>
    {erro && <p className="erro">{erro}</p>}
    <div className="exercicios-grid">{visiveis.map(item => <article className="exercicio-card" key={item.id}><VideoExercicio item={item} /><div className="exercicio-card-body"><span className="chip">{modo}</span><h3>{item.nome}</h3><p>{item.descricao}</p><div className="exercicio-meta"><span>★ {item.dificuldade || 1}/5</span><span>{item.series_recomendadas || '-'} séries</span><span>{item.repeticoes_recomendadas || '-'} reps</span></div><button className="primario" onClick={() => iniciar(item)}>Iniciar execução</button></div></article>)}</div>
    {!visiveis.length && <p className="vazio">Nenhum exercício disponível para este filtro.</p>}
    {sessao && <div className="sessao-dialog"><div><button className="fechar" onClick={() => setSessao(null)}>Fechar</button><p className="eyebrow">sessão guiada</p><h3>{sessao.nome}</h3><p>{sessao.series_totais} séries de {sessao.repeticoes_por_serie} repetições</p><strong>Prepare-se para começar.</strong></div></div>}
  </section>;
}
