import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { formatDateBR } from '../utils/format';

const ABAS = {
  Próximas: ['Agendada', 'Aguardando aprovação'],
  'Em uso': ['Em uso'],
  Finalizadas: ['Finalizada'],
  Canceladas: ['Cancelada', 'Rejeitada'],
};

export default function MyReservations({ somenteHistorico = false }) {
  const [aba, setAba] = useState(somenteHistorico ? 'Finalizadas' : 'Próximas');
  const navigate = useNavigate();
  const { dados, carregando, erro, recarregar } = useApi('/reservas/minhas');   // GET /api/reservas/minhas
  const lista = (dados || []).filter((r) => ABAS[aba].includes(r.status));
  const abas = somenteHistorico ? ['Finalizadas', 'Canceladas'] : Object.keys(ABAS);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">{somenteHistorico ? 'Histórico' : 'Minhas reservas'}</h1>
        <p className="page-subtitle">
          {somenteHistorico ? 'Empréstimos anteriores.' : 'Acompanhe seus agendamentos e empréstimos.'}
        </p>
      </div>

      <div className="tabs">
        {abas.map((tab) => (
          <button key={tab} type="button" className={`tab ${aba === tab ? 'active' : ''}`} onClick={() => setAba(tab)}>
            {tab} ({(dados || []).filter((r) => ABAS[tab].includes(r.status)).length})
          </button>
        ))}
      </div>

      {carregando && <LoadingState />}
      <ErrorState mensagem={erro} onTentarNovamente={recarregar} />
      {!carregando && lista.length === 0 && <EmptyState>Nenhuma reserva nesta categoria.</EmptyState>}

      {lista.map((r) => (
        <div key={r.id} className="reservation-card card-clickable" role="button" tabIndex={0}
          onClick={() => navigate(`/minhas-reservas/${r.id}`)}
          onKeyDown={(e) => e.key === 'Enter' && navigate(`/minhas-reservas/${r.id}`)}>
          <div className="reservation-row">
            <div>
              <div className="reservation-card__equipment">{r.equipamentoNome}</div>
              <div className="reservation-card__dates">{r.localNome}</div>
            </div>
            <div className="reservation-card__dates">{formatDateBR(r.dataInicio)} a {formatDateBR(r.dataFim)}</div>
            <StatusBadge status={r.status} />
            <button type="button" className="btn btn-secondary btn-sm"
              onClick={(event) => { event.stopPropagation(); navigate(`/minhas-reservas/${r.id}`); }}>
              Ver detalhes
            </button>
          </div>
        </div>
      ))}
    </Layout>
  );
}
