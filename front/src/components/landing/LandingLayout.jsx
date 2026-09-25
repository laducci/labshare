import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../../data/landingContent';

export default function LandingLayout({ children }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-page">
      <header className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
        <div className="landing-container landing-nav__inner">
          <a href="#inicio" className="landing-brand" onClick={closeMenu}>
            <span className="landing-brand__icon">LS</span>
            LabShare
          </a>

          <nav className="landing-nav__links" aria-label="Navegação principal">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="landing-nav__actions">
            <Link to="/prototipo" className="landing-btn landing-btn--outline">
              Acessar protótipo
            </Link>
            <Link to="/prototipo" className="landing-btn landing-btn--primary">
              Entrar
            </Link>
            <button
              type="button"
              className="landing-nav__menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <nav className={`landing-mobile-nav ${menuOpen ? 'open' : ''}`} aria-label="Menu mobile">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}
        <Link to="/prototipo" onClick={closeMenu}>
          Acessar protótipo
        </Link>
      </nav>

      <main>{children}</main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer__inner">
          <div className="landing-footer__brand">
            <span className="landing-brand__icon">LS</span>
            LabShare
          </div>
          <p className="landing-footer__note">
            Projeto acadêmico — Design Thinking aplicado à gestão de laboratórios
          </p>
          <Link to="/prototipo" className="landing-btn landing-btn--primary">
            Ver protótipo navegável
          </Link>
        </div>
      </footer>
    </div>
  );
}
