import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { USERS } from '../data/mockData';
import { useApp, getEquipmentById, formatDateBR } from '../context/AppContext';

export default function ActiveLoan() {
  const { reservation, equipments } = useApp();
  const navigate = useNavigate();
  const equipment = getEquipmentById('arduino-uno', equipments);

  return (
    <Layout>
      <div className="alert alert-success">Retirada registrada com sucesso.</div>

      <div className="card" style={{ maxWidth: '480px' }}>
        <div className="reservation-card__equipment">{equipment?.name}</div>
        <div style={{ margin: '1rem 0' }}>
          <span className="badge badge-warning">Em uso por {USERS.lucas.firstName}</span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Data de devolução: {formatDateBR(reservation?.endDate || '2025-08-22')} às 18:00
        </p>

        <div className="button-group" style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/notificacao')}>
            Ver notificação de devolução
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/tecnico/devolucao')}>
            Registrar devolução
          </button>
        </div>
      </div>
    </Layout>
  );
}
