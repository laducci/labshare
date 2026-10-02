import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { formatDateBR } from '../utils/format';

export default function ReservationSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dados: reserva, carregando, erro } = useApi(`/reservas/${id}`);

  if (carregando) return <Layout><LoadingState /></Layout>;
  if (erro) return <Layout><ErrorState mensagem={erro} /></Layout>;

  const pendente = reserva.status === 'Aguardando aprovação';

  return (
    <Layout>
      <div className={`alert ${pendente ? 'alert-info' : 'alert-success'}`}>
        {pendente ? 'Solicitação enviada! Aguarde a aprovação do gestor.' : 'Reserva realizada com sucesso!'}
      </div>

      <div className="reservation-card">
        <div className="reservation-card__equipment">{reserva.equipamentoNome}</div>
        <div className="reservation-card__dates">
          {formatDateBR(reserva.dataInicio)} até {formatDateBR(reserva.dataFim)} · retirada em {reserva.localNome}
        </div>
        <StatusBadge status={reserva.status} />
      </div>

      <button type="button" className="btn btn-link" onClick={() => navigate('/minhas-reservas')} style={{ marginTop: '1rem' }}>
        Ver todas as reservas →
      </button>
    </Layout>
  );
}
