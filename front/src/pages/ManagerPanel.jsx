import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { APPROVAL_REQUESTS, COST_CENTERS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function ManagerPanel() {
  const { user } = useApp();
  const navigate = useNavigate();

  const pending = APPROVAL_REQUESTS.filter((r) => r.status === 'Pendente');

  const costCenterName = (id) => COST_CENTERS.find((c) => c.id === id)?.name || id;

  return (
    <Layout>
      <h1 className="page-title">Painel do Gestor</h1>
      <p className="page-subtitle">{user?.name} · Empresa Corporativa</p>

      <div className="empty-state" style={{ background: 'var(--color-bg)', textAlign: 'left', marginBottom: '1.5rem' }}>
        <strong>Recurso exclusivo deste cliente:</strong> nas empresas corporativas, toda
        retirada de equipamento passa por aprovação do gestor responsável pelo centro de
        custo antes de ser liberada ao técnico. Alunos de universidades e escolas técnicas
        não veem esta etapa.
      </div>

      <h2 className="section-title">Solicitações aguardando aprovação ({pending.length})</h2>

      {pending.length === 0 ? (
        <div className="empty-state">Nenhuma solicitação pendente.</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {pending.map((req) => (
            <div key={req.id} className="card card-clickable" onClick={() => navigate(`/gestor/aprovacoes/${req.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="reservation-card__equipment">{req.equipmentName}</div>
                <StatusBadge status={req.status} />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0.5rem 0' }}>
                Solicitante: {req.requester}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Centro de custo: {costCenterName(req.costCenter)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
