import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api, definirSessao } from '../services/api';

/**
 * Estado global da aplicação: quem está logado e de qual cliente (tenant).
 * Antes (protótipo) este arquivo guardava dados falsos em memória (mockData.js).
 * Agora todos os dados vêm do backend; aqui fica apenas a sessão.
 */
const AppContext = createContext(null);
const CHAVE_SESSAO = 'labshare.sessao';

function lerSessaoSalva() {
  try {
    const salva = JSON.parse(localStorage.getItem(CHAVE_SESSAO));
    if (salva?.usuario && salva?.tenant) {
      definirSessao(salva);
      return salva;
    }
  } catch {
    /* sem sessão salva */
  }
  return null;
}

export function AppProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessaoSalva);

  const salvarSessao = useCallback((nova) => {
    definirSessao(nova);
    setSessao(nova);
    try {
      if (nova) localStorage.setItem(CHAVE_SESSAO, JSON.stringify(nova));
      else localStorage.removeItem(CHAVE_SESSAO);
    } catch {
      /* navegador sem localStorage: segue só em memória */
    }
  }, []);

  /** POST /api/auth/login -> { usuario, tenant } */
  const login = useCallback(async (email, senha) => {
    const resposta = await api.post('/auth/login', { email, senha });
    salvarSessao(resposta);
    return resposta.usuario;
  }, [salvarSessao]);

  const logout = useCallback(() => salvarSessao(null), [salvarSessao]);

  /** Recarrega os recursos do cliente (usado depois de mudar a Personalização). */
  const atualizarTenant = useCallback(async () => {
    if (!sessao) return;
    const tenant = await api.get('/tenants/atual');
    salvarSessao({ ...sessao, tenant });
  }, [sessao, salvarSessao]);

  /** VARIABILIDADE: o cliente logado tem este recurso ligado? Ex.: hasFeature('lateFee') */
  const hasFeature = useCallback(
    (recurso) => Boolean(sessao?.tenant?.features?.[recurso]),
    [sessao]
  );

  const value = useMemo(() => ({
    user: sessao?.usuario || null,
    tenant: sessao?.tenant || null,
    login,
    logout,
    hasFeature,
    atualizarTenant,
  }), [sessao, login, logout, hasFeature, atualizarTenant]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
