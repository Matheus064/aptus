import { useState } from 'react';
import { requisicao } from '../../api';

export default function CriarReceita({ token, aoCriar }) {
  const [dados, setDados] = useState({ titulo: '', descricao: '', modo_preparo: '', calorias: '', dificuldade: 'fácil', categoria: '' });
  const [foto, setFoto] = useState(null);
  const [erro, setErro] = useState(''); const [carregando, setCarregando] = useState(false);
  const alterar = (e) => setDados({ ...dados, [e.target.name]: e.target.value });
  const enviar = async (e) => { e.preventDefault(); if (foto && !['image/jpeg', 'image/png'].includes(foto.type)) { setErro('Envie uma imagem JPG ou PNG.'); return; } setCarregando(true); try { const corpo = new FormData(); Object.entries(dados).forEach(([chave, valor]) => { if (valor) corpo.append(chave, valor); }); if (foto) corpo.append('foto', foto); const resposta = await requisicao('/receitas', { method: 'POST', token, body: corpo }); aoCriar?.(resposta); } catch (e) { setErro(e.message); } finally { setCarregando(false); } };
  return <form onSubmit={enviar} className="card"><h2>Nova receita</h2><label>Título<input name="titulo" maxLength="100" required value={dados.titulo} onChange={alterar} /></label><label>Descrição<textarea name="descricao" required value={dados.descricao} onChange={alterar} /></label><label>Modo de preparo<textarea name="modo_preparo" required value={dados.modo_preparo} onChange={alterar} /></label><label>Foto<input name="foto" type="file" accept="image/jpeg,image/png" onChange={e=>setFoto(e.target.files?.[0]||null)} /></label><div className="grid"><label>Calorias<input name="calorias" type="number" min="1" value={dados.calorias} onChange={alterar} /></label><label>Categoria<input name="categoria" value={dados.categoria} onChange={alterar} /></label><label>Dificuldade<select name="dificuldade" value={dados.dificuldade} onChange={alterar}><option>fácil</option><option>médio</option><option>difícil</option></select></label></div>{erro && <p className="erro">{erro}</p>}<button disabled={carregando}>{carregando ? 'Salvando...' : 'Publicar receita'}</button></form>;
}
