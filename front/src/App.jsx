import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import CrudPage from './components/CrudPage';
import { CRUDS } from './config/crudConfigs';
import { rotaInicial, SOLICITANTES } from './utils/format';

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
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import TechnicianPanel from './pages/TechnicianPanel';
import RegisterPickup from './pages/RegisterPickup';
import ActiveLoan from './pages/ActiveLoan';
import RegisterReturn from './pages/RegisterReturn';
import Occurrence from './pages/Occurrence';
import MaintenancePanel from './pages/MaintenancePanel';
import EquipmentMaintenance from './pages/EquipmentMaintenance';
import MaintenanceComplete from './pages/MaintenanceComplete';
import EquipmentList from './pages/EquipmentList';
import CreateEquipment from './pages/CreateEquipment';
import EditEquipment from './pages/EditEquipment';
import ManagerPanel from './pages/ManagerPanel';
import ApprovalDetail from './pages/ApprovalDetail';
import LateFeePanel from './pages/LateFeePanel';
import TenantSettings from './pages/TenantSettings';
import Dashboard from './pages/Dashboard';

const EQUIPE_MANUTENCAO = ['manutencao', 'admin'];

/** Atalho: rota protegida por perfil (e opcionalmente por recurso do cliente). */
const P = (roles, element, feature) => <ProtectedRoute roles={roles} feature={feature}>{element}</ProtectedRoute>;

/** Garante que o CrudPage seja recriado ao trocar de cadastro no menu. */
function Crud({ nome }) {
  return <CrudPage key={nome} config={CRUDS[nome]} />;
}

function App() {
  const { user } = useApp();
  const login = user ? <Navigate to={rotaInicial(user.perfil)} replace /> : <Login />;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={login} />
      <Route path="/prototipo" element={<Navigate to="/login" replace />} />

      {/* Aluno / Professor – Lucas */}
      <Route path="/home" element={P(SOLICITANTES, <Home />)} />
      <Route path="/busca" element={P(SOLICITANTES, <SearchResults />)} />
      <Route path="/equipamento/:id" element={P(null, <EquipmentDetails />)} />
      <Route path="/equipamento/:id/disponibilidade" element={P(SOLICITANTES, <Availability />)} />
      <Route path="/equipamento/:id/confirmar" element={P(SOLICITANTES, <ConfirmReservation />)} />
      <Route path="/reserva-sucesso/:id" element={P(SOLICITANTES, <ReservationSuccess />)} />
      <Route path="/minhas-reservas" element={P(SOLICITANTES, <MyReservations />)} />
      <Route path="/minhas-reservas/:id" element={P(SOLICITANTES, <ReservationDetail />)} />
      <Route path="/historico" element={P(SOLICITANTES, <MyReservations somenteHistorico />)} />
      <Route path="/notificacoes" element={P(null, <Notifications />)} />
      <Route path="/perfil" element={P(null, <Profile />)} />

      {/* Técnico – Carlos */}
      <Route path="/tecnico/painel" element={P(['tecnico'], <TechnicianPanel />)} />
      <Route path="/tecnico/retiradas" element={P(['tecnico'], <TechnicianPanel key="retiradas" filtro="retiradas" />)} />
      <Route path="/tecnico/devolucoes" element={P(['tecnico'], <TechnicianPanel key="devolucoes" filtro="devolucoes" />)} />
      <Route path="/tecnico/retirada/:reservaId" element={P(['tecnico'], <RegisterPickup />)} />
      <Route path="/tecnico/emprestimo-ativo/:reservaId" element={P(['tecnico'], <ActiveLoan />)} />
      <Route path="/tecnico/devolucao/:reservaId" element={P(['tecnico'], <RegisterReturn />)} />
      <Route path="/tecnico/ocorrencia/:id" element={P(['tecnico'], <Occurrence />)} />
      <Route path="/tecnico/ocorrencias" element={P(['tecnico'], <Crud nome="ocorrencias" />)} />
      <Route path="/tecnico/reservas" element={P(['tecnico'], <Crud nome="reservas" />)} />

      {/* Manutenção – Fernanda */}
      <Route path="/manutencao/painel" element={P(EQUIPE_MANUTENCAO, <MaintenancePanel />)} />
      <Route path="/manutencao/historico" element={P(EQUIPE_MANUTENCAO, <Crud nome="manutencoesHistorico" />)} />
      <Route path="/manutencao/:id" element={P(EQUIPE_MANUTENCAO, <EquipmentMaintenance />)} />
      <Route path="/manutencao/:id/concluida" element={P(EQUIPE_MANUTENCAO, <MaintenanceComplete />)} />

      {/* CRUD de Equipamentos (Laura) */}
      <Route path="/equipamentos" element={P(null, <EquipmentList />)} />
      <Route path="/equipamentos/novo" element={P(['admin', 'tecnico'], <CreateEquipment />)} />
      <Route path="/equipamentos/:id/editar" element={P(['admin', 'tecnico'], <EditEquipment />)} />

      {/* Administração */}
      <Route path="/admin/dashboard" element={P(['admin'], <Dashboard />)} />
      <Route path="/admin/relatorios" element={P(['admin'], <Dashboard />)} />
      <Route path="/admin/usuarios" element={P(['admin'], <Crud nome="usuarios" />)} />
      <Route path="/admin/categorias" element={P(['admin'], <Crud nome="categorias" />)} />
      <Route path="/admin/locais" element={P(['admin'], <Crud nome="locais" />)} />
      <Route path="/admin/reservas" element={P(['admin'], <Crud nome="reservas" />)} />
      <Route path="/admin/personalizacao" element={P(['admin'], <TenantSettings />)} />
      {/* VARIABILIDADE: só existem para clientes com o recurso ligado */}
      <Route path="/admin/multas" element={P(['admin'], <LateFeePanel />, 'lateFee')} />
      <Route path="/admin/centros-custo" element={P(['admin'], <Crud nome="centrosCusto" />, 'costCenter')} />

      {/* Gestor – Patrícia (Empresa Corporativa) */}
      <Route path="/gestor/painel" element={P(['gestor'], <ManagerPanel />, 'approvalRequired')} />
      <Route path="/gestor/aprovacoes" element={P(['gestor'], <ManagerPanel />, 'approvalRequired')} />
      <Route path="/gestor/aprovacoes/:id" element={P(['gestor'], <ApprovalDetail />, 'approvalRequired')} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
