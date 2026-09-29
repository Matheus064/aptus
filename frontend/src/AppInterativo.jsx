import { useCallback, useEffect, useState } from 'react';
import { modoDemo, requisicao, urlDaApi } from './api';
import { useAuth } from './context/AuthContext';
import Medalhas from './components/Medalhas';
import ExerciciosPage from './components/ExerciciosPage';
import AlimentacaoPage from './components/AlimentacaoPage';
import JornadaPage from './components/JornadaPage';
import './interacoes.css';
import './auth-carousel.css';
import './perfil.css';
import './demo.css';
import './compatibilidade.css';

const abas = [
  ['feed', '⌂', 'Início'], ['descobrir', '⌕', 'Descobrir'], ['planos', '◫', 'Planos'], ['jornada', '✦', 'Jornada'],
  ['exercicios', '⚡', 'Exercícios'], ['mensagens', '✉', 'Mensagens'], ['perfil', '◉', 'Perfil'],
];
const abaInicial = () => abas.some(([id]) => id === location.hash.slice(1)) ? location.hash.slice(1) : 'feed';

function Campo({ label, ...props }) {
  return <label>{label}<input required {...props} /></label>;
}

function Aviso({ erro, sucesso }) {
  if (!erro && !sucesso) return null;
  return <p className={erro ? 'erro' : 'sucesso'} role="status">{erro || sucesso}</p>;
}

function Acesso() {
  const { login, registro, entrarComoConvidado } = useAuth();
  const [novo, setNovo] = useState(false);
  const [modo, setModo] = useState(modoDemo ? 'guest' : 'user');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [dados, setDados] = useState({ nome_completo: '', email: '', senha: '', role: 'user', numero_crn: '' });
  const atualizar = (campo, valor) => setDados(atual => ({ ...atual, [campo]: valor }));

  const enviar = async evento => {
    evento.preventDefault(); setErro(''); setEnviando(true);
    try {
      if (novo) await registro(dados);
      else if (modo === 'guest') await entrarComoConvidado();
      else await login(dados.email, dados.senha, modo);
    } catch (error) { setErro(error.message); }
    finally { setEnviando(false); }
  };

  return <main className="auth"><section className="hero"><span className="marca">aptus<span>.</span></span><p className="eyebrow">saúde em comunidade</p><h1>Seu bem-estar<br />em movimento.</h1><p>Planos reais, profissionais próximos e uma comunidade que celebra cada passo.</p><div className="pontos">✓ Hábitos sustentáveis<br />✓ Conteúdo profissional<br />✓ Sem julgamentos</div></section><section className="acesso"><p className="eyebrow">{novo ? 'crie seu espaço' : 'bem-vindo de volta'}</p><h2>{novo ? 'Comece sua jornada' : 'Entre no Aptus'}</h2>{modoDemo && <p className="demo-aviso" role="status">Prévia pública disponível agora. Entre como convidado para explorar; a API de contas ainda não está ligada.</p>}{!novo && <div className="papel"><button type="button" className={modo === 'user' ? 'ativo' : ''} onClick={() => setModo('user')}>Usuário</button><button type="button" className={modo === 'guest' ? 'ativo' : ''} onClick={() => setModo('guest')}>Convidado</button><button type="button" className={modo === 'nutricionista' ? 'ativo' : ''} onClick={() => setModo('nutricionista')}>Nutricionista</button></div>}<form onSubmit={enviar}>{novo && <><Campo label="Nome completo" value={dados.nome_completo} onChange={e => atualizar('nome_completo', e.target.value)} /><Campo label="E-mail" type="email" value={dados.email} onChange={e => atualizar('email', e.target.value)} /><Campo label="Senha (mínimo 8 caracteres)" type="password" minLength="8" value={dados.senha} onChange={e => atualizar('senha', e.target.value)} /><div className="papel"><button type="button" className={dados.role === 'user' ? 'ativo' : ''} onClick={() => atualizar('role', 'user')}>Quero cuidar de mim</button><button type="button" className={dados.role === 'nutricionista' ? 'ativo' : ''} onClick={() => atualizar('role', 'nutricionista')}>Sou nutricionista</button></div>{dados.role === 'nutricionista' && <Campo label="Número do CRN" value={dados.numero_crn} onChange={e => atualizar('numero_crn', e.target.value)} />}</>}{!novo && modo !== 'guest' && <><Campo label="E-mail" type="email" value={dados.email} onChange={e => atualizar('email', e.target.value)} /><Campo label="Senha" type="password" value={dados.senha} onChange={e => atualizar('senha', e.target.value)} /></>}<Aviso erro={erro} /><button className="primario" disabled={enviando}>{enviando ? 'Aguarde…' : novo ? 'Criar conta' : modo === 'guest' ? 'Continuar como convidado' : 'Entrar'}</button></form><button className="texto" onClick={() => { setNovo(!novo); setErro(''); }}>{novo ? 'Já tenho uma conta' : 'Ainda não tenho uma conta'}</button></section></main>;
}

function Feed({ token, convidado, navegar }) {
  const [conteudos, setConteudos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [texto, setTexto] = useState('');
  const [comentarios, setComentarios] = useState({});
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const carregar = useCallback(async () => {
    setErro('');
    try {
      const [feed, publicacoes] = await Promise.all([
        requisicao('/feed/infinito?page=1&limit=20', { token }),
        requisicao('/posts?page=1&limit=20', { token }),
      ]);
      setConteudos(feed.dados || []); setPosts(publicacoes.posts || []);
    } catch (error) { setErro(error.message); }
  }, [token]);
  useEffect(() => { carregar(); }, [carregar]);

  const publicar = async evento => {
    evento.preventDefault(); setErro(''); setSucesso('');
    try { await requisicao('/posts', { method: 'POST', token, body: { conteudo: texto, tipo: 'motivacao' } }); setTexto(''); setSucesso('Publicação compartilhada.'); await carregar(); }
    catch (error) { setErro(error.message); }
  };
  const curtir = async post => {
    if (convidado) { setErro('Entre ou crie uma conta para curtir publicações.'); return; }
    try { await requisicao(`/posts/${post.id}/curtir`, { method: post.curtido_por_usuario ? 'DELETE' : 'POST', token }); await carregar(); }
    catch (error) { setErro(error.message); }
  };
  const comentar = async (evento, post) => {
    evento.preventDefault(); const conteudo = comentarios[post.id]?.trim(); if (!conteudo) return;
    if (convidado) { setErro('Entre ou crie uma conta para comentar.'); return; }
    try { await requisicao(`/posts/${post.id}/comentarios`, { method: 'POST', token, body: { conteudo } }); setComentarios(atual => ({ ...atual, [post.id]: '' })); setSucesso('Comentário enviado.'); await carregar(); }
    catch (error) { setErro(error.message); }
  };
  const acaoConteudo = async (item, acao) => {
    if (convidado) { setErro('Entre ou crie uma conta para interagir com o conteúdo.'); return; }
    const salvo = acao === 'salvar' ? item.salvo_por_usuario : item.curtido_por_usuario;
    try {
      await requisicao(`/${item.tipo === 'receita' ? 'receitas' : 'exercicios'}/${item.id}/${acao === 'salvar' ? 'salvar' : 'curtir'}`, { method: salvo ? 'DELETE' : 'POST', token });
      await carregar();
    } catch (error) { setErro(error.message); }
  };

  return <section className="pagina"><div className="titulo"><div><p className="eyebrow">para você</p><h2>Inspiração para hoje</h2></div><button className="primario" onClick={() => navegar('descobrir')}>Explorar conteúdo</button></div><Aviso erro={erro} sucesso={sucesso} />{!convidado && <form className="mini-form" onSubmit={publicar}><label htmlFor="nova-publicacao">Compartilhe uma conquista ou incentivo</label><textarea id="nova-publicacao" value={texto} onChange={e => setTexto(e.target.value)} maxLength="500" placeholder="Cada pequeno passo conta…" required /><button className="primario">Publicar</button></form>}<h3>Comunidade</h3>{posts.length ? posts.map(post => <article className="cartao-interativo" key={`post-${post.id}`}><p className="eyebrow">{post.autor_nome} · {post.tipo}</p><p>{post.conteudo}</p><div className="acoes-card"><button onClick={() => curtir(post)}>{post.curtido_por_usuario ? '♥ Curtido' : '♡ Curtir'} · {post.curtidas}</button><span>{post.comentarios} comentários</span></div><form className="linha-form" onSubmit={e => comentar(e, post)}><input aria-label="Escreva um comentário" placeholder="Escreva um comentário…" value={comentarios[post.id] || ''} onChange={e => setComentarios(atual => ({ ...atual, [post.id]: e.target.value }))} required /><button className="primario">Enviar</button></form></article>) : <p className="vazio">Ainda não há publicações. Seja a primeira pessoa a compartilhar.</p>}<h3>Receitas e exercícios recentes</h3><div className="cartoes-grade">{conteudos.map(item => <article className="cartao-interativo" key={`${item.tipo}-${item.id}`}><span className="chip">{item.tipo}</span><h3>{item.titulo || item.nome}</h3><p>{item.descricao}</p><small>{item.criado_por?.nome || 'Comunidade'} · {item.curtidas || 0} curtidas</small><div className="acoes-card"><button onClick={() => acaoConteudo(item, 'curtir')}>{item.curtido_por_usuario ? '♥ Curtido' : '♡ Curtir'}</button><button onClick={() => acaoConteudo(item, 'salvar')}>{item.salvo_por_usuario ? 'Salvo ✓' : '☆ Salvar'}</button><button onClick={() => navegar(item.tipo === 'receita' ? 'planos' : 'exercicios')}>Ver detalhes</button></div></article>)}</div>{!conteudos.length && <p className="vazio">Ainda não há conteúdo; descubra receitas e exercícios.</p>}</section>;
}

function Descobrir({ navegar }) {
  const [tipo, setTipo] = useState('receitas'); const [filtro, setFiltro] = useState(''); const [busca, setBusca] = useState('');
  const [itens, setItens] = useState([]); const [erro, setErro] = useState(''); const [carregando, setCarregando] = useState(false);
  useEffect(() => {
    let ativo = true; setCarregando(true); setErro('');
    requisicao(`/discover?tipo=${tipo}&page=1&limit=50${filtro ? `&${tipo === 'receitas' ? 'categoria' : 'musculo'}=${encodeURIComponent(filtro)}` : ''}`)
      .then(resposta => { if (ativo) setItens(resposta.itens || []); }).catch(error => { if (ativo) setErro(error.message); }).finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tipo, filtro]);
  const opcoes = tipo === 'receitas' ? ['café da manhã', 'lanche', 'almoço', 'jantar', 'sobremesa'] : ['peito', 'costas', 'braço', 'perna', 'glúteo', 'core', 'ombro'];
  const filtrados = itens.filter(item => `${item.titulo || item.nome || ''} ${item.descricao || ''}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR')));
  return <section className="pagina"><p className="eyebrow">explore</p><h2>Descubra algo novo</h2><label className="busca-label">Buscar conteúdo<input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Digite uma receita ou exercício" /></label><div className="tags"><button className={tipo === 'receitas' ? 'selecionado' : ''} onClick={() => { setTipo('receitas'); setFiltro(''); }}>Receitas</button><button className={tipo === 'exercicios' ? 'selecionado' : ''} onClick={() => { setTipo('exercicios'); setFiltro(''); }}>Exercícios</button>{opcoes.map(opcao => <button className={filtro === opcao ? 'selecionado' : ''} key={opcao} onClick={() => setFiltro(filtro === opcao ? '' : opcao)}>{opcao}</button>)}</div><Aviso erro={erro} />{carregando && <p>Carregando conteúdo…</p>}<div className="cartoes-grade">{filtrados.map(item => <article className="cartao-interativo" key={item.id}><span className="chip">{tipo === 'receitas' ? item.categoria || 'receita' : 'exercício'}</span><h3>{item.titulo || item.nome}</h3><p>{item.descricao}</p><small>{item.autor_nome || 'Aptus'} · {item.calorias ? `${item.calorias} kcal` : `${item.curtidas || 0} curtidas`}</small>{tipo === 'receitas' && <button className="primario" onClick={() => navegar('planos', item)}>Adicionar ao planejamento</button>}{tipo === 'exercicios' && <button className="primario" onClick={() => navegar('exercicios')}>Abrir exercício</button>}</article>)}</div>{!carregando && !filtrados.length && <p className="vazio">Nenhum resultado. Tente outra busca ou filtro.</p>}</section>;
}

function Planos({ token, convidado, receitaInicial, aoAdicionarReceita }) {
  const [planos, setPlanos] = useState([]); const [atual, setAtual] = useState(null); const [erro, setErro] = useState(''); const [sucesso, setSucesso] = useState('');
  const carregar = useCallback(async () => {
    setErro('');
    try { const lista = await requisicao('/planos'); setPlanos(lista); if (!convidado) { try { setAtual(await requisicao('/usuarios/plano-atual', { token })); } catch { setAtual(null); } } }
    catch (error) { setErro(error.message); }
  }, [token, convidado]);
  useEffect(() => { carregar(); }, [carregar]);
  const seguir = async plano => {
    setErro(''); setSucesso('');
    try { const resultado = await requisicao(`/planos/${plano.id}/seguir`, { method: 'POST', token }); setSucesso(resultado.seguindo ? `Você começou a seguir “${plano.titulo}”.` : 'Plano removido da sua rotina.'); await carregar(); }
    catch (error) { setErro(error.message); }
  };
  return <section className="pagina"><AlimentacaoPage token={token} convidado={convidado} receitaInicial={receitaInicial} aoAdicionarReceita={aoAdicionarReceita} /><div className="titulo"><div><p className="eyebrow">sua rotina</p><h2>Planos para seguir</h2></div></div><Aviso erro={erro} sucesso={sucesso} />{atual && <article className="plano-atual"><div><p className="eyebrow">plano ativo · dia {atual.dia_atual}</p><h3>{atual.titulo}</h3><p>{atual.progresso_percentual}% de progresso · {atual.dias_completos} dias registrados</p></div><progress value={atual.progresso_percentual || 0} max="100" /></article>}<div className="cartoes-grade">{planos.map(plano => <article className="cartao-interativo" key={plano.id}><span className="chip">{plano.tipo || 'público'}</span><h3>{plano.titulo}</h3><p>{plano.descricao}</p><small>{plano.duracao_dias || '—'} dias · {plano.calorias_alvo || '—'} kcal/dia · {plano.autor_nome}</small>{!convidado && <button className="primario" onClick={() => seguir(plano)}>{atual?.id === plano.id ? 'Deixar de seguir' : 'Seguir plano'}</button>}</article>)}</div>{!planos.length && <p className="vazio">Ainda não há planos publicados.</p>}</section>;
}

function Mensagens({ token, convidado = false }) {
  const [conversas, setConversas] = useState([]); const [selecionada, setSelecionada] = useState(null); const [mensagens, setMensagens] = useState([]);
  const [nova, setNova] = useState(false); const [destinatario, setDestinatario] = useState(''); const [texto, setTexto] = useState(''); const [erro, setErro] = useState(''); const [sucesso, setSucesso] = useState('');
  const carregar = useCallback(async () => {
    try {
      const resposta = await requisicao('/mensagens/conversas', { token });
      if (!Array.isArray(resposta)) throw new Error('A API retornou uma lista de conversas inválida.');
      setConversas(resposta);
    } catch (error) { setErro(error.message); setConversas([]); }
  }, [token]);
  const abrir = async conversa => { setErro(''); setSelecionada(conversa); try { setMensagens(await requisicao(`/mensagens/conversa/${conversa.id}`, { token })); await carregar(); } catch (error) { setErro(error.message); } };
  useEffect(() => { carregar(); }, [carregar]);
  const enviar = async evento => {
    evento.preventDefault(); setErro(''); setSucesso('');
    try {
      const id = Number(selecionada?.id || destinatario); if (!id) throw new Error('Informe o ID numérico da pessoa destinatária.');
      await requisicao('/mensagens', { method: 'POST', token, body: { destinatario_id: id, conteudo: texto } }); setTexto(''); setNova(false);
      if (selecionada) await abrir(selecionada); else setSucesso('Mensagem enviada.'); await carregar();
    } catch (error) { setErro(error.message); }
  };
  return <section className="pagina"><div className="titulo"><div><p className="eyebrow">conexões</p><h2>Mensagens</h2></div><button className="primario" disabled={convidado} onClick={() => { setSelecionada(null); setNova(!nova); }}>Nova conversa</button></div>{convidado && <p className="vazio">Crie uma conta para iniciar conversas privadas.</p>}<Aviso erro={erro} sucesso={sucesso} />{nova && <form className="mini-form" onSubmit={enviar}><Campo label="ID da pessoa" type="number" min="1" value={destinatario} onChange={e => setDestinatario(e.target.value)} /><label>Mensagem<input value={texto} onChange={e => setTexto(e.target.value)} required /></label><button className="primario">Enviar</button></form>}<div className="mensagens-layout"><div className="conversas">{conversas.map(conversa => <button className={`conversa-item ${selecionada?.id === conversa.id ? 'ativa' : ''}`} key={conversa.id} onClick={() => abrir(conversa)}><span><b>{conversa.nome_completo}</b><small>{conversa.ultima_mensagem ? new Date(conversa.ultima_mensagem).toLocaleString('pt-BR') : 'Abrir conversa'}</small></span>{conversa.nao_lidas > 0 && <em>{conversa.nao_lidas}</em>}</button>)}{!conversas.length && <p className="vazio">Nenhuma conversa ainda. Inicie uma conversa informando o ID da pessoa.</p>}</div>{selecionada && <div className="painel-conversa"><h3>Conversa com {selecionada.nome_completo}</h3><div className="mensagens-lista">{mensagens.map(mensagem => <article className={Number(mensagem.remetente_id) === Number(selecionada.id) ? 'mensagem recebida' : 'mensagem enviada'} key={mensagem.id}><small>{mensagem.remetente_nome || (Number(mensagem.remetente_id) === Number(selecionada.id) ? selecionada.nome_completo : 'Você')}</small><p>{mensagem.conteudo}</p><time>{new Date(mensagem.data_criacao).toLocaleString('pt-BR')}</time></article>)}{!mensagens.length && <p className="vazio">Diga olá para começar a conversa.</p>}</div><form className="linha-form" onSubmit={enviar}><input aria-label="Sua mensagem" value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escreva uma mensagem…" required /><button className="primario">Enviar</button></form></div>}</div></section>;
}

function Notificacoes({ token, fechar }) {
  const [itens, setItens] = useState([]); const [erro, setErro] = useState('');
  useEffect(() => { requisicao('/notificacoes', { token }).then(setItens).catch(error => setErro(error.message)); }, [token]);
  const marcarLida = async id => { try { await requisicao(`/notificacoes/${id}/lida`, { method: 'PUT', token }); setItens(atual => atual.map(item => item.id === id ? { ...item, lido: 1 } : item)); } catch (error) { setErro(error.message); } };
  return <div className="notificacoes-popover"><div className="titulo"><h3>Notificações</h3><button onClick={fechar}>Fechar</button></div><Aviso erro={erro} />{itens.length ? itens.map(item => <article className={item.lido ? 'notificacao lida' : 'notificacao'} key={item.id}><b>{item.titulo}</b><p>{item.conteudo}</p><small>{new Date(item.data_criacao).toLocaleString('pt-BR')}</small>{!item.lido && <button onClick={() => marcarLida(item.id)}>Marcar como lida</button>}</article>) : <p className="vazio">Você está em dia.</p>}</div>;
}

function CriarConteudo({ token }) {
  const [tipo, setTipo] = useState('receita'); const [resultado, setResultado] = useState(''); const [erro, setErro] = useState(''); const [enviando, setEnviando] = useState(false);
  const [dados, setDados] = useState({ titulo: '', descricao: '', modo_preparo: '', nome: '', tecnica: '', duracao_dias: 7, calorias_alvo: '' });
  const campo = (chave, valor) => setDados(atual => ({ ...atual, [chave]: valor }));
  const enviar = async evento => {
    evento.preventDefault(); setErro(''); setResultado(''); setEnviando(true);
    const endpoint = tipo === 'plano' ? '/planos' : `/${tipo === 'receita' ? 'receitas' : 'exercicios'}`;
    const corpo = tipo === 'receita' ? { titulo: dados.titulo, descricao: dados.descricao, modo_preparo: dados.modo_preparo }
      : tipo === 'exercicio' ? { nome: dados.nome, descricao: dados.descricao, tecnica: dados.tecnica }
        : { titulo: dados.titulo, descricao: dados.descricao, duracao_dias: Number(dados.duracao_dias), calorias_alvo: Number(dados.calorias_alvo) || null, tipo: 'público' };
    try { await requisicao(endpoint, { method: 'POST', token, body: corpo }); setResultado('Publicado com sucesso.'); setDados({ titulo: '', descricao: '', modo_preparo: '', nome: '', tecnica: '', duracao_dias: 7, calorias_alvo: '' }); }
    catch (error) { setErro(error.message); } finally { setEnviando(false); }
  };
  return <form className="mini-form" onSubmit={enviar}><div className="papel"><button type="button" className={tipo === 'receita' ? 'ativo' : ''} onClick={() => setTipo('receita')}>Receita</button><button type="button" className={tipo === 'exercicio' ? 'ativo' : ''} onClick={() => setTipo('exercicio')}>Exercício</button><button type="button" className={tipo === 'plano' ? 'ativo' : ''} onClick={() => setTipo('plano')}>Plano</button></div>{tipo === 'receita' ? <><Campo label="Título" value={dados.titulo} onChange={e => campo('titulo', e.target.value)} /><Campo label="Descrição" value={dados.descricao} onChange={e => campo('descricao', e.target.value)} /><label>Modo de preparo<textarea required value={dados.modo_preparo} onChange={e => campo('modo_preparo', e.target.value)} /></label></> : tipo === 'exercicio' ? <><Campo label="Nome" value={dados.nome} onChange={e => campo('nome', e.target.value)} /><Campo label="Descrição" value={dados.descricao} onChange={e => campo('descricao', e.target.value)} /><label>Técnica<textarea required value={dados.tecnica} onChange={e => campo('tecnica', e.target.value)} /></label></> : <><Campo label="Título do plano" value={dados.titulo} onChange={e => campo('titulo', e.target.value)} /><label>Descrição<textarea required value={dados.descricao} onChange={e => campo('descricao', e.target.value)} /></label><Campo label="Duração (dias)" type="number" min="1" max="365" value={dados.duracao_dias} onChange={e => campo('duracao_dias', e.target.value)} /><Campo label="Calorias diárias" type="number" min="1" value={dados.calorias_alvo} onChange={e => campo('calorias_alvo', e.target.value)} /></>}<Aviso erro={erro} sucesso={resultado} /><button className="primario" disabled={enviando}>{enviando ? 'Publicando…' : 'Publicar conteúdo'}</button></form>;
}

function FotoPerfil({ usuario, token, convidado }) {
  const { atualizarUsuario } = useAuth();
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const enviarFoto = async evento => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) { setErro('Escolha um arquivo de imagem.'); return; }
    if (arquivo.size > 10 * 1024 * 1024) { setErro('A imagem deve ter até 10 MB.'); return; }

    setErro(''); setSucesso(''); setSalvando(true);
    try {
      let imagem;
      if (typeof createImageBitmap === 'function') imagem = await createImageBitmap(arquivo);
      else {
        imagem = await new Promise((resolve, reject) => {
          const leitor = new FileReader();
          leitor.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
          leitor.onload = () => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Formato de imagem não suportado.'));
            img.src = leitor.result;
          };
          leitor.readAsDataURL(arquivo);
        });
      }
      const escala = Math.min(1, 640 / Math.max(imagem.width, imagem.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(imagem.width * escala); canvas.height = Math.round(imagem.height * escala);
      const contexto = canvas.getContext('2d');
      if (!contexto) throw new Error('Este navegador não conseguiu processar a imagem.');
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
      imagem.close?.();
      const foto = canvas.toDataURL('image/jpeg', 0.82);
      const atualizado = await requisicao('/usuarios/me', { method: 'PUT', token, body: { foto_perfil_url: foto } });
      atualizarUsuario(atualizado); setSucesso('Foto de perfil atualizada.');
    } catch (error) { setErro(error.message || 'Não foi possível salvar esta imagem.'); }
    finally { setSalvando(false); }
  };

  return <div className="foto-perfil-area">{usuario.foto_perfil_url ? <img className="avatar grande perfil-foto" src={urlDaApi(usuario.foto_perfil_url)} alt={`Foto de ${usuario.nome_completo}`} /> : <i className="avatar grande a1" aria-hidden="true" />}{!convidado && <label className="foto-perfil-escolher">{salvando ? 'Salvando foto…' : 'Escolher foto'}<input type="file" accept="image/*" onChange={enviarFoto} disabled={salvando} /></label>}<Aviso erro={erro} sucesso={sucesso} /></div>;
}

function Perfil({ usuario, token, convidado }) {
  const { atualizarUsuario } = useAuth();
  const [historico, setHistorico] = useState([]); const [admin, setAdmin] = useState(null); const [editar, setEditar] = useState(false); const [criar, setCriar] = useState(false);
  const [erro, setErro] = useState(''); const [sucesso, setSucesso] = useState(''); const [peso, setPeso] = useState(''); const [form, setForm] = useState({ nome_completo: usuario.nome_completo || '', telefone: usuario.telefone || '', bio: usuario.bio || '', peso_meta: usuario.peso_meta || '' });
  const carregar = useCallback(async () => { if (convidado) return; try { if (usuario.role === 'admin') setAdmin(await requisicao('/admin/dashboard', { token })); if (usuario.role === 'user') setHistorico(await requisicao('/usuarios/me/peso', { token })); } catch (error) { setErro(error.message); } }, [token, usuario.role, convidado]);
  useEffect(() => { carregar(); }, [carregar]);
  const salvarPerfil = async evento => { evento.preventDefault(); setErro(''); try { atualizarUsuario(await requisicao('/usuarios/me', { method: 'PUT', token, body: form })); setSucesso('Perfil atualizado.'); setEditar(false); } catch (error) { setErro(error.message); } };
  const registrarPeso = async evento => { evento.preventDefault(); setErro(''); try { await requisicao('/usuarios/me/peso', { method: 'POST', token, body: { peso: Number(peso) } }); setHistorico(await requisicao('/usuarios/me/peso', { token })); setPeso(''); setSucesso('Evolução registrada.'); } catch (error) { setErro(error.message); } };
  return <section className="pagina"><div className="perfil-topo"><FotoPerfil usuario={usuario} token={token} convidado={convidado} /><div><p className="eyebrow">{usuario.role}</p><h2>{usuario.nome_completo}</h2><p>{usuario.bio || 'Construindo hábitos melhores, um dia por vez.'}</p></div></div><Aviso erro={erro} sucesso={sucesso} />{convidado ? <div className="cartao-interativo"><h3>Seu espaço pessoal</h3><p>Crie uma conta para salvar seu progresso, conversar e acompanhar planos.</p></div> : <><button className="primario" onClick={() => setEditar(!editar)}>{editar ? 'Cancelar edição' : 'Editar perfil'}</button>{editar && <form className="mini-form" onSubmit={salvarPerfil}><Campo label="Nome completo" value={form.nome_completo} onChange={e => setForm(atual => ({ ...atual, nome_completo: e.target.value }))} /><Campo label="Telefone" value={form.telefone} onChange={e => setForm(atual => ({ ...atual, telefone: e.target.value }))} /><label>Sobre você<textarea value={form.bio} onChange={e => setForm(atual => ({ ...atual, bio: e.target.value }))} /></label><Campo label="Meta de peso (kg)" type="number" min="1" step="0.1" value={form.peso_meta} onChange={e => setForm(atual => ({ ...atual, peso_meta: e.target.value }))} /><button className="primario">Salvar perfil</button></form>}{usuario.role === 'admin' && <div className="metricas">{admin && Object.entries(admin).map(([chave, valor]) => <article key={chave}><b>{valor}</b><span>{chave.replaceAll('_', ' ')}</span></article>)}</div>}{usuario.role === 'user' && <><form className="peso" onSubmit={registrarPeso}><h3>Registrar evolução</h3><input aria-label="Peso atual" type="number" min="1" step="0.1" placeholder="Peso de hoje (kg)" value={peso} onChange={e => setPeso(e.target.value)} required /><button className="primario">Adicionar</button></form><div className="evolucao"><h3>Seu histórico</h3>{historico.length ? [...historico].reverse().map((item, indice) => <div key={`${item.data_registro}-${indice}`}><b>{item.peso} kg</b><span>{new Date(item.data_registro).toLocaleDateString('pt-BR')}</span></div>) : <p>Acompanhe sua evolução sem pressão.</p>}</div></>}{['nutricionista', 'admin'].includes(usuario.role) && <div className="profissional"><h3>Seu espaço profissional</h3><p>Crie receitas, exercícios e planos para sua comunidade.</p><button className="primario" onClick={() => setCriar(!criar)}>{criar ? 'Fechar' : 'Criar conteúdo'}</button>{criar && <CriarConteudo token={token} />}</div>}</>}<Medalhas token={token} convidado={convidado} /></section>;
}

function Aplicativo() {
  const { usuario, token, logout } = useAuth(); const [aba, setAba] = useState(abaInicial); const [notificacoes, setNotificacoes] = useState(false); const [naoLidas, setNaoLidas] = useState(0); const [receitaInicial, setReceitaInicial] = useState(null);
  const limparReceitaInicial = useCallback(() => setReceitaInicial(null), []);
  const navegar = (id, receita = null) => { if (receita) setReceitaInicial(receita); setAba(id); if (id !== aba) history.pushState(null, '', `#${id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  useEffect(() => { const sincronizar = () => setAba(abaInicial()); window.addEventListener('hashchange', sincronizar); window.addEventListener('popstate', sincronizar); return () => { window.removeEventListener('hashchange', sincronizar); window.removeEventListener('popstate', sincronizar); }; }, []);
  useEffect(() => { if (usuario.role === 'guest') return; requisicao('/notificacoes', { token }).then(lista => setNaoLidas(lista.filter(item => !item.lido).length)).catch(() => {}); }, [token, usuario.role, notificacoes]);
  const sair = async () => { try { if (token) await requisicao('/auth/logout', { method: 'POST', token }); } catch { /* A limpeza local continua disponível se a API estiver offline. */ } finally { logout(); } };
  const telas = {
    feed: <Feed token={token} convidado={usuario.role === 'guest'} navegar={navegar} />,
    descobrir: <Descobrir navegar={navegar} />,
    planos: <Planos token={token} convidado={usuario.role === 'guest'} receitaInicial={receitaInicial} aoAdicionarReceita={limparReceitaInicial} />,
    jornada: <JornadaPage token={token} usuario={usuario} />,
    exercicios: <ExerciciosPage token={token} convidado={usuario.role === 'guest'} />,
    mensagens: <Mensagens token={token} convidado={usuario.role === 'guest'} />,
    perfil: <Perfil usuario={usuario} token={token} convidado={usuario.role === 'guest'} />,
  };
  const abasVisiveis = abas.filter(([id]) => !(modoDemo && id === 'jornada'));
  return <main className="app"><header className="topo"><button className="marca marca-botao" onClick={() => navegar('feed')}>aptus<span>.</span></button><div className="topo-acoes"><button className="sair botao-notificacoes" onClick={() => setNotificacoes(!notificacoes)} aria-expanded={notificacoes}>Notificações{naoLidas > 0 && <span className="badge-notificacoes">{naoLidas}</span>}</button><button className="sair" onClick={sair}>Sair</button></div></header>{modoDemo && <p className="demo-aviso app-demo-aviso" role="status">Modo demonstração: navegação e receitas disponíveis. A API está fora do ar; alterações não serão salvas.</p>}{notificacoes && <Notificacoes token={token} fechar={() => setNotificacoes(false)} />}<div key={aba}>{telas[aba] || telas.feed}</div><nav className="menu" aria-label="Navegação principal">{abasVisiveis.map(([id, icone, rotulo]) => <button aria-current={aba === id ? 'page' : undefined} aria-label={rotulo} className={aba === id ? 'selecionado' : ''} onClick={() => navegar(id)} key={id}><b>{icone}</b><span>{rotulo}</span></button>)}</nav></main>;
}

export default function AppInterativo() {
  const { usuario } = useAuth();
  return usuario ? <Aplicativo /> : <Acesso />;
}
