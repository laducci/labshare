import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { Calendar, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Package } from 'lucide-react';
import { useApp, getEquipmentById, formatDateBR } from '../context/AppContext';
import { USERS } from '../data/mockData';

export default function TechnicianPanel() {
  const { reservation, loanStatus, equipments } = useApp();
  const navigate = useNavigate();

  const equipment = getEquipmentById('arduino-uno', equipments);
  const showDemoReservation = !reservation && loanStatus === 'none';
  const hasReservation = reservation || loanStatus !== 'none' || showDemoReservation;

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Painel do Técnico</h1>
        <p className="page-subtitle">{USERS.carlos.name} · Operações de hoje</p>
      </div>

      <div className="metric-grid">
        {[
          { label: 'Reservas hoje', value: hasReservation ? '1' : '0', icon: Calendar },
          { label: 'Retiradas pendentes', value: loanStatus === 'none' || loanStatus === 'scheduled' ? '1' : '0', icon: ArrowDownToLine },
          { label: 'Devoluções previstas', value: loanStatus === 'in_use' ? '1' : '0', icon: ArrowUpFromLine },
          { label: 'Ocorrências abertas', value: '0', icon: AlertTriangle },
        ].map(({ label, value, icon: Icon }) => (
          <div className="metric-card" key={label}>
            <span className="metric-card__icon"><Icon size={19} /></span>
            <span>
              <strong className="metric-card__value">{value}</strong>
              <span className="metric-card__label">{label}</span>
            </span>
          </div>
        ))}
      </div>

      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">Reservas de hoje</h2>
        </div>

        {hasReservation ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Equipamento</th>
                  <th>Horário</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{USERS.lucas.name}</td>
                  <td>{equipment?.name || 'Kit Arduino Uno'}</td>
                  <td>{formatDateBR(reservation?.startDate || '2025-08-20')} · 09:00</td>
                  <td>
                    <StatusBadge status={loanStatus === 'in_use' ? 'Em uso' : reservation?.status || 'Agendada'} />
                  </td>
                  <td>
                    {(loanStatus !== 'in_use' && loanStatus !== 'returned') || showDemoReservation ? (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/tecnico/retirada')}>
                        Registrar retirada
                      </button>
                    ) : null}
                    {loanStatus === 'in_use' && !showDemoReservation && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/tecnico/devolucao')}>
                        Registrar devolução
                      </button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">Nenhuma reserva para hoje.</div>
        )}
      </section>

      <div className="shortcuts-grid">
        <a href="/tecnico/reservas" className="shortcut-card" onClick={(e) => { e.preventDefault(); navigate('/tecnico/reservas'); }}>
          <div className="shortcut-card__icon"><Calendar size={24} /></div>
          <div className="shortcut-card__label">Reservas</div>
        </a>
        <a href="/tecnico/retiradas" className="shortcut-card" onClick={(e) => { e.preventDefault(); navigate('/tecnico/retiradas'); }}>
          <div className="shortcut-card__icon"><ArrowDownToLine size={24} /></div>
          <div className="shortcut-card__label">Retiradas</div>
        </a>
        <a href="/tecnico/devolucoes" className="shortcut-card" onClick={(e) => { e.preventDefault(); navigate('/tecnico/devolucoes'); }}>
          <div className="shortcut-card__icon"><ArrowUpFromLine size={24} /></div>
          <div className="shortcut-card__label">Devoluções</div>
        </a>
        <a href="/tecnico/ocorrencias" className="shortcut-card" onClick={(e) => { e.preventDefault(); navigate('/tecnico/ocorrencias'); }}>
          <div className="shortcut-card__icon"><AlertTriangle size={24} /></div>
          <div className="shortcut-card__label">Ocorrências</div>
        </a>
        <a href="/equipamentos" className="shortcut-card" onClick={(e) => { e.preventDefault(); navigate('/equipamentos'); }}>
          <div className="shortcut-card__icon"><Package size={24} /></div>
          <div className="shortcut-card__label">Equipamentos</div>
        </a>
      </div>
    </Layout>
  );
}
