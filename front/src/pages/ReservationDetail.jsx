import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApp, getEquipmentById, formatDateBR } from '../context/AppContext';

export default function ReservationDetail() {
  const { reservation, loanStatus, equipments } = useApp();
  const equipment = reservation
    ? getEquipmentById(reservation.equipmentId, equipments)
    : null;

  const status =
    loanStatus === 'in_use' ? 'Em uso' : loanStatus === 'returned' ? 'Finalizada' : reservation?.status;

  return (
    <Layout>
      <h1 className="page-title">Detalhes da reserva</h1>

      {reservation && (
        <div className="card" style={{ maxWidth: '520px' }}>
          <div className="summary-box">
            <div className="summary-row">
              <span className="summary-label">Equipamento</span>
              <span className="summary-value">{equipment?.name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Período</span>
              <span className="summary-value">
                {formatDateBR(reservation.startDate)} a {formatDateBR(reservation.endDate)}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Status</span>
              <span><StatusBadge status={status} /></span>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
