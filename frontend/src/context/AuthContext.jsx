import { createContext, useContext, useState } from 'react';
import { modoDemo, requisicao } from '../api';

const AuthContext = createContext(null);
const memoria = new Map();
const storage = {
  getItem(chave) { try { return globalThis.localStorage?.getItem(chave) ?? memoria.get(chave) ?? null; } catch { return memoria.get(chave) ?? null; } },
  setItem(chave, valor) { memoria.set(chave, String(valor)); try { globalThis.localStorage?.setItem(chave, String(valor)); } catch { /* Firefox pode bloquear armazenamento em navegação privada. */ } },
  removeItem(chave) { memoria.delete(chave); try { globalThis.localStorage?.removeItem(chave); } catch { /* A sessão em memória ainda pode ser limpa. */ } },
};
let salvo = null;
try { salvo = JSON.parse(storage.getItem('aptus_usuario') || 'null'); }
catch { storage.removeItem('aptus_usuario'); storage.removeItem('aptus_token'); }

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(salvo ? { token: storage.getItem('aptus_token'), usuario: salvo } : null);
  const guardar = (dados) => { storage.setItem('aptus_token', dados.token); storage.setItem('aptus_usuario', JSON.stringify(dados.usuario)); setSessao(dados); };
  const login = async (email, senha, role) => guardar(await requisicao('/auth/login', { method: 'POST', body: { email, senha, ...(role ? { role } : {}) } }));
  const entrarComoConvidado = async () => {
    if (modoDemo) {
      const dados = { token: 'demonstracao-somente-leitura', usuario: { id: 'guest', nome_completo: 'Visitante', role: 'guest' } };
      guardar(dados);
      return;
    }
    guardar(await requisicao('/auth/convidado', { method: 'POST' }));
  };
  const registro = async (dados) => guardar(await requisicao('/auth/registro', { method: 'POST', body: dados }));
  const atualizarUsuario = (usuario) => {
    storage.setItem('aptus_usuario', JSON.stringify(usuario));
    setSessao(atual => atual ? { ...atual, usuario } : atual);
  };
  const logout = () => { storage.removeItem('aptus_token'); storage.removeItem('aptus_usuario'); setSessao(null); };
  return <AuthContext.Provider value={{ ...sessao, login, registro, entrarComoConvidado, atualizarUsuario, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
