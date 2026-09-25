import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import { useApp, getEquipmentById, formatDateBR, daysBetween } from '../context/AppContext';

export default function Availability() {
  const { id } = useParams();
  const { equipments } = useApp();
  const navigate = useNavigate();
  const equipment = getEquipmentById(id, equipments);

  const [startDate, setStartDate] = useState('2025-08-20');
  const [endDate, setEndDate] = useState('2025-08-22');

  if (!equipment) {
    return (
      <Layout>
        <p>Equipamento não encontrado.</p>
      </Layout>
    );
  }

  const days = daysBetween(startDate, endDate);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Disponibilidade</h1>
        <p className="page-subtitle">{equipment.name} · Selecione as datas do empréstimo.</p>
      </div>

      <div className="availability-layout">
        <section className="calendar-panel">
          <div className="section-header">
            <h2 className="section-title">Período da reserva</h2>
            <CalendarDays size={20} color="var(--color-primary)" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="startDate">
                Data de início
              </label>
              <input
                id="startDate"
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="endDate">
                Data de término
              </label>
              <input
                id="endDate"
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="period-display">
            <div className="period-display__label">Período selecionado</div>
            <div className="period-display__value">
              {formatDateBR(startDate)} a {formatDateBR(endDate)} ({days} dias)
            </div>
          </div>
        </section>

        <aside className="reservation-summary">
          <h2 className="section-title" style={{ marginBottom: '18px' }}>Resumo da reserva</h2>
          <div className="summary-box">
            <div className="summary-row">
              <span className="summary-label">Equipamento</span>
              <span className="summary-value">{equipment.name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Duração</span>
              <span className="summary-value">{days} dias</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Retirada</span>
              <span className="summary-value">
                <MapPin size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {equipment.local}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() =>
              navigate(`/equipamento/${id}/confirmar`, {
                state: { startDate, endDate },
              })
            }
          >
            Continuar
          </button>
        </aside>
      </div>
    </Layout>
  );
}
