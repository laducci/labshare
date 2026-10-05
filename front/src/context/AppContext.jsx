/*
 * ============================================================
 *  AppContext.jsx  |  Camada: Front-end (estado global / Context API do React)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (login e variabilidade hasFeature)
 * ------------------------------------------------------------
 *  O que faz: guarda a SESSÃO (usuário logado + cliente/tenant com seus recursos) e a
 *  compartilha com todas as telas, sem precisar passar props de componente em componente.
 *  Oferece login, logout, atualizarTenant e hasFeature (pergunta se o cliente tem um recurso ligado).
 *  Quem chama: main.jsx (AppProvider em volta do App) e qualquer componente via useApp().
 *  Chama: services/api.js -> POST /api/auth/login e GET /api/tenants/atual.
 * ============================================================
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api, definirSessao } from '../services/api';

/**
 * Estado global da aplicação: quem está logado e de qual cliente (tenant).
 * Antes (protótipo) este arquivo guardava dados falsos em memória (mockData.js).
 * Agora todos os dados vêm do backend; aqui fica apenas a sessão.
 */
// createContext cria o "canal" global; o AppProvider abaixo coloca valores nele e o useApp() lê.
const AppContext = createContext(null);
// Chave usada no localStorage para a sessão sobreviver a um F5 (recarregar a página).
const CHAVE_SESSAO = 'labshare.sessao';

// Lê a sessão salva no navegador (se houver) ao abrir o site. Se for válida, já avisa o api.js
// para as requisições saírem com os cabeçalhos X-Tenant-Id / X-Usuario-Id.
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

// Componente provedor: envolve o App inteiro (ver main.jsx). "children" (props) = tudo que está dentro dele.
export function AppProvider({ children }) {
  // useState com função: lerSessaoSalva roda só na primeira renderização.
  const [sessao, setSessao] = useState(lerSessaoSalva);

  // Único ponto que altera a sessão: atualiza o api.js, o estado do React e o localStorage ao mesmo tempo.
  // nova = null significa logout.
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
  // Chamado pelo botão "Entrar" da tela Login -> AuthController.login -> AuthService (confere senha BCrypt, RNF04).
  // Se a senha estiver errada, o api.js lança Error com a mensagem do backend e a tela Login mostra.
  const login = useCallback(async (email, senha) => {
    const resposta = await api.post('/auth/login', { email, senha });
    salvarSessao(resposta);
    return resposta.usuario;
  }, [salvarSessao]);

  // Logout = apagar a sessão (não há chamada ao backend, pois a API não guarda sessão no servidor).
  const logout = useCallback(() => salvarSessao(null), [salvarSessao]);

  /** Recarrega os recursos do cliente (usado depois de mudar a Personalização). */
  // GET /api/tenants/atual -> TenantController.atual. Assim o menu e as rotas refletem na hora o recurso ligado/desligado.
  const atualizarTenant = useCallback(async () => {
    if (!sessao) return;
    const tenant = await api.get('/tenants/atual');
    salvarSessao({ ...sessao, tenant });
  }, [sessao, salvarSessao]);

  /** VARIABILIDADE: o cliente logado tem este recurso ligado? Ex.: hasFeature('lateFee') */
  // tenant.features vem da tabela tenant_recurso. Usado no Sidebar (esconder itens), no ProtectedRoute
  // (bloquear rotas) e nas telas (ex.: mostrar campo de centro de custo). O backend também confere (403).
  const hasFeature = useCallback(
    (recurso) => Boolean(sessao?.tenant?.features?.[recurso]),
    [sessao]
  );

  // useMemo: só cria um novo objeto "value" quando algo muda, evitando redesenhar todas as telas à toa.
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

// Hook de acesso: const { user, tenant, hasFeature } = useApp(); em qualquer componente.
// Lança erro se alguém usar fora do AppProvider (ajuda a achar bug cedo).
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
