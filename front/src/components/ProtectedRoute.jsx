/*
 * ============================================================
 *  ProtectedRoute.jsx  |  Camada: Front-end (componente de segurança de rotas)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (autorização por perfil RNF05 + variabilidade por recurso)
 * ------------------------------------------------------------
 *  O que faz: "porteiro" das telas. Antes de mostrar uma página verifica: (1) existe usuário
 *  logado? (2) o perfil dele está na lista "roles"? (3) o cliente tem o recurso "feature" ligado?
 *  Se algo falhar, redireciona em vez de mostrar a tela.
 *  Quem chama: App.jsx (função P em cada <Route>).
 *  Chama: AppContext (useApp: user, hasFeature), utils/format (rotaInicial).
 * ============================================================
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { rotaInicial } from '../utils/format';

/**
 * Protege rotas por perfil (RNF05) e por recurso do cliente (VARIABILIDADE).
 * Ex.: <ProtectedRoute roles={['admin']} feature="lateFee"> só abre para admins
 * de clientes que têm multa por atraso ligada.
 */
// Props: children = a tela protegida; roles = perfis permitidos (ou null); feature = recurso exigido (opcional).
// Importante: isto só esconde a tela no navegador; o backend também valida (Contexto + AcessoNegadoException -> 403).
function ProtectedRoute({ children, roles, feature }) {
  const { user, hasFeature } = useApp();
  const location = useLocation();

  // Sem login -> vai para /login. state.from guarda a página que a pessoa tentou abrir.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Perfil sem permissão OU recurso do cliente desligado -> volta para a tela inicial do perfil.
  if ((roles && !roles.includes(user.perfil)) || (feature && !hasFeature(feature))) {
    return <Navigate to={rotaInicial(user.perfil)} replace />;
  }
  // Passou nas verificações: mostra a tela pedida.
  return children;
}

export default ProtectedRoute;
