import { useEffect, useState } from 'react';
import { requisicao, urlDaApi } from '../api';

const Secao = ({ titulo, subtitulo, cor, children }) => (
  <section className="relatorio-secao" style={{ '--secao-cor': cor }}>
    <header className="relatorio-secao-header">
      <span className="relatorio-secao-icon">✦</span>
      <div><h2>{titulo}</h2><p>{subtitulo}</p></div>
    </header>
    {children}
  </section>
);

export default function HistoricoImpressao({ usuario, token, voltar }) {
  const [dados, setDados] = useState({ peso: [], consumo: [], compras: [], medalhas: [], feed: [], posts: [], conversas: [], exercicios: [] });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      try {
        const [peso, consumo, medalhas, feed, posts, conversas] = await Promise.allSettled([
          requisicao('/usuarios/me/peso', { token }),
          requisicao('/usuarios/historico-consumo', { token }),
          requisicao('/usuarios/me/medalhas', { token }),
          requisicao('/feed/infinito?page=1&limit=50', { token }),
          requisicao('/posts?page=1&limit=50', { token }),
          requisicao('/mensagens/conversas', { token }),
        ]);
        const [compras, exercicios] = await Promise.allSettled([
          requisicao('/usuarios/plano-atual', { token }).then(plano => plano.id ? requisicao(`/usuarios/lista-compras?plano_id=${plano.id}`, { token }) : { itens: [] }).catch(() => ({ itens: [] })),
          requisicao('/exercicios?page=1&limit=50', { token }).then(resposta => Promise.all((resposta.itens || []).slice(0, 12).map(item => requisicao(`/exercicios/historico/${item.id}`, { token })))).catch(() => []),
        ]);
        const historicoExercicios = exercicios.status === 'fulfilled'
          ? exercicios.value.flat().filter(Boolean).map(item => ({ ...item, exercicio: item.exercicio || item.nome || 'Exercício' }))
          : [];
        if (!ativo) return;
        setDados({
          peso: peso.status === 'fulfilled' ? peso.value || [] : [],
          consumo: consumo.status === 'fulfilled' ? consumo.value?.dias || [] : [],
          compras: compras.status === 'fulfilled' ? compras.value?.itens || [] : [],
          medalhas: medalhas.status === 'fulfilled' ? medalhas.value?.medalhas || [] : [],
          feed: feed.status === 'fulfilled' ? feed.value?.dados || [] : [],
          posts: posts.status === 'fulfilled' ? posts.value?.posts || [] : [],
          conversas: conversas.status === 'fulfilled' ? conversas.value || [] : [],
          exercicios: historicoExercicios,
        });
      } catch (error) {
        if (ativo) setErro(error.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    };
    carregar();
    return () => { ativo = false; };
  }, [token]);

  const avatar = usuario?.foto_perfil_url ? <img className="relatorio-avatar" src={urlDaApi(usuario.foto_perfil_url)} alt="Foto de perfil" /> : <div className="relatorio-avatar relatorio-avatar-vazia">{(usuario?.nome_completo || 'A').slice(0, 1)}</div>;
  const printReport = () => window.print();

  return (
    <main className="relatorio-impressao">
      <div className="relatorio-toolbar">
        <div><p className="eyebrow">histórico documental</p><h1>Minha jornada Aptus</h1></div>
        <div className="relatorio-botoes">
          <button className="secundario" onClick={voltar}>Voltar ao aplicativo</button>
          <button className="primario" onClick={printReport} disabled={carregando}>Imprimir / Salvar PDF</button>
        </div>
      </div>
      {erro && <p className="erro">Não foi possível carregar todos os registros: {erro}</p>}
      {carregando && <p className="carregando">Montando seu histórico…</p>}
      <article className="relatorio-documento">
        <header className="relatorio-cabeca">
          <div className="relatorio-identificacao">{avatar}<div><span className="relatorio-marca">aptus<span>.</span></span><h2>{usuario?.nome_completo || 'Usuário Aptus'}</h2><p>{usuario?.email || 'Perfil verificado'} · {usuario?.role || 'usuário'}</p></div></div>
          <div className="relatorio-data"><span>Relatório gerado</span><strong>{new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}</strong><small>Documento colorido para apresentação</small></div>
        </header>

        <Secao titulo="Perfil e identidade" subtitulo="Dados pessoais e foto de perfil" cor="#e26c47">
          <div className="relatorio-profile-grid">
            <div><span>Nome</span><strong>{usuario?.nome_completo || '—'}</strong></div>
            <div><span>E-mail</span><strong>{usuario?.email || '—'}</strong></div>
            <div><span>Telefone</span><strong>{usuario?.telefone || 'Não informado'}</strong></div>
            <div><span>CRN</span><strong>{usuario?.numero_crn || 'Não informado'}</strong></div>
            <div><span>Meta de peso</span><strong>{usuario?.peso_meta ? `${usuario.peso_meta} kg` : 'Não definida'}</strong></div>
            <div><span>Cadastro</span><strong>{usuario?.data_cadastro ? new Date(usuario.data_cadastro).toLocaleDateString('pt-BR') : '—'}</strong></div>
          </div>
        </Secao>

        <Secao titulo="Evolução e histórico" subtitulo="Registros de peso e consumo" cor="#34795f">
          <div className="relatorio-tabela-wrap"><table className="relatorio-tabela"><thead><tr><th>Data</th><th>Registro</th><th>Observação</th></tr></thead><tbody>
            {dados.peso.length ? dados.peso.slice().reverse().map(item => <tr key={`${item.data_registro}-${item.peso}`}><td>{new Date(item.data_registro).toLocaleDateString('pt-BR')}</td><td><strong>{item.peso} kg</strong></td><td>{item.notas || 'Evolução registrada'}</td></tr>) : <tr><td colSpan="3">Nenhum registro de peso encontrado.</td></tr>}
          </tbody></table></div>
          <div className="relatorio-resumo-grid"><div><span> Dias registrados</span><strong>{dados.consumo.length}</strong></div><div><span>Calorias totais</span><strong>{dados.consumo.reduce((soma, dia) => soma + Number(dia.calorias || 0), 0).toLocaleString('pt-BR')} kcal</strong></div><div><span>Refeições consumidas</span><strong>{dados.consumo.reduce((soma, dia) => soma + Number(dia.consumidas || 0), 0)}</strong></div></div>
        </Secao>

        <Secao titulo="Plano alimentar e compras" subtitulo="Refeições, ingredientes e passos de organização" cor="#b58441">
          <div className="relatorio-grid-duas">
            <div><h3>Refeições no período</h3>{dados.consumo.length ? dados.consumo.slice().reverse().map(dia => <article className="relatorio-item" key={dia.data}><strong>{new Date(dia.data).toLocaleDateString('pt-BR')}</strong><span>{dia.consumidas} refeições consumidas · {dia.calorias || 0} kcal</span></article>) : <p className="relatorio-vazio">Nenhuma refeição registrada.</p>}</div>
            <div><h3>Ingredientes da compra</h3>{dados.compras.length ? dados.compras.map(item => <article className="relatorio-item" key={`${item.nome}-${item.receita}`}><strong>{item.nome}</strong><span>{item.quantidade} {item.unidade_medida || ''} · {item.receita || 'plano geral'}</span></article>) : <p className="relatorio-vazio">Nenhum ingrediente encontrado.</p>}</div>
          </div>
        </Secao>

        <Secao titulo="Exercícios e sessões" subtitulo="Passos, músculos e histórico de execução" cor="#5c6aa8">
          <div className="relatorio-grid-duas">
            <div><h3>Exercícios disponíveis</h3>{dados.exercicios.length ? dados.exercicios.map(item => <article className="relatorio-item" key={item.exercicio}><strong>{item.exercicio || 'Exercício'}</strong><span>{item.total_sessoes || 0} sessões · {item.series_completadas || 0} séries · {item.completado ? 'concluído' : 'em andamento'}</span></article>) : <p className="relatorio-vazio">Nenhuma sessão registrada.</p>}</div>
            <div><h3>Ações de treino</h3>{dados.exercicios.length ? dados.exercicios.map(item => <article className="relatorio-item" key={`acao-${item.exercicio}`}><strong>Executar passo a passo</strong><span>Aquecer, posicionar, executar, descansar e repetir com segurança.</span></article>) : <p className="relatorio-vazio">Ações de treino ainda não foram registradas.</p>}</div>
          </div>
        </Secao>

        <Secao titulo="Conteúdo e ações da comunidade" subtitulo="Publicações, curtidas, salvamentos e conversas" cor="#277a89">
          <div className="relatorio-grid-duas">
            <div><h3>Publicações</h3>{dados.posts.length ? dados.posts.map(post => <article className="relatorio-item" key={post.id}><strong>{post.autor_nome || 'Usuário'}</strong><span>{post.conteudo.slice(0, 150)}{post.conteudo.length > 150 ? '…' : ''}</span></article>) : <p className="relatorio-vazio">Nenhuma publicação.</p>}</div>
            <div><h3>Conversa e interações</h3>{dados.conversas.length ? dados.conversas.map(conversa => <article className="relatorio-item" key={conversa.id}><strong>{conversa.nome_completo}</strong><span>{conversa.nao_lidas || 0} mensagens não lidas · {conversa.ultima_mensagem ? new Date(conversa.ultima_mensagem).toLocaleDateString('pt-BR') : 'sem histórico'}</span></article>) : <p className="relatorio-vazio">Nenhuma conversa registrada.</p>}</div>
          </div>
          <div className="relatorio-feed"><h3>Conteúdo recente</h3>{dados.feed.length ? dados.feed.map(item => <article className="relatorio-feed-item" key={`${item.tipo}-${item.id}`}><span>{item.tipo === 'receita' ? 'Receita' : 'Exercício'}</span><div><strong>{item.titulo || item.nome}</strong><p>{item.descricao || item.conteudo || 'Conteúdo compartilhado na comunidade.'}</p></div><small>{item.criado_por?.nome || 'Comunidade'}</small></article>) : <p className="relatorio-vazio">Nenhum conteúdo recente.</p>}</div>
        </Secao>

        <Secao titulo="Medalhas e conquistas" subtitulo="Marcas de evolução e desempenho" cor="#a14d75">
          <div className="relatorio-medalhas">{dados.medalhas.length ? dados.medalhas.map(medalha => <article key={medalha.id}><span>{medalha.icone || '★'}</span><div><strong>{medalha.nome}</strong><p>{medalha.descricao}</p><small>{new Date(medalha.conquistada_em).toLocaleDateString('pt-BR')}</small></div></article>) : <p className="relatorio-vazio">Nenhuma medalha conquistada ainda.</p>}</div>
        </Secao>

        <footer className="relatorio-rodape"><span>Aptus · Saúde em comunidade</span><span>Documento gerado pelo histórico do usuário</span></footer>
      </article>
    </main>
  );
}
