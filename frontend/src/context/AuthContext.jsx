import { createContext, useContext, useState } from 'react';
import { requisicao } from '../api';

const AuthContext = createContext(null);
const salvo = JSON.parse(localStorage.getItem('aptus_usuario') || 'null');

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(salvo ? { token: localStorage.getItem('aptus_token'), usuario: salvo } : null);
  const guardar = (dados) => { localStorage.setItem('aptus_token', dados.token); localStorage.setItem('aptus_usuario', JSON.stringify(dados.usuario)); setSessao(dados); };
  const login = async (email, senha, role) => guardar(await requisicao('/auth/login', { method: 'POST', body: { email, senha, ...(role ? { role } : {}) } }));
  const entrarComoConvidado = async () => guardar(await requisicao('/auth/convidado', { method: 'POST' }));
  const registro = async (dados) => guardar(await requisicao('/auth/registro', { method: 'POST', body: dados }));
  const logout = () => { localStorage.removeItem('aptus_token'); localStorage.removeItem('aptus_usuario'); setSessao(null); };
  return <AuthContext.Provider value={{ ...sessao, login, registro, entrarComoConvidado, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
