import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { daysBetween, formatDateBR, isoDate } from '../utils/format';

export default function Availability() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dados: equipamento, carregando, erro } = useApi(`/equipamentos/${id}`);
  // Períodos já reservados: GET /api/equipamentos/{id}/ocupacao
  const ocupacao = useApi(`/equipamentos/${id}/ocupacao`);

  const [startDate, setStartDate] = useState(isoDate(1));
  const [endDate, setEndDate] = useState(isoDate(3));

  if (carregando) return <Layout><LoadingState /></Layout>;
  if (erro || !equipamento) return <Layout><ErrorState mensagem={erro || 'Equipamento não encontrado.'} /></Layout>;

  const days = daysBetween(startDate, endDate);
  const ocupados = ocupacao.dados || [];
  const conflito = ocupados.find((r) => !(r.dataFim < startDate || r.dataInicio > endDate));
  const periodoInvalido = !startDate || !endDate || endDate < startDate;

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Disponibilidade</h1>
        <p className="page-subtitle">{equipamento.nome} · Selecione as datas do empréstimo.</p>
      </div>

      <div className="availability-layout">
        <section className="calendar-panel">
          <div className="section-header">
            <h2 className="section-title">Período da reserva</h2>
            <CalendarDays size={20} color="var(--color-primary)" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="startDate">Data de início</label>
              <input id="startDate" type="date" className="form-input" value={startDate} min={isoDate(0)} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="endDate">Data de término</label>
              <input id="endDate" type="date" className="form-input" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="period-display">
            <div className="period-display__label">Período selecionado</div>
            <div className="period-display__value">
              {formatDateBR(startDate)} a {formatDateBR(endDate)} ({days} dias)
            </div>
          </div>

          <div className="info-panel" style={{ marginTop: 16 }}>
            <strong>Datas já ocupadas</strong>
            {ocupados.length === 0 ? (
              <p style={{ marginTop: 6 }}>Nenhuma reserva ativa para este equipamento.</p>
            ) : (
              <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                {ocupados.map((r) => (
                  <li key={r.id}>{formatDateBR(r.dataInicio)} a {formatDateBR(r.dataFim)} ({r.status})</li>
                ))}
              </ul>
            )}
          </div>
          {conflito && (
            <ErrorState mensagem={`Conflito: o equipamento já está reservado de ${formatDateBR(conflito.dataInicio)} a ${formatDateBR(conflito.dataFim)}.`} />
          )}
        </section>

        <aside className="reservation-summary">
          <h2 className="section-title" style={{ marginBottom: '18px' }}>Resumo da reserva</h2>
          <div className="summary-box">
            <div className="summary-row"><span className="summary-label">Equipamento</span><span className="summary-value">{equipamento.nome}</span></div>
            <div className="summary-row"><span className="summary-label">Duração</span><span className="summary-value">{days} dias</span></div>
            <div className="summary-row">
              <span className="summary-label">Retirada</span>
              <span className="summary-value"><MapPin size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{equipamento.localNome}</span>
            </div>
          </div>
          <button type="button" className="btn btn-primary btn-block" disabled={Boolean(conflito) || periodoInvalido}
            onClick={() => navigate(`/equipamento/${id}/confirmar`, { state: { startDate, endDate } })}>
            Continuar
          </button>
        </aside>
      </div>
    </Layout>
  );
}
