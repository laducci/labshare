/*
 * ============================================================
 *  Sidebar.jsx  |  Camada: Front-end (componente de menu lateral)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade: itens por recurso do cliente), Q3 (menu por configuração)
 * ------------------------------------------------------------
 *  O que faz: monta o menu lateral a partir de uma CONFIGURAÇÃO (objeto MENUS): cada perfil tem
 *  sua lista de seções com itens, e itens com "feature" só aparecem se o cliente tiver esse recurso ligado
 *  (hasFeature). Também mostra o usuário logado e o botão Sair. Tem versão fixa (desktop) e gaveta (celular).
 *  Quem chama: Layout.jsx.
 *  Chama: AppContext (user, tenant, logout, hasFeature), utils/format (rotuloPerfil), React Router (Link, navigate).
 * ============================================================
 */
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
  Landmark,
  Database,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { rotuloPerfil } from '../utils/format';

/**
 * Ativo reutilizável nº 2: menu baseado em configuração.
 * - "perfil" decide quais itens aparecem (aluno, técnico...)
 * - "feature" esconde itens de módulos que o cliente não tem (VARIABILIDADE)
 * - cada menu é uma lista de SEÇÕES { titulo, itens }; titulo null = seção sem título.
 * Para um novo cliente/módulo basta acrescentar uma linha aqui.
 */
// Menu de quem pede reservas (aluno e professor usam o mesmo).
const MENU_SOLICITANTE = [
  {
    titulo: null,
    itens: [
      { path: '/home', label: 'Início', icon: Home },
      { path: '/equipamentos', label: 'Equipamentos', icon: Package },
      { path: '/minhas-reservas', label: 'Minhas reservas', icon: Calendar },
      { path: '/historico', label: 'Histórico', icon: History },
      { path: '/notificacoes', label: 'Notificações', icon: Bell },
      { path: '/perfil', label: 'Perfil', icon: User },
    ],
  },
];

// Um menu por perfil. Chave = user.perfil (vem do backend). "feature" = recurso do cliente exigido
// (approvalRequired, costCenter, lateFee): sem ele o item nem aparece (VARIABILIDADE).
const MENUS = {
  aluno: MENU_SOLICITANTE,
  professor: MENU_SOLICITANTE,
  tecnico: [
    {
      titulo: 'Atendimento',
      itens: [
        { path: '/tecnico/painel', label: 'Painel', icon: LayoutDashboard },
        { path: '/tecnico/retiradas', label: 'Retiradas', icon: ArrowDownToLine },
        { path: '/tecnico/devolucoes', label: 'Devoluções', icon: ArrowUpFromLine },
        { path: '/tecnico/reservas', label: 'Reservas', icon: Calendar },
        { path: '/tecnico/ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
      ],
    },
    {
      titulo: 'Consultas',
      itens: [
        { path: '/equipamentos', label: 'Equipamentos', icon: Package },
        { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
        { path: '/notificacoes', label: 'Notificações', icon: Bell },
      ],
    },
  ],
  manutencao: [
    {
      titulo: null,
      itens: [
        { path: '/manutencao/painel', label: 'Painel', icon: LayoutDashboard },
        { path: '/manutencao/historico', label: 'Histórico', icon: History },
        { path: '/equipamentos', label: 'Equipamentos', icon: Package },
        { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
        { path: '/notificacoes', label: 'Notificações', icon: Bell },
      ],
    },
  ],
  gestor: [
    {
      titulo: null,
      itens: [
        { path: '/gestor/painel', label: 'Aprovações', icon: ClipboardCheck, feature: 'approvalRequired' },
        { path: '/equipamentos', label: 'Equipamentos', icon: Package },
        { path: '/notificacoes', label: 'Notificações', icon: Bell },
      ],
    },
  ],
  admin: [
    {
      titulo: 'Visão geral',
      itens: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
        { path: '/consultas', label: 'Consultas', icon: Search },
      ],
    },
    {
      titulo: 'Operação',
      itens: [
        { path: '/equipamentos', label: 'Equipamentos', icon: Package },
        { path: '/admin/reservas', label: 'Reservas', icon: Calendar },
        { path: '/manutencao/painel', label: 'Manutenções', icon: Wrench },
        { path: '/admin/multas', label: 'Multas', icon: Receipt, feature: 'lateFee' },
      ],
    },
    {
      titulo: 'Cadastros',
      itens: [
        { path: '/admin/usuarios', label: 'Usuários', icon: Users },
        { path: '/admin/categorias', label: 'Categorias', icon: FolderTree },
        { path: '/admin/locais', label: 'Locais', icon: MapPin },
        { path: '/admin/centros-custo', label: 'Centros de custo', icon: Landmark, feature: 'costCenter' },
      ],
    },
    {
      titulo: 'Configuração',
      itens: [
        { path: '/admin/integracoes', label: 'Sistemas externos', icon: Database },
        { path: '/admin/personalizacao', label: 'Personalização', icon: SlidersHorizontal },
      ],
    },
  ],
};

// Props: mobileOpen = gaveta aberta no celular; onClose = função do Layout para fechá-la.
export default function Sidebar({ mobileOpen, onClose }) {
  const { user, tenant, logout, hasFeature } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Sem usuário logado não há menu.
  if (!user) return null;

  // Pega o menu do perfil, remove os itens cujo recurso o cliente não tem (hasFeature)
  // e descarta seções que ficaram vazias.
  const secoes = (MENUS[user.perfil] || MENU_SOLICITANTE)
    .map((secao) => ({ ...secao, itens: secao.itens.filter((item) => !item.feature || hasFeature(item.feature)) }))
    .filter((secao) => secao.itens.length > 0);
  const primeiro = secoes[0]?.itens[0]?.path || '/home';

  // O item fica "active" quando a URL atual é a dele ou uma subpágina (ex.: /equipamentos/3/editar).
  // O primeiro item (tela inicial) só fica ativo na URL exata, senão ficaria sempre marcado.
  const ativo = (path) => location.pathname === path || (path !== primeiro && location.pathname.startsWith(`${path}/`));

  // Botão "Sair": limpa a sessão (AppContext) e navega para a tela de login.
  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  // Conteúdo do menu, montado uma vez e usado nas duas versões (desktop e celular).
  const content = (
    <>
      <Link to={primeiro} className="sidebar-brand" onClick={onClose}>
        <span className="sidebar-brand__mark">LS</span>
        <span className="sidebar-brand__name">LabShare</span>
      </Link>
      <div className="sidebar-content">
        <nav aria-label="Menu principal">
          {secoes.map((secao) => (
            <div className="sidebar-section" key={secao.titulo || 'principal'}>
              {secao.titulo && <p className="sidebar-section__title">{secao.titulo}</p>}
              <ul className="sidebar-nav">
                {secao.itens.map(({ path, label, icon: Icon }) => (
                  <li key={path} className={`sidebar-nav__item ${ativo(path) ? 'active' : ''}`}>
                    <Link to={path} onClick={onClose} aria-current={ativo(path) ? 'page' : undefined}>
                      <Icon size={18} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
            <span className="sidebar-profile__avatar">{user.primeiroNome?.charAt(0)}</span>
            <span className="sidebar-profile__copy">
              <span className="sidebar-profile__name">{user.nome}</span>
              <span className="sidebar-profile__role">{rotuloPerfil(user.perfil, tenant)}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );

  // Duas versões do mesmo menu: <aside> fixo (desktop) e gaveta sobreposta com fundo escuro (celular);
  // o CSS decide qual aparece pelo tamanho da tela.
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
