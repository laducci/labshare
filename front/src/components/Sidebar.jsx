import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Calendar,
  History,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Users,
  FolderTree,
  MapPin,
  BarChart3,
  Wrench,
  ClipboardCheck,
  Receipt,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const MENUS = {
  aluno: [
    { path: '/home', label: 'Início', icon: Home },
    { path: '/equipamentos', label: 'Equipamentos', icon: Package },
    { path: '/minhas-reservas', label: 'Minhas reservas', icon: Calendar },
    { path: '/historico', label: 'Histórico', icon: History },
    { path: '/notificacao', label: 'Notificações', icon: Bell },
    { path: '/perfil', label: 'Perfil', icon: User },
  ],
  tecnico: [
    { path: '/tecnico/painel', label: 'Painel', icon: LayoutDashboard },
    { path: '/tecnico/reservas', label: 'Reservas', icon: Calendar },
    { path: '/tecnico/retiradas', label: 'Retiradas', icon: ArrowDownToLine },
    { path: '/tecnico/devolucoes', label: 'Devoluções', icon: ArrowUpFromLine },
    { path: '/equipamentos', label: 'Equipamentos', icon: Package },
    { path: '/tecnico/ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
  ],
  manutencao: [
    { path: '/manutencao/painel', label: 'Painel', icon: LayoutDashboard },
    { path: '/manutencao/lista', label: 'Manutenções', icon: Wrench },
    { path: '/manutencao/historico', label: 'Histórico', icon: History },
    { path: '/equipamentos', label: 'Equipamentos', icon: Package },
  ],
  gestor: [
    { path: '/gestor/painel', label: 'Painel', icon: LayoutDashboard },
    { path: '/gestor/aprovacoes', label: 'Aprovações', icon: ClipboardCheck },
    { path: '/equipamentos', label: 'Equipamentos', icon: Package },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/equipamentos', label: 'Equipamentos', icon: Package },
    { path: '/admin/usuarios', label: 'Usuários', icon: Users },
    { path: '/admin/categorias', label: 'Categorias', icon: FolderTree },
    { path: '/admin/locais', label: 'Locais', icon: MapPin },
    { path: '/admin/reservas', label: 'Reservas', icon: Calendar },
    { path: '/manutencao/painel', label: 'Manutenções', icon: Wrench },
    { path: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
    { path: '/admin/multas', label: 'Multas', icon: Receipt, feature: 'lateFee' },
    { path: '/admin/personalizacao', label: 'Personalização', icon: SlidersHorizontal },
  ],
};

const ROLE_LABELS = {
  aluno: 'Aluno',
  tecnico: 'Técnico',
  manutencao: 'Manutenção',
  gestor: 'Gestor',
  admin: 'Administrador',
};

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, hasFeature } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const items = (MENUS[user.role] || MENUS.aluno).filter(
    (item) => !item.feature || hasFeature(item.feature)
  );

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose?.();
  };

  const content = (
    <>
      <Link to={items[0]?.path || '/home'} className="sidebar-brand" onClick={onClose}>
        <span className="sidebar-brand__mark">LS</span>
        <span className="sidebar-brand__name">LabShare</span>
      </Link>
      <div className="sidebar-content">
        <nav>
          <ul className="sidebar-nav">
        {items.map(({ path, label, icon: Icon }) => (
          <li
            key={path}
            className={`sidebar-nav__item ${
              location.pathname === path ||
              (path !== items[0]?.path && location.pathname.startsWith(`${path}/`))
                ? 'active'
                : ''
            }`}
          >
            <Link to={path} onClick={onClose}>
              <Icon size={18} />
              {label}
            </Link>
          </li>
        ))}
          </ul>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-logout">
          <div className="sidebar-nav__item">
            <button type="button" onClick={handleLogout}>
              <LogOut size={18} />
              Sair
            </button>
          </div>
          <div className="sidebar-profile">
            <span className="sidebar-profile__avatar">{user.firstName.charAt(0)}</span>
            <span className="sidebar-profile__copy">
              <span className="sidebar-profile__name">{user.name}</span>
              <span className="sidebar-profile__role">{ROLE_LABELS[user.role] || user.role}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="app-sidebar">{content}</aside>
      <div
        className={`sidebar-overlay-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`app-sidebar app-sidebar--overlay app-sidebar--mobile-only ${mobileOpen ? 'open' : ''}`}>
        {content}
      </aside>
    </>
  );
}
