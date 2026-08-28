import { useEffect, useState } from 'react';
import { requisicao } from '../api';
import './medalhas.css';

export default function Medalhas({ token, convidado = false }) {
  const [resumo, setResumo] = useState(null);
  useEffect(() => { if (!convidado) requisicao('/usuarios/me/medalhas', { token }).then(setResumo).catch(() => setResumo({ pontos: 0, medalhas: [] })); }, [token, convidado]);
  if (convidado) return <div className="medalhas-card"><h3>Medalhas</h3><p>Crie uma conta para registrar seu desempenho e conquistar medalhas.</p></div>;
  return <div className="medalhas-card"><div className="medalhas-heading"><div><p className="eyebrow">seu desempenho</p><h3>Medalhas</h3></div><strong>{resumo?.pontos || 0} pts</strong></div><div className="medalhas-list">{resumo?.medalhas?.length ? resumo.medalhas.map(medalha => <article key={medalha.id}><span>{medalha.icone}</span><div><b>{medalha.nome}</b><small>{medalha.descricao}</small></div></article>) : <p>Registre seu primeiro progresso para começar.</p>}</div>{resumo?.proxima && <small className="proxima-medalha">Próxima: {resumo.proxima.nome} · {resumo.proxima.pontos} pts</small>}</div>;
}
