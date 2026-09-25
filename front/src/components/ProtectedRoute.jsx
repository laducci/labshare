import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function ProtectedRoute({ children, roles }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const redirect =
      user.role === 'tecnico'
        ? '/tecnico/painel'
        : user.role === 'manutencao'
          ? '/manutencao/painel'
          : user.role === 'admin'
            ? '/admin/dashboard'
            : user.role === 'gestor'
              ? '/gestor/painel'
              : '/home';
    return <Navigate to={redirect} replace />;
  }

  return children;
}

export default ProtectedRoute;
