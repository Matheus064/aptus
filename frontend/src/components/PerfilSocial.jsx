import { useCallback, useEffect, useState } from 'react';
import { requisicao, urlDaApi } from '../api';
import { useAuth } from '../context/AuthContext';

const Campo = ({ label, ...props }) => <label>{label}<input required {...props} /></label>;

const inicializarForm = usuario => ({
  nome_completo: usuario.nome_completo || '',
  telefone: usuario.telefone || '',
  bio: usuario.bio || '',
  peso_meta: usuario.peso_meta || '',
});

export default function PerfilSocial({ usuario, token, convidado }) {
  const { atualizarUsuario } = useAuth();
  const [historico, setHistorico] = useState([]);
  const [editar, setEditar] = useState(false);
  const [form, setForm] = useState(inicializarForm(usuario));
  const [peso, setPeso] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const especializacoes = Array.isArray(usuario.especializacoes) ? usuario.especializacoes : [];
  const foiVerificado = Boolean(usuario.verificado);

  const carregar = useCallback(async () => {
    if (convidado) { setCarregando(false); return; }
    try {
      const [pesoAtual] = await Promise.all([
        requisicao('/usuarios/me/peso', { token }),
      ]);
      setHistorico(pesoAtual || []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [convidado, token]);

  useEffect(() => { carregar(); }, [carregar]);

  const salvarPerfil = async evento => {
    evento.preventDefault();
    setErro('');
    setSucesso('');
    try {
      const atualizado = await requisicao('/usuarios/me', { method: 'PUT', token, body: form });
      atualizarUsuario(atualizado);
      setEditar(false);
      setSucesso('Perfil atualizado com sucesso.');
    } catch (error) {
      setErro(error.message);
    }
  };

  const registrarPeso = async evento => {
    evento.preventDefault();
    setErro('');
    setSucesso('');
    try {
      await requisicao('/usuarios/me/peso', { method: 'POST', token, body: { peso: Number(peso) } });
      setPeso('');
      setSucesso('Evolução registrada.');
      await carregar();
    } catch (error) {
      setErro(error.message);
    }
  };

  const avatar = usuario.foto_perfil_url ? <img src={urlDaApi(usuario.foto_perfil_url)} alt={usuario.nome_completo} /> : <span>{(usuario.nome_completo || 'A').slice(0, 1).toUpperCase()}</span>;
  const roleLabel = usuario.role === 'nutricionista' ? 'Nutricionista' : usuario.role === 'admin' ? 'Administrador' : 'Usuário Aptus';

  return (
    <section className="pagina perfil-social">
      <div className="profile-hero">
        <div className="profile-cover">
          <span className="profile-orb orb-one" />
          <span className="profile-orb orb-two" />
          <div className="profile-live"><i /> {usuario.role === 'nutricionista' ? 'Perfil profissional' : 'Perfil ativo'}</div>
        </div>
        <div className="profile-layout">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{avatar}</div>
            {usuario.role === 'nutricionista' && <span className="profile-badge">{usuario.numero_crn || 'CRN pendente'}</span>}
          </div>
          <div className="profile-main">
            <div className="profile-heading">
              <div>
                <p className="eyebrow">{roleLabel}</p>
                <h2>{usuario.nome_completo}</h2>
                <p className="profile-handle">@{(usuario.nome_completo || 'aptus').toLowerCase().replace(/\s+/g, '')}</p>
              </div>
              {!convidado && <button className="primario" onClick={() => setEditar(!editar)}>{editar ? 'Cancelar' : 'Editar perfil'}</button>}
            </div>
            <p className="profile-bio">{usuario.bio || 'Construindo uma rotina saudável e consciente, um passo por vez.'}</p>
            <div className="profile-stats">
              <article><strong>{historico.length || 0}</strong><span>registros</span></article>
              <article><strong>{especializacoes.length || 0}</strong><span>especializações</span></article>
              <article><strong>{foiVerificado ? '✓' : '—'}</strong><span>{foiVerificado ? 'verificado' : 'em análise'}</span></article>
            </div>
          </div>
        </div>
      </div>

      {usuario.role === 'nutricionista' && (
        <div className="profile-professional-card">
          <div>
            <span className="chip">perfil profissional</span>
            <h3>Seu espaço de atendimento</h3>
            <p>{usuario.numero_crn ? `Identificação profissional: ${usuario.numero_crn}` : 'Informe seu CRN para habilitar o acesso profissional.'}</p>
          </div>
          <div className="professional-tags">
            {especializacoes.length ? especializacoes.map(especializacao => <span key={especializacao}>{especializacao}</span>) : <span>nutrição personalizada</span>}
          </div>
        </div>
      )}

      {convidado ? (
        <div className="cartao-interativo profile-locked"><h3>Seu espaço pessoal</h3><p>Crie uma conta para salvar seu progresso, conversar e acompanhar planos.</p></div>
      ) : (
        <>
          <div className="profile-grid">
            <article className="profile-card profile-card-main">
              <div className="card-title"><div><p className="eyebrow">sobre</p><h3>Minha experiência</h3></div><span className="pulse-dot" /></div>
              <p>{usuario.bio || 'Ainda não há uma descrição.'}</p>
              <dl><div><dt>Telefone</dt><dd>{usuario.telefone || 'Não informado'}</dd></div><div><dt>Meta de peso</dt><dd>{usuario.peso_meta ? `${usuario.peso_meta} kg` : 'Não definida'}</dd></div><div><dt>Cadastro</dt><dd>{usuario.data_cadastro ? new Date(usuario.data_cadastro).toLocaleDateString('pt-BR') : '—'}</dd></div></dl>
            </article>

            <article className="profile-card profile-card-acompanhamento">
              <div className="card-title"><div><p className="eyebrow">evolução</p><h3>Acompanhe seu progresso</h3></div><span className="mini-icon">↗</span></div>
              <form className="mini-form" onSubmit={registrarPeso}>
                <label> Peso atual <input type="number" min="1" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} placeholder="kg" required /></label>
                <button className="primario">Registrar</button>
              </form>
              <div className="history-list">
                {carregando ? <p>Carregando…</p> : historico.length ? historico.slice(-3).reverse().map((item, indice) => <div key={`${item.data_registro}-${indice}`}><span>{new Date(item.data_registro).toLocaleDateString('pt-BR')}</span><strong>{item.peso} kg</strong></div>) : <p className="vazio">Seu histórico ainda está sendo preparado.</p>}
              </div>
            </article>
          </div>

          {editar && (
            <form className="mini-form profile-edit-card" onSubmit={salvarPerfil}>
              <div className="card-title"><div><p className="eyebrow">editar</p><h3>Dados do perfil</h3></div></div>
              <div className="form-grid"><Campo label="Nome completo" value={form.nome_completo} onChange={e => setForm(atual => ({ ...atual, nome_completo: e.target.value }))} /><Campo label="Telefone" value={form.telefone} onChange={e => setForm(atual => ({ ...atual, telefone: e.target.value }))} /><label>Sobre você<textarea value={form.bio} onChange={e => setForm(atual => ({ ...atual, bio: e.target.value }))} /></label><Campo label="Meta de peso (kg)" type="number" min="1" step="0.1" value={form.peso_meta} onChange={e => setForm(atual => ({ ...atual, peso_meta: e.target.value }))} /></div>
              <button className="primario">Salvar perfil</button>
            </form>
          )}
        </>
      )}

      {erro && <p className="erro" role="alert">{erro}</p>}
      {sucesso && <p className="sucesso" role="status">{sucesso}</p>}
    </section>
  );
}
