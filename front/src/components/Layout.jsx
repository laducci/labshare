import { useEffect, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Sidebar from './Sidebar';

export default function Layout({ children, fullWidth = false }) {
  const { user, tenant } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    api.get('/notificacoes/minhas')
      .then((lista) => setNaoLidas(lista.filter((n) => !n.lida).length))
      .catch(() => setNaoLidas(0));
  }, [user]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header__context">
          <span className="app-header__eyebrow">Ambiente institucional</span>
          <span className="app-header__tenant">{tenant?.nome || 'LabShare'}</span>
        </div>
        <div className="app-header__actions">
          <button
            type="button"
            className="app-header__menu-btn app-sidebar--mobile-only"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <button
            type="button"
            className="app-header__icon-btn"
            aria-label="Notificações"
            onClick={() => navigate('/notificacoes')}
          >
            <Bell size={19} />
            {naoLidas > 0 && <span className="header-badge">{naoLidas}</span>}
          </button>
          {user && (
            <div className="app-header__profile" title={user.nome}>
              {user.primeiroNome?.charAt(0)}
            </div>
          )}
        </div>
      </header>
      <div className="app-body">
        <Sidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className={`app-main ${fullWidth ? 'app-main--full' : ''}`}>{children}</main>
      </div>
    </div>
  );
}
