import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { APPROVAL_REQUESTS, COST_CENTERS } from '../data/mockData';
import { formatDateBR } from '../context/AppContext';

export default function ApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const request = APPROVAL_REQUESTS.find((r) => r.id === id) || APPROVAL_REQUESTS[0];
  const [decision, setDecision] = useState(null);
  const costCenterName = COST_CENTERS.find((c) => c.id === request.costCenter)?.name;

  const handleDecision = (value) => {
    setDecision(value);
  };

  return (
    <Layout>
      <h1 className="page-title">Aprovação de retirada</h1>

      <div className="card" style={{ maxWidth: '560px' }}>
        <div className="summary-box">
          <div className="summary-row">
            <span className="summary-label">Equipamento</span>
            <span className="summary-value">{request.equipmentName}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Solicitante</span>
            <span className="summary-value">{request.requester}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Centro de custo</span>
            <span className="summary-value">{costCenterName}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Período</span>
            <span className="summary-value">
              {formatDateBR(request.startDate)} – {formatDateBR(request.endDate)}
            </span>
          </div>
        </div>

        <h3 className="section-title">Justificativa</h3>
        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {request.justification}
        </p>

        {decision ? (
          <div className="empty-state" style={{ textAlign: 'left' }}>
            Solicitação <strong>{decision === 'approve' ? 'aprovada' : 'rejeitada'}</strong>.
            {decision === 'approve'
              ? ' O técnico já pode registrar a retirada do equipamento.'
              : ' O solicitante será notificado.'}
            <div style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/gestor/painel')}>
                Voltar ao painel
              </button>
            </div>
          </div>
        ) : (
          <div className="button-group">
            <button type="button" className="btn btn-primary" onClick={() => handleDecision('approve')}>
              Aprovar retirada
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => handleDecision('reject')}>
              Rejeitar
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
