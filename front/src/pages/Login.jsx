import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarDays, Eye, EyeOff, PackageCheck, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ROLE_ROUTES = {
  lucas: '/home',
  carlos: '/tecnico/painel',
  fernanda: '/manutencao/painel',
  admin: '/admin/dashboard',
  patricia: '/gestor/painel',
  bruno: '/home',
  vera: '/admin/dashboard',
};

export default function Login() {
  const [email, setEmail] = useState('lucas@email.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = (userKey = 'lucas') => {
    login(userKey);
    navigate(ROLE_ROUTES[userKey]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin('lucas');
  };

  return (
    <div className="login-page">
      <aside className="login-visual">
        <div className="login-brand">
          <span className="login-brand__mark">LS</span>
          <span className="login-brand__name">LabShare</span>
        </div>
        <div className="login-visual__content">
          <h2>Organize reservas, empréstimos e manutenção em um só lugar.</h2>
          <p>
            Uma experiência integrada para alunos, técnicos e equipes de laboratório.
          </p>
          <div className="login-visual__graphic" aria-hidden="true">
            <div className="login-visual__tile">
              <PackageCheck size={21} />
              Equipamentos
            </div>
            <div className="login-visual__tile">
              <CalendarDays size={21} />
              Reservas
            </div>
            <div className="login-visual__tile">
              <Wrench size={21} />
              Manutenção
            </div>
          </div>
        </div>
        <span className="login-visual__footer">Gestão acadêmica simples e confiável.</span>
      </aside>

      <main className="login-form-side">
        <div className="login-card">
          <h1 className="login-title">Bem-vindo de volta</h1>
          <p className="login-subtitle">Acesse sua conta para continuar.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Senha
              </label>
              <div className="form-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  className="form-input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Lembrar-me
              </label>
              <a href="#esqueci">Esqueceu sua senha?</a>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Entrar
            </button>
          </form>

          <p className="login-footer">
            Ainda não tem conta? <a href="#cadastro">Cadastre-se</a>
          </p>

          <p className="login-footer" style={{ marginTop: '0.75rem' }}>
            <Link to="/">← Voltar à apresentação do projeto</Link>
          </p>

          <div className="login-role-switch">
            <p className="login-role-switch__title">Acesso rápido ao protótipo</p>
            <div className="login-role-buttons">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLogin('lucas')}>
                Aluno (Lucas)
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLogin('carlos')}>
                Técnico (Carlos)
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLogin('fernanda')}>
                Manutenção (Fernanda)
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLogin('admin')}>
                Admin (Universidade)
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLogin('patricia')}>
                Gestor (Empresa Corporativa)
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLogin('bruno')}>
                Aluno (Bruno – Empresa Corporativa)
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLogin('vera')}>
                Admin (Vera – Escola Técnica)
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
              O LabShare é multi-cliente: cada instituição (tenant) tem seu conjunto próprio de
              recursos habilitados. Experimente "Gestor" para ver o fluxo de aprovação exclusivo
              de clientes corporativos.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
