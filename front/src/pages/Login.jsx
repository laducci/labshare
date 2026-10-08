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
import {
  CalendarCheck, ClipboardCheck, Eye, EyeOff, GraduationCap, PackageCheck, ShieldCheck, UserRound, Wrench,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ErrorState } from '../components/States';
import { rotaInicial } from '../utils/format';

/**
 * Usuários de demonstração cadastrados no data.sql (senha de todos: 123456), agrupados por
 * CLIENTE (tenant). Cada aba do login é um cliente; "nota" explica o que muda naquele cliente
 * (VARIABILIDADE: o mesmo sistema se comporta diferente para cada instituição).
 */
const CLIENTES_DEMO = [
  {
    id: 'universidade',
    nome: 'Universidade',
    nota: 'Configuração padrão: a reserva é confirmada na hora, sem aprovação.',
    usuarios: [
      { email: 'lucas@email.com', nome: 'Lucas', papel: 'Aluno', icone: GraduationCap },
      { email: 'ricardo@email.com', nome: 'Ricardo', papel: 'Professor', icone: UserRound },
      { email: 'carlos@email.com', nome: 'Carlos', papel: 'Técnico', icone: ClipboardCheck },
      { email: 'fernanda@email.com', nome: 'Fernanda', papel: 'Manutenção', icone: Wrench },
      { email: 'roberto@email.com', nome: 'Roberto', papel: 'Administrador', icone: ShieldCheck },
    ],
  },
  {
    id: 'empresa',
    nome: 'Empresa',
    nota: 'Exige aprovação do gestor e centro de custo em toda reserva.',
    usuarios: [
      { email: 'bruno@empresa.com', nome: 'Bruno', papel: 'Colaborador', icone: UserRound },
      { email: 'patricia@empresa.com', nome: 'Patrícia', papel: 'Gestora', icone: CalendarCheck },
      { email: 'diego@empresa.com', nome: 'Diego', papel: 'Técnico', icone: ClipboardCheck },
      { email: 'helena@empresa.com', nome: 'Helena', papel: 'Administradora', icone: ShieldCheck },
    ],
  },
  {
    id: 'escola_tecnica',
    nome: 'Escola Técnica',
    nota: 'Cobra multa por dia de atraso na devolução.',
    usuarios: [
      { email: 'igor@escolatecnica.com', nome: 'Igor', papel: 'Aluno', icone: GraduationCap },
      { email: 'paulo@escolatecnica.com', nome: 'Paulo', papel: 'Técnico', icone: ClipboardCheck },
      { email: 'vera@escolatecnica.com', nome: 'Vera', papel: 'Administradora', icone: ShieldCheck },
    ],
  },
];

/** Tela de login. */
export default function Login() {
  // useState: campos do formulário, mostrar/ocultar senha, erro, "entrando" (desabilita botões)
  // e a aba de demonstração escolhida (índice em CLIENTES_DEMO).
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState(null);
  const [entrando, setEntrando] = useState(false);
  const [abaDemo, setAbaDemo] = useState(0);
  // login vem do AppContext: faz a chamada à API e guarda a sessão (usuário + tenant) para as outras telas.
  const { login } = useApp();
  const navigate = useNavigate();
  const clienteDemo = CLIENTES_DEMO[abaDemo];

  /**
   * Faz o login (usado pelo formulário e pelos cartões de demonstração):
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

  // JSX: painel da marca à esquerda; à direita o formulário e, embaixo, o acesso rápido de
  // demonstração (abas por cliente -> cartões de perfil que preenchem e-mail/senha e já entram).
  return (
    <div className="login-page">
      <aside className="login-visual">
        <div className="login-brand">
          <span className="login-brand__mark">LS</span>
          <span className="login-brand__name">LabShare</span>
        </div>
        <div className="login-visual__content">
          <h2>Equipamentos de laboratório com reserva, empréstimo e manutenção em um só lugar.</h2>
          <p>Cada instituição usa o mesmo sistema com as suas próprias regras.</p>
          <div className="login-steps" aria-hidden="true">
            <div className="login-step"><span className="login-step__icon"><CalendarCheck size={17} /></span>Reserve pelo calendário</div>
            <div className="login-step"><span className="login-step__icon"><PackageCheck size={17} /></span>Retire e devolva com checklist</div>
            <div className="login-step"><span className="login-step__icon"><Wrench size={17} /></span>Defeitos vão direto para a manutenção</div>
          </div>
        </div>
        <span className="login-visual__footer"><Link to="/">Ver a apresentação do projeto</Link></span>
      </aside>

      <main className="login-form-side">
        <div className="login-card">
          <h1 className="login-title">Entrar no LabShare</h1>
          <p className="login-subtitle">Use o e-mail e a senha da sua instituição.</p>

          <ErrorState mensagem={erro} />

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="form-input" value={email} required autoComplete="username"
                onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Senha</label>
              <div className="form-input-wrapper">
                <input id="password" type={mostrarSenha ? 'text' : 'password'} className="form-input" value={senha} required
                  autoComplete="current-password" onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" />
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

          {/* Acesso rápido: cada aba é um CLIENTE (tenant) diferente do LabShare. */}
          <section className="demo-access" aria-label="Contas de demonstração">
            <div className="demo-access__head">
              <span className="demo-access__title">Entrar com uma conta de demonstração</span>
              <span className="demo-access__hint">senha 123456</span>
            </div>
            <div className="demo-tabs" role="tablist">
              {CLIENTES_DEMO.map((c, i) => (
                <button key={c.id} type="button" role="tab" className="demo-tab" aria-selected={i === abaDemo}
                  onClick={() => setAbaDemo(i)}>
                  {c.nome}
                </button>
              ))}
            </div>
            <p className="demo-tenant-note">{clienteDemo.nota}</p>
            <div className="demo-users" role="tabpanel">
              {clienteDemo.usuarios.map(({ email: emailDemo, nome, papel, icone: Icone }) => (
                <button key={emailDemo} type="button" className="demo-user" disabled={entrando}
                  aria-label={`Entrar como ${nome} (${papel})`}
                  onClick={() => { setEmail(emailDemo); setSenha('123456'); entrar(emailDemo, '123456'); }}>
                  <span className="demo-user__icon"><Icone size={16} /></span>
                  <span>
                    <span className="demo-user__name">{nome}</span>
                    <span className="demo-user__role">{papel}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
