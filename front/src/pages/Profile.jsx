/*
 * ============================================================
 *  Profile.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (variabilidade: recursos do cliente)
 * ------------------------------------------------------------
 *  O que faz: mostra os dados do usuário logado e quais recursos estão ligados para a
 *  instituição dele (tenant). Não chama a API: usa o que foi carregado no login.
 *  Quem chama: App.jsx, rota /perfil (menu lateral).
 *  Chama: AppContext (useApp) -> user e tenant (tenant.features veio da tabela tenant_recurso no login).
 * ============================================================
 */
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { PERFIS } from '../utils/format';

// Chave do recurso (como está na tabela tenant_recurso) -> texto exibido.
const RECURSOS = {
  approvalRequired: 'Aprovação de gestor antes da retirada',
  costCenter: 'Reserva vinculada a centro de custo',
  lateFee: 'Multa por devolução em atraso',
};

/**
 * Tela de perfil. user e tenant vêm do AppContext; nenhuma chamada ao backend aqui.
 * Para cada recurso mostra um selo verde (ligado) ou cinza (desligado) conforme tenant.features.
 */
export default function Profile() {
  const { user, tenant } = useApp();
  return (
    <Layout>
      <h1 className="page-title">Perfil</h1>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="summary-box">
          <div className="summary-row"><span className="summary-label">Nome</span><span className="summary-value">{user.nome}</span></div>
          <div className="summary-row"><span className="summary-label">E-mail</span><span className="summary-value">{user.email}</span></div>
          <div className="summary-row"><span className="summary-label">Perfil</span><span className="summary-value">{PERFIS[user.perfil]}</span></div>
          <div className="summary-row"><span className="summary-label">Instituição</span><span className="summary-value">{tenant.nome} ({tenant.segmento})</span></div>
        </div>
        <h3 className="section-title" style={{ marginTop: 16 }}>Recursos habilitados para a sua instituição</h3>
        <div className="feature-list">
          {Object.entries(RECURSOS).map(([chave, rotulo]) => (
            <span key={chave} className={`badge ${tenant.features?.[chave] ? 'badge-success' : 'badge-neutral'}`}>
              {tenant.features?.[chave] ? '✓' : '—'} {rotulo}
            </span>
          ))}
        </div>
      </div>
    </Layout>
  );
}
