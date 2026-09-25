import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { LOAN_RULES, COST_CENTERS } from '../data/mockData';
import { useApp, getEquipmentById, formatDateBR } from '../context/AppContext';

export default function ConfirmReservation() {
  const { id } = useParams();
  const location = useLocation();
  const { equipments, createReservation: saveReservation, hasFeature } = useApp();
  const navigate = useNavigate();
  const equipment = getEquipmentById(id, equipments);
  const [costCenter, setCostCenter] = useState(COST_CENTERS[0]?.id || '');

  const startDate = location.state?.startDate || '2025-08-20';
  const endDate = location.state?.endDate || '2025-08-22';

  if (!equipment) {
    return (
      <Layout>
        <p>Equipamento não encontrado.</p>
      </Layout>
    );
  }

  const handleConfirm = () => {
    saveReservation({
      equipmentId: id,
      startDate,
      endDate,
      costCenter: hasFeature('costCenter') ? costCenter : undefined,
      status: hasFeature('approvalRequired') ? 'Aguardando aprovação' : 'Agendada',
    });
    navigate('/reserva-sucesso');
  };

  return (
    <Layout>
      <h1 className="page-title">Confirmar reserva</h1>

      <div className="card" style={{ maxWidth: '520px' }}>
        <div className="summary-box">
          <div className="summary-row">
            <span className="summary-label">Equipamento</span>
            <span className="summary-value">{equipment.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Data de início</span>
            <span className="summary-value">{formatDateBR(startDate)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Data de término</span>
            <span className="summary-value">{formatDateBR(endDate)}</span>
          </div>
        </div>

        {hasFeature('costCenter') && (
          <div className="form-group">
            <label className="form-label" htmlFor="costCenter">
              Centro de custo
            </label>
            <select
              id="costCenter"
              className="form-select"
              value={costCenter}
              onChange={(e) => setCostCenter(e.target.value)}
            >
              {COST_CENTERS.map((cc) => (
                <option key={cc.id} value={cc.id}>{cc.name}</option>
              ))}
            </select>
          </div>
        )}

        {hasFeature('approvalRequired') && (
          <div className="empty-state" style={{ background: 'var(--color-bg)', textAlign: 'left', marginBottom: '1rem' }}>
            Esta reserva será enviada para <strong>aprovação do gestor</strong> responsável
            pelo centro de custo antes da liberação da retirada — regra exclusiva de clientes
            corporativos.
          </div>
        )}

        <div className="rules-box">
          <strong>Regras do empréstimo:</strong>
          <ul>
            {LOAN_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="button-group">
          <button type="button" className="btn btn-primary" onClick={handleConfirm}>
            Confirmar reserva
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </div>
    </Layout>
  );
}
