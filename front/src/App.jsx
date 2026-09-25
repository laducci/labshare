import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import EquipmentDetails from './pages/EquipmentDetails';
import Availability from './pages/Availability';
import ConfirmReservation from './pages/ConfirmReservation';
import ReservationSuccess from './pages/ReservationSuccess';
import MyReservations from './pages/MyReservations';
import ReservationDetail from './pages/ReservationDetail';
import TechnicianPanel from './pages/TechnicianPanel';
import RegisterPickup from './pages/RegisterPickup';
import ActiveLoan from './pages/ActiveLoan';
import ReturnNotification from './pages/ReturnNotification';
import RegisterReturn from './pages/RegisterReturn';
import Occurrence from './pages/Occurrence';
import MaintenancePanel from './pages/MaintenancePanel';
import EquipmentMaintenance from './pages/EquipmentMaintenance';
import MaintenanceComplete from './pages/MaintenanceComplete';
import EquipmentList from './pages/EquipmentList';
import CreateEquipment from './pages/CreateEquipment';
import EditEquipment from './pages/EditEquipment';
import PlaceholderPage from './pages/PlaceholderPage';
import ManagerPanel from './pages/ManagerPanel';
import ApprovalDetail from './pages/ApprovalDetail';
import LateFeePanel from './pages/LateFeePanel';
import TenantSettings from './pages/TenantSettings';

function App() {
  const { user } = useApp();

  const defaultRoute =
    user?.role === 'tecnico'
      ? '/tecnico/painel'
      : user?.role === 'manutencao'
        ? '/manutencao/painel'
        : user?.role === 'admin'
          ? '/admin/dashboard'
          : user?.role === 'gestor'
            ? '/gestor/painel'
            : '/home';

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/prototipo" element={user ? <Navigate to={defaultRoute} replace /> : <Login />} />

      {/* Fluxo do Aluno – Lucas */}
      <Route path="/home" element={<ProtectedRoute roles={['aluno']}><Home /></ProtectedRoute>} />
      <Route path="/busca" element={<ProtectedRoute roles={['aluno']}><SearchResults /></ProtectedRoute>} />
      <Route path="/equipamento/:id" element={<ProtectedRoute><EquipmentDetails /></ProtectedRoute>} />
      <Route path="/equipamento/:id/disponibilidade" element={<ProtectedRoute roles={['aluno']}><Availability /></ProtectedRoute>} />
      <Route path="/equipamento/:id/confirmar" element={<ProtectedRoute roles={['aluno']}><ConfirmReservation /></ProtectedRoute>} />
      <Route path="/reserva-sucesso" element={<ProtectedRoute roles={['aluno']}><ReservationSuccess /></ProtectedRoute>} />
      <Route path="/minhas-reservas" element={<ProtectedRoute roles={['aluno']}><MyReservations /></ProtectedRoute>} />
      <Route path="/minhas-reservas/detalhe" element={<ProtectedRoute roles={['aluno']}><ReservationDetail /></ProtectedRoute>} />
      <Route path="/historico" element={<ProtectedRoute roles={['aluno']}><PlaceholderPage title="Histórico" subtitle="Empréstimos anteriores" /></ProtectedRoute>} />
      <Route path="/notificacao" element={<ProtectedRoute><ReturnNotification /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute roles={['aluno']}><PlaceholderPage title="Perfil" subtitle="Dados do usuário" /></ProtectedRoute>} />

      {/* Fluxo do Técnico – Carlos */}
      <Route path="/tecnico/painel" element={<ProtectedRoute roles={['tecnico']}><TechnicianPanel /></ProtectedRoute>} />
      <Route path="/tecnico/retirada" element={<ProtectedRoute roles={['tecnico']}><RegisterPickup /></ProtectedRoute>} />
      <Route path="/tecnico/emprestimo-ativo" element={<ProtectedRoute roles={['tecnico']}><ActiveLoan /></ProtectedRoute>} />
      <Route path="/tecnico/devolucao" element={<ProtectedRoute roles={['tecnico']}><RegisterReturn /></ProtectedRoute>} />
      <Route path="/tecnico/ocorrencia" element={<ProtectedRoute roles={['tecnico']}><Occurrence /></ProtectedRoute>} />
      <Route path="/tecnico/reservas" element={<ProtectedRoute roles={['tecnico']}><PlaceholderPage title="Reservas" subtitle="Todas as reservas" /></ProtectedRoute>} />
      <Route path="/tecnico/retiradas" element={<ProtectedRoute roles={['tecnico']}><PlaceholderPage title="Retiradas" subtitle="Registro de retiradas" /></ProtectedRoute>} />
      <Route path="/tecnico/devolucoes" element={<ProtectedRoute roles={['tecnico']}><PlaceholderPage title="Devoluções" subtitle="Registro de devoluções" /></ProtectedRoute>} />
      <Route path="/tecnico/ocorrencias" element={<ProtectedRoute roles={['tecnico']}><Occurrence /></ProtectedRoute>} />

      {/* Fluxo de Manutenção – Fernanda */}
      <Route path="/manutencao/painel" element={<ProtectedRoute roles={['manutencao', 'admin']}><MaintenancePanel /></ProtectedRoute>} />
      <Route path="/manutencao/lista" element={<ProtectedRoute roles={['manutencao', 'admin']}><MaintenancePanel /></ProtectedRoute>} />
      <Route path="/manutencao/historico" element={<ProtectedRoute roles={['manutencao', 'admin']}><PlaceholderPage title="Histórico de manutenções" /></ProtectedRoute>} />
      <Route path="/manutencao/equipamento/:id" element={<ProtectedRoute roles={['manutencao', 'admin']}><EquipmentMaintenance /></ProtectedRoute>} />
      <Route path="/manutencao/concluida" element={<ProtectedRoute roles={['manutencao', 'admin']}><MaintenanceComplete /></ProtectedRoute>} />

      {/* CRUD Equipamentos */}
      <Route path="/equipamentos" element={<ProtectedRoute><EquipmentList /></ProtectedRoute>} />
      <Route path="/equipamentos/novo" element={<ProtectedRoute roles={['admin', 'tecnico']}><CreateEquipment /></ProtectedRoute>} />
      <Route path="/equipamentos/:id/editar" element={<ProtectedRoute roles={['admin', 'tecnico']}><EditEquipment /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><PlaceholderPage title="Dashboard" subtitle="Visão geral do sistema" /></ProtectedRoute>} />
      <Route path="/admin/usuarios" element={<ProtectedRoute roles={['admin']}><PlaceholderPage title="Usuários" /></ProtectedRoute>} />
      <Route path="/admin/categorias" element={<ProtectedRoute roles={['admin']}><PlaceholderPage title="Categorias" /></ProtectedRoute>} />
      <Route path="/admin/locais" element={<ProtectedRoute roles={['admin']}><PlaceholderPage title="Locais" /></ProtectedRoute>} />
      <Route path="/admin/reservas" element={<ProtectedRoute roles={['admin']}><PlaceholderPage title="Reservas" /></ProtectedRoute>} />
      <Route path="/admin/relatorios" element={<ProtectedRoute roles={['admin']}><PlaceholderPage title="Relatórios" /></ProtectedRoute>} />
      <Route path="/admin/multas" element={<ProtectedRoute roles={['admin']}><LateFeePanel /></ProtectedRoute>} />
      <Route path="/admin/personalizacao" element={<ProtectedRoute roles={['admin']}><TenantSettings /></ProtectedRoute>} />

      {/* Fluxo do Gestor – Patrícia (cliente Empresa Corporativa) */}
      <Route path="/gestor/painel" element={<ProtectedRoute roles={['gestor']}><ManagerPanel /></ProtectedRoute>} />
      <Route path="/gestor/aprovacoes" element={<ProtectedRoute roles={['gestor']}><ManagerPanel /></ProtectedRoute>} />
      <Route path="/gestor/aprovacoes/:id" element={<ProtectedRoute roles={['gestor']}><ApprovalDetail /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
