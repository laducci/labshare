import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { PERFIS } from '../utils/format';

const RECURSOS = {
  approvalRequired: 'Aprovação de gestor antes da retirada',
  costCenter: 'Reserva vinculada a centro de custo',
  lateFee: 'Multa por devolução em atraso',
};

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
