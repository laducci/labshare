import { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Sidebar from './Sidebar';

export default function Layout({ children, fullWidth = false }) {
  const { user, tenant } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header__context">
          <span className="app-header__eyebrow">Ambiente institucional</span>
          <span className="app-header__tenant">{tenant?.name || 'LabShare'}</span>
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
          <button type="button" className="app-header__icon-btn" aria-label="Notificações">
            <Bell size={19} />
          </button>
          {user && (
            <div className="app-header__profile" title={user.name}>
              {user.firstName.charAt(0)}
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
