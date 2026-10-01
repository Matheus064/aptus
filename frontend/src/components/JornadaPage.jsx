import { useEffect, useState } from 'react';
import { requisicao } from '../api';

const vazio = { titulo: '', descricao: '', duracao_dias: 7, calorias_alvo: '' };
const chaveDataLocal = data => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;

export default function JornadaPage({ token, usuario }) {
  const [aba, setAba] = useState('comunidade');
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState({ conteudo: '', tipo: 'motivacao' });
  const [comentario, setComentario] = useState({});
  const [planos, setPlanos] = useState([]);
  const [plano, setPlano] = useState(vazio);
  const [grupos, setGrupos] = useState([]);
  const [perfilId, setPerfilId] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const carregarPosts = () => requisicao('/posts?page=1&limit=20', { token }).then(data => setPosts(data.posts || []));
  const carregarPlanos = () => requisicao('/planos', { token }).then(data => setPlanos(data || []));
  const carregarGrupos = () => requisicao('/comunidade/grupos', { token }).then(setGrupos);
  useEffect(() => { carregarPosts().catch(e => setErro(e.message)); carregarPlanos().catch(e => setErro(e.message)); carregarGrupos().catch(e => setErro(e.message)); }, [token]);

  const executar = async (acao, sucesso = '') => { try { setErro(''); await acao(); setMensagem(sucesso); } catch (e) { setErro(e.message); } };
  const publicar = event => { event.preventDefault(); executar(async () => { await requisicao('/posts', { method: 'POST', token, body: post }); setPost({ conteudo: '', tipo: 'motivacao' }); await carregarPosts(); }, 'Publicação criada.'); };
  const comentar = (id, event) => { event.preventDefault(); executar(async () => { await requisicao(`/posts/${id}/comentarios`, { method: 'POST', token, body: { conteudo: comentario[id] } }); setComentario({ ...comentario, [id]: '' }); }, 'Comentário adicionado.'); };
  const criarPlano = event => { event.preventDefault(); executar(async () => { await requisicao('/planos', { method: 'POST', token, body: plano }); setPlano(vazio); await carregarPlanos(); }, 'Plano criado.'); };
  const salvarPerfil = event => { event.preventDefault(); executar(async () => { const data = await requisicao(`/usuarios/${perfilId}`, { token }); setPerfil(data); }, 'Perfil carregado.'); };

  return <section className="pagina jornada">
    <p className="eyebrow">todas as ferramentas</p><h2>Minha jornada</h2>
    <div className="tags jornada-tabs">{[['comunidade','Comunidade'],['planos','Planos'],['grupos','Grupos'],['perfil','Perfil público'],['conta','Minha conta'],['admin','Admin']].map(([id, label]) => <button key={id} className={aba === id ? 'selecionado' : ''} onClick={() => setAba(id)}>{label}</button>)}</div>
    {erro && <p className="erro">{erro}</p>}{mensagem && <p className="sucesso">{mensagem}</p>}
    {aba === 'comunidade' && <div className="jornada-grid"><form className="mini-form" onSubmit={publicar}><h3>Compartilhe com a comunidade</h3><textarea required value={post.conteudo} onChange={e => setPost({ ...post, conteudo: e.target.value })} placeholder="Como foi seu dia?" /><select value={post.tipo} onChange={e => setPost({ ...post, tipo: e.target.value })}><option value="motivacao">Motivação</option><option value="progresso">Progresso</option><option value="receita">Receita</option><option value="exercicio">Exercício</option></select><button className="primario">Publicar</button></form><div className="jornada-lista">{posts.map(item => <article className="post" key={item.id}><div className="post-corpo"><div className="autor"><b>{item.autor_nome}</b>{item.autor_verificado ? <small>Profissional verificado</small> : null}</div><p>{item.conteudo}</p><small>{item.curtidas || 0} curtidas · {item.comentarios || 0} comentários</small><form onSubmit={e => comentar(item.id, e)}><input required value={comentario[item.id] || ''} onChange={e => setComentario({ ...comentario, [item.id]: e.target.value })} placeholder="Escreva um comentário" /><button>Comentar</button></form><button onClick={() => executar(() => requisicao(`/comunidade/reportes`, { method: 'POST', token, body: { tipo: 'post', alvo_id: item.id, motivo: 'Conteúdo a analisar' } }), 'Reporte enviado.')}>Reportar</button><button onClick={() => executar(() => requisicao(`/posts/${item.id}`, { method: 'DELETE', token }).then(carregarPosts), 'Publicação removida.')}>Excluir</button></div></article>)}</div></div>}
    {aba === 'planos' && <PlanosJornada token={token} planos={planos} carregarPlanos={carregarPlanos} executar={executar} plano={plano} setPlano={setPlano} criarPlano={criarPlano} />}
    {aba === 'grupos' && <GruposJornada token={token} usuario={usuario} grupos={grupos} executar={executar} />}
    {aba === 'perfil' && <form className="mini-form" onSubmit={salvarPerfil}><h3>Encontrar perfil público</h3><input required type="number" placeholder="ID do usuário" value={perfilId} onChange={e => setPerfilId(e.target.value)} /><button className="primario">Visualizar</button>{perfil && <div className="perfil-publico"><h3>{perfil.nome_completo}</h3><p>{perfil.bio || 'Ainda sem biografia.'}</p><small>{perfil.publicacoes} publicações · {perfil.seguidores} seguidores</small><button onClick={() => executar(() => requisicao(`/usuarios/${perfil.id}/seguir`, { method: 'POST', token }), 'Acompanhamento atualizado.')}>Seguir</button></div>}</form>}
    {aba === 'conta' && <ContaJornada token={token} usuario={usuario} executar={executar} />}
    {aba === 'admin' && usuario.role === 'admin' && <AdminPanel token={token} executar={executar} />}
    {aba === 'admin' && usuario.role !== 'admin' && <p className="vazio">Acesso restrito ao administrador.</p>}
  </section>;
}

function CalendarioPessoal({ usuario }) {
  const storageKey = `aptus_calendario_${usuario?.id || 'visitante'}`;
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [selecionado, setSelecionado] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
  const [eventos, setEventos] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  });
  const [form, setForm] = useState({ titulo: '', tipo: 'meta', observacoes: '', status: 'pendente' });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(eventos));
  }, [eventos, storageKey]);

  const chaveSelecionada = chaveDataLocal(selecionado);
  const itemSelecionado = eventos[chaveSelecionada] || { titulo: '', tipo: 'meta', observacoes: '', status: 'pendente' };

  const comecarMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
  const fimMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
  const primeiroDia = (comecarMes.getDay() + 6) % 7;
  const diasMes = [];
  for (let index = 0; index < primeiroDia; index += 1) {
    diasMes.push(null);
  }
  for (let dia = 1; dia <= fimMes.getDate(); dia += 1) {
    diasMes.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia));
  }
  while (diasMes.length % 7 !== 0) {
    diasMes.push(null);
  }

  const totalDiasConcluidos = Object.values(eventos).filter((valor) => valor?.status === 'concluido').length;

  const salvarEvento = evento => {
    evento.preventDefault();
    const titulo = form.titulo.trim();
    if (!titulo) return;
    const novoEvento = {
      ...itemSelecionado,
      titulo,
      tipo: form.tipo,
      observacoes: form.observacoes.trim(),
      status: form.status,
    };
    setEventos(prev => ({ ...prev, [chaveSelecionada]: novoEvento }));
    setForm({ titulo: '', tipo: 'meta', observacoes: '', status: 'pendente' });
  };

  const alternarStatus = () => {
    setEventos(prev => ({
      ...prev,
      [chaveSelecionada]: {
        ...itemSelecionado,
        titulo: itemSelecionado.titulo || 'Meta do dia',
        tipo: itemSelecionado.tipo || 'meta',
        observacoes: itemSelecionado.observacoes || '',
        status: itemSelecionado.status === 'concluido' ? 'pendente' : 'concluido',
      },
    }));
  };

  const limparDia = () => {
    setEventos(prev => {
      const copia = { ...prev };
      delete copia[chaveSelecionada];
      return copia;
    });
    setForm({ titulo: '', tipo: 'meta', observacoes: '', status: 'pendente' });
  };

  return <div className="calendario-personalizado"><div className="calendario-topo"><div><p className="eyebrow">personalizado</p><h3>Calendário da sua rotina</h3></div><div className="calendario-stats"><span>{totalDiasConcluidos} concluídos</span></div></div><div className="calendario-navegacao"><button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))}>‹</button><strong>{mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong><button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))}>›</button></div><div className="calendario-grade"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>{diasMes.map((dia, index) => {
      const ch = dia ? chaveDataLocal(dia) : `vazio-${index}`;
      const marcado = eventos[ch];
      const hojeCh = chaveDataLocal(hoje);
      const selecionadoCh = chaveDataLocal(selecionado);
      if (!dia) return <span key={ch} className="calendario-vazio" aria-hidden="true" />;
      return <button key={ch} type="button" className={`calendario-dia ${ch === selecionadoCh ? 'selecionado' : ''} ${marcado?.status === 'concluido' ? 'concluido' : ''} ${ch === hojeCh ? 'hoje' : ''}`} onClick={() => setSelecionado(dia)}><small>{dia.getDate()}</small>{marcado && <em>{marcado.tipo}</em>}</button>;
    })}</div><form className="mini-form calendario-form" onSubmit={salvarEvento}><h3>{selecionado.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</h3><input required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex.: treino, refeição, descanso" />
      <div className="calendario-aux"><select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}><option value="meta">Meta</option><option value="treino">Treino</option><option value="refeicao">Refeição</option><option value="descanso">Descanso</option><option value="reflexao">Reflexão</option></select><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="pendente">Pendente</option><option value="concluido">Concluído</option></select></div><textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} placeholder="Detalhes do dia, objetivo ou lembrete..."></textarea><div className="calendario-acoes"><button type="submit" className="primario">Salvar no calendário</button>{itemSelecionado?.titulo && <button type="button" className="texto" onClick={alternarStatus}>{itemSelecionado.status === 'concluido' ? 'Marcar pendente' : 'Marcar concluído'}</button>}{itemSelecionado?.titulo && <button type="button" className="texto" onClick={limparDia}>Limpar</button>}</div></form>{itemSelecionado?.titulo && <div className="calendario-resumo"><h4>Resumo do dia</h4><p><strong>{itemSelecionado.titulo}</strong></p><p>{itemSelecionado.observacoes || 'Sem observações adicionais.'}</p><p className="calendario-status">Status: <span>{itemSelecionado.status === 'concluido' ? 'Concluído' : 'Pendente'}</span></p></div>}</div>;
}

function PlanosJornada({ token, planos, carregarPlanos, executar, plano, setPlano, criarPlano }) {
  const [selecionado, setSelecionado] = useState(null);
  return <div className="jornada-grid"><form className="mini-form" onSubmit={criarPlano}><h3>Criar plano alimentar</h3><input required placeholder="Título" value={plano.titulo} onChange={e => setPlano({ ...plano, titulo: e.target.value })} /><textarea required placeholder="Descrição" value={plano.descricao} onChange={e => setPlano({ ...plano, descricao: e.target.value })} /><input type="number" min="1" placeholder="Duração em dias" value={plano.duracao_dias} onChange={e => setPlano({ ...plano, duracao_dias: e.target.value })} /><input type="number" placeholder="Calorias alvo" value={plano.calorias_alvo} onChange={e => setPlano({ ...plano, calorias_alvo: e.target.value })} /><button className="primario">Criar plano</button></form><div className="jornada-lista">{planos.map(item => <article className="plano" key={item.id}><h3>{item.titulo}</h3><p>{item.descricao}</p><small>{item.duracao_dias || '—'} dias · {item.calorias_alvo || '—'} kcal</small><div><button onClick={() => executar(async () => { const detalhe = await requisicao(`/planos/${item.id}`, { token }); setSelecionado(detalhe); }, 'Detalhes carregados.')}>Detalhes</button><button onClick={() => executar(() => requisicao(`/planos/${item.id}/seguir`, { method: 'POST', token }), 'Plano seguido.')}>Seguir</button><button onClick={() => executar(() => requisicao(`/planos/${item.id}`, { method: 'DELETE', token }).then(carregarPlanos), 'Plano removido.')}>Excluir</button></div>{selecionado?.id === item.id && <div className="detalhe-plano"><p>{selecionado.receitas?.length || 0} receitas · {selecionado.exercicios?.length || 0} exercícios</p><button onClick={() => executar(() => requisicao(`/planos/${item.id}`, { method: 'PUT', token, body: { descricao: `${item.descricao} (atualizado)` } }), 'Plano atualizado.')}>Atualizar descrição</button></div>}</article>)}</div></div>;
}

function GruposJornada({ token, usuario, grupos, executar }) {
  const [grupo, setGrupo] = useState({ nome: '', descricao: '' });
  return <div className="jornada-lista">{['nutricionista', 'admin'].includes(usuario.role) && <form className="mini-form" onSubmit={event => { event.preventDefault(); executar(() => requisicao('/comunidade/grupos', { method: 'POST', token, body: grupo }), 'Grupo criado.'); setGrupo({ nome: '', descricao: '' }); }}><h3>Criar grupo de suporte</h3><input required placeholder="Nome do grupo" value={grupo.nome} onChange={e => setGrupo({ ...grupo, nome: e.target.value })} /><textarea required placeholder="Descrição" value={grupo.descricao} onChange={e => setGrupo({ ...grupo, descricao: e.target.value })} /><button className="primario">Criar grupo</button></form>}<h3>Grupos de suporte</h3>{grupos.map(item => <article className="plano" key={item.id}><h3>{item.nome}</h3><p>{item.descricao}</p><small>{item.membros} participantes</small><button onClick={() => executar(() => requisicao(`/comunidade/grupos/${item.id}/entrar`, { method: 'POST', token }), 'Você entrou no grupo.')}>Participar</button></article>)}</div>;
}

function ContaJornada({ token, usuario, executar }) {
  const [dados, setDados] = useState({ nome_completo: usuario.nome_completo || '', bio: usuario.bio || '', peso_atual: usuario.peso_atual || '', peso_meta: usuario.peso_meta || '', altura: usuario.altura || '' });
  const [numero_crn, setNumeroCrn] = useState(usuario.numero_crn || '');
  return <div className="jornada-grid"><form className="mini-form" onSubmit={event => { event.preventDefault(); executar(() => requisicao('/usuarios/me', { method: 'PUT', token, body: dados }), 'Perfil atualizado.'); }}><h3>Atualizar meu perfil</h3><input required value={dados.nome_completo} onChange={e => setDados({ ...dados, nome_completo: e.target.value })} placeholder="Nome completo" /><textarea value={dados.bio} onChange={e => setDados({ ...dados, bio: e.target.value })} placeholder="Biografia" /><input type="number" step="0.1" value={dados.peso_atual} onChange={e => setDados({ ...dados, peso_atual: e.target.value })} placeholder="Peso atual" /><input type="number" step="0.1" value={dados.peso_meta} onChange={e => setDados({ ...dados, peso_meta: e.target.value })} placeholder="Peso meta" /><input type="number" step="0.1" value={dados.altura} onChange={e => setDados({ ...dados, altura: e.target.value })} placeholder="Altura" /><button className="primario">Salvar perfil</button></form>{usuario.role === 'nutricionista' && <form className="mini-form" onSubmit={event => { event.preventDefault(); executar(() => requisicao('/auth/verificar-nutricionista', { method: 'POST', token, body: { numero_crn, especializacoes: [] } }), 'Solicitação de CRN enviada.'); }}><h3>Verificar CRN</h3><input required value={numero_crn} onChange={e => setNumeroCrn(e.target.value)} placeholder="Número do CRN" /><button className="primario">Enviar para análise</button></form>}<CalendarioPessoal usuario={usuario} /></div>;
}

function AdminPanel({ token, executar }) {
  const [dados, setDados] = useState(null); const [saude, setSaude] = useState(null); const [reportes, setReportes] = useState([]); const [id, setId] = useState('');
  useEffect(() => { requisicao('/admin/dashboard', { token }).then(setDados); requisicao('/admin/metricas/saude', { token }).then(setSaude); requisicao('/admin/moderacao/reportes', { token }).then(setReportes); }, [token]);
  return <div className="jornada-lista"><div className="metricas">{dados && Object.entries(dados).map(([chave, valor]) => <article key={chave}><b>{valor}</b><span>{chave.replaceAll('_', ' ')}</span></article>)}{saude && Object.entries(saude).map(([chave, valor]) => <article key={chave}><b>{valor ?? '—'}</b><span>{chave.replaceAll('_', ' ')}</span></article>)}</div><form className="mini-form" onSubmit={event => { event.preventDefault(); executar(() => requisicao(`/admin/nutricionistas/${id}/verificar`, { method: 'POST', token }), 'Nutricionista verificado.'); }}><h3>Aprovar nutricionista</h3><input required type="number" value={id} onChange={e => setId(e.target.value)} placeholder="ID do nutricionista" /><button className="primario">Aprovar CRN</button></form><form className="mini-form" onSubmit={event => { event.preventDefault(); executar(() => requisicao(`/admin/usuarios/${id}/bloquear`, { method: 'POST', token }), 'Usuário bloqueado.'); }}><h3>Bloquear usuário</h3><input required type="number" value={id} onChange={e => setId(e.target.value)} placeholder="ID do usuário" /><button className="primario">Bloquear</button></form><h3>Reportes pendentes</h3>{reportes.map(reporte => <article className="plano" key={reporte.id}><p>{reporte.tipo}: {reporte.motivo}</p><button onClick={() => executar(() => requisicao(`/admin/moderacao/reportes/${reporte.id}`, { method: 'PUT', token, body: { status: 'resolvido' } }), 'Reporte resolvido.')}>Resolver</button><button onClick={() => executar(() => requisicao(`/admin/moderacao/reportes/${reporte.id}`, { method: 'PUT', token, body: { status: 'rejeitado' } }), 'Reporte rejeitado.')}>Rejeitar</button></article>)}</div>;
}