/*
 * ============================================================
 *  Login.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (login + variabilidade por cliente)
 * ------------------------------------------------------------
 *  O que faz: tela de login. Envia e-mail e senha para o backend, que confere o hash BCrypt
 *  (RNF04) e devolve o usuário e o cliente (tenant) com seus recursos habilitados.
 *  Depois manda cada perfil para sua tela inicial (rotaInicial).
 *  Quem chama: App.jsx, rota /login (e /prototipo redireciona para cá).
 *  Chama: AppContext.login -> POST /api/auth/login; navigate(rotaInicial(perfil)).
 * ============================================================
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarDays, Eye, EyeOff, PackageCheck, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ErrorState } from '../components/States';
import { rotaInicial } from '../utils/format';

/** Usuários de demonstração cadastrados no data.sql (senha de todos: 123456). */
const USUARIOS_DEMO = [
  { email: 'lucas@email.com', rotulo: 'Aluno (Lucas)' },
  { email: 'carlos@email.com', rotulo: 'Técnico (Carlos)' },
  { email: 'fernanda@email.com', rotulo: 'Manutenção (Fernanda)' },
  { email: 'roberto@email.com', rotulo: 'Admin (Universidade)' },
  { email: 'patricia@empresa.com', rotulo: 'Gestor (Empresa Corporativa)' },
  { email: 'bruno@empresa.com', rotulo: 'Colaborador (Bruno – Empresa)' },
  { email: 'vera@escolatecnica.com', rotulo: 'Admin (Vera – Escola Técnica)' },
  { email: 'paulo@escolatecnica.com', rotulo: 'Técnico (Paulo – Escola Técnica)' },
];

/** Tela de login. */
export default function Login() {
  // useState: campos do formulário, mostrar/ocultar senha, erro e "entrando" (desabilita botões).
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState(null);
  const [entrando, setEntrando] = useState(false);
  // login vem do AppContext: faz a chamada à API e guarda a sessão (usuário + tenant) para as outras telas.
  const { login } = useApp();
  const navigate = useNavigate();

  /**
   * Faz o login (usado pelo formulário e pelos botões de usuário de demonstração):
   *   AppContext.login -> POST /api/auth/login { email, senha } -> AuthController.login -> AuthService.login
   *   -> UsuarioDao.buscarPorEmail -> SELECT t.* FROM usuario t WHERE LOWER(t.email) = LOWER(?) AND t.ativo = TRUE
   *   -> UsuarioService.senhaConfere: BCrypt compara a senha digitada com senha_hash (RNF04, nunca senha pura)
   *   -> TenantService.buscar -> SELECT id, nome, segmento FROM tenant WHERE id = ?
   *      + SELECT recurso, habilitado FROM tenant_recurso WHERE tenant_id = ? (se não estiver no FeatureFlagCache)
   * Login errado -> RegraNegocioException -> HTTP 400 { erro } -> a mensagem aparece na tela.
   * Login certo -> navigate para a tela inicial do perfil (RNF05).
   */
  const entrar = async (emailLogin, senhaLogin) => {
    setErro(null);
    setEntrando(true);
    try {
      const usuario = await login(emailLogin, senhaLogin);
      navigate(rotaInicial(usuario.perfil));
    } catch (e) {
      setErro(e.message);
    } finally {
      setEntrando(false);
    }
  };

  /** Submit do formulário: impede o recarregamento da página e chama entrar(). */
  const handleSubmit = (e) => {
    e.preventDefault();
    entrar(email, senha);
  };

  // JSX: painel visual à esquerda e formulário à direita; os botões de demonstração preenchem
  // e-mail/senha e já chamam entrar() com um usuário de cada perfil/cliente.
  return (
    <div className="login-page">
      <aside className="login-visual">
        <div className="login-brand">
          <span className="login-brand__mark">LS</span>
          <span className="login-brand__name">LabShare</span>
        </div>
        <div className="login-visual__content">
          <h2>Organize reservas, empréstimos e manutenção em um só lugar.</h2>
          <p>Uma experiência integrada para alunos, técnicos e equipes de laboratório.</p>
          <div className="login-visual__graphic" aria-hidden="true">
            <div className="login-visual__tile"><PackageCheck size={21} />Equipamentos</div>
            <div className="login-visual__tile"><CalendarDays size={21} />Reservas</div>
            <div className="login-visual__tile"><Wrench size={21} />Manutenção</div>
          </div>
        </div>
        <span className="login-visual__footer">Gestão acadêmica simples e confiável.</span>
      </aside>

      <main className="login-form-side">
        <div className="login-card">
          <h1 className="login-title">Bem-vindo de volta</h1>
          <p className="login-subtitle">Acesse sua conta para continuar.</p>

          <ErrorState mensagem={erro} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="form-input" value={email} required
                onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Senha</label>
              <div className="form-input-wrapper">
                <input id="password" type={mostrarSenha ? 'text' : 'password'} className="form-input" value={senha} required
                  onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" />
                <button type="button" className="form-input-icon" onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={entrando}>
              {entrando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="login-footer" style={{ marginTop: '0.75rem' }}>
            <Link to="/">← Voltar à apresentação do projeto</Link>
          </p>

          <div className="login-role-switch">
            <p className="login-role-switch__title">Usuários de demonstração (senha 123456)</p>
            <div className="login-role-buttons">
              {USUARIOS_DEMO.map((u) => (
                <button key={u.email} type="button" className="btn btn-secondary btn-sm" disabled={entrando}
                  onClick={() => { setEmail(u.email); setSenha('123456'); entrar(u.email, '123456'); }}>
                  {u.rotulo}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
              O LabShare é multi-cliente: cada instituição (tenant) tem seu próprio conjunto de recursos
              habilitados, lido do banco de dados no momento do login.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
