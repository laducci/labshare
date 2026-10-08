/*
 * ============================================================
 *  ManagerPanel.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade), Q1 (Strategy RegraAprovacao)
 * ------------------------------------------------------------
 *  O que faz: painel do gestor (só no cliente Empresa Corporativa): lista as reservas
 *  "Aguardando aprovação" para o gestor decidir.
 *  Quem chama: App.jsx, rotas /gestor/painel e /gestor/aprovacoes (protegidas pelo recurso "approvalRequired").
 *  Chama: GET /api/reservas?status=AGUARDANDO_APROVACAO; navega para /gestor/aprovacoes/:id (ApprovalDetail).
 * ============================================================
 */
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';
import { formatDateBR } from '../utils/format';

/**
 * VARIABILIDADE: tela e perfil que só existem para clientes com "approvalRequired".
 * Nesses clientes a estratégia AprovacaoPeloGestor faz toda reserva nascer "Aguardando aprovação".
 */
export default function ManagerPanel() {
  // useApp: usuário e cliente logados (AppContext).
  const { user, tenant } = useApp();
  const navigate = useNavigate();
  // GET /api/reservas?status=AGUARDANDO_APROVACAO -> ReservaController.porStatus -> ReservaService.listarPorStatus
  //   -> ReservaDao.listarPorStatus -> SELECT t.*, u.nome AS usuario_nome, e.nome AS equipamento_nome, ...
  //      FROM reserva t ... WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.status IN (?)) ORDER BY t.data_inicio DESC
  const { dados, carregando, erro } = useApi('/reservas?status=AGUARDANDO_APROVACAO');
  const pendentes = dados || [];

  // JSX: explicação do recurso e um card clicável por solicitação pendente.
  return (
    <Layout>
      <h1 className="page-title">Painel do Gestor</h1>
      <p className="page-subtitle">{user.nome} · {tenant.nome}</p>

      <div className="info-panel" style={{ marginBottom: '1.5rem' }}>
        <strong>Recurso exclusivo deste cliente:</strong> toda reserva passa pela sua aprovação antes de ser
        liberada para retirada. Clique numa solicitação para aprovar ou rejeitar.
      </div>

      <h2 className="section-title">Solicitações aguardando aprovação ({pendentes.length})</h2>
      {carregando && <LoadingState />}
      <ErrorState mensagem={erro} />
      {!carregando && pendentes.length === 0 && <EmptyState>Nenhuma solicitação pendente.</EmptyState>}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {pendentes.map((r) => (
          <div key={r.id} className="card card-clickable" role="button" tabIndex={0} onClick={() => navigate(`/gestor/aprovacoes/${r.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="reservation-card__equipment">{r.equipamentoNome}</div>
              <StatusBadge status={r.status} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0.5rem 0' }}>
              Solicitante: {r.usuarioNome} · {formatDateBR(r.dataInicio)} a {formatDateBR(r.dataFim)}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Centro de custo: {r.centroCustoNome || '—'}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
