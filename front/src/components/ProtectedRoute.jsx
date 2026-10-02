import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { rotaInicial } from '../utils/format';

/**
 * Protege rotas por perfil (RNF05) e por recurso do cliente (VARIABILIDADE).
 * Ex.: <ProtectedRoute roles={['admin']} feature="lateFee"> só abre para admins
 * de clientes que têm multa por atraso ligada.
 */
function ProtectedRoute({ children, roles, feature }) {
  const { user, hasFeature } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if ((roles && !roles.includes(user.perfil)) || (feature && !hasFeature(feature))) {
    return <Navigate to={rotaInicial(user.perfil)} replace />;
  }
  return children;
}

export default ProtectedRoute;
