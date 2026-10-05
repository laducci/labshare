/*
 * ============================================================
 *  ReservationSuccess.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Reservas - confirmação do CREATE)
 * ------------------------------------------------------------
 *  O que faz: tela de confirmação depois de criar a reserva. Relê a reserva do banco e mostra
 *  se ficou "Agendada" ou "Aguardando aprovação" (variabilidade: depende da Strategy de
 *  aprovação do cliente).
 *  Quem chama: App.jsx, rota /reserva-sucesso/:id (navigate do ConfirmReservation após o POST).
 *  Chama: GET /api/reservas/{id}; botão leva para /minhas-reservas.
 * ============================================================
 */
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { formatDateBR } from '../utils/format';

/** Tela de sucesso da reserva. O id da reserva recém-criada vem da URL. */
export default function ReservationSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  // GET /api/reservas/{id} -> ReservaController.buscar (herdado) -> ReservaService.buscar
  //   -> SELECT t.*, e.nome AS equipamento_nome, l.nome AS local_nome, ... FROM reserva t ... WHERE t.id = ? AND t.tenant_id = ?
  const { dados: reserva, carregando, erro } = useApi(`/reservas/${id}`);

  if (carregando) return <Layout><LoadingState /></Layout>;
  if (erro) return <Layout><ErrorState mensagem={erro} /></Layout>;

  // Cliente com aprovação de gestor (AprovacaoPeloGestor) cria a reserva como "Aguardando aprovação";
  // os demais (AprovacaoAutomatica) já criam como "Agendada". A mensagem muda conforme o caso.
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
