import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApp, getEquipmentById, formatDateBR } from '../context/AppContext';

export default function ReservationSuccess() {
  const { reservation, equipments } = useApp();
  const navigate = useNavigate();
  const equipment = reservation
    ? getEquipmentById(reservation.equipmentId, equipments)
    : getEquipmentById('arduino-uno', equipments);

  return (
    <Layout>
      <div className="alert alert-success">Reserva realizada com sucesso!</div>

      <h2 className="section-title">Minhas reservas</h2>

      <div className="reservation-card">
        <div className="reservation-card__equipment">{equipment?.name || 'Kit Arduino Uno'}</div>
        <div className="reservation-card__dates">
          {formatDateBR(reservation?.startDate || '2025-08-20')}
          <br />
          até
          <br />
          {formatDateBR(reservation?.endDate || '2025-08-22')}
        </div>
        <StatusBadge status={reservation?.status || 'Agendada'} />
      </div>

      <button
        type="button"
        className="btn btn-link"
        onClick={() => navigate('/minhas-reservas')}
        style={{ marginTop: '1rem' }}
      >
        Ver todas as reservas →
      </button>
    </Layout>
  );
}
