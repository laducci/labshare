import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApp, getEquipmentById, formatDateBR } from '../context/AppContext';

const TABS = ['Próximas', 'Em uso', 'Finalizadas', 'Canceladas'];

export default function MyReservations() {
  const [activeTab, setActiveTab] = useState('Próximas');
  const { reservation, loanStatus, equipments } = useApp();
  const navigate = useNavigate();

  const equipment = reservation
    ? getEquipmentById(reservation.equipmentId, equipments)
    : getEquipmentById('arduino-uno', equipments);

  const getStatusForTab = () => {
    if (loanStatus === 'in_use') return 'Em uso';
    if (loanStatus === 'returned') return 'Finalizada';
    return reservation?.status || 'Agendada';
  };

  const currentStatus = getStatusForTab();

  const showReservation =
    (activeTab === 'Próximas' && (currentStatus === 'Agendada' || loanStatus === 'scheduled')) ||
    (activeTab === 'Em uso' && currentStatus === 'Em uso') ||
    (activeTab === 'Finalizadas' && currentStatus === 'Finalizada') ||
    (activeTab === 'Canceladas' && currentStatus === 'Cancelada');

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Minhas reservas</h1>
        <p className="page-subtitle">Acompanhe seus agendamentos e empréstimos.</p>
      </div>

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {showReservation && reservation ? (
        <div
          className="reservation-card card-clickable"
          onClick={() => navigate('/minhas-reservas/detalhe')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/minhas-reservas/detalhe')}
        >
          <div className="reservation-row">
            <div>
              <div className="reservation-card__equipment">{equipment?.name}</div>
              <div className="reservation-card__dates">{equipment?.category}</div>
            </div>
            <div className="reservation-card__dates">
              {formatDateBR(reservation.startDate)} a {formatDateBR(reservation.endDate)}
            </div>
            <StatusBadge status={currentStatus} />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(event) => {
                event.stopPropagation();
                navigate('/minhas-reservas/detalhe');
              }}
            >
              Ver detalhes
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-state">Nenhuma reserva nesta categoria.</div>
      )}
    </Layout>
  );
}
