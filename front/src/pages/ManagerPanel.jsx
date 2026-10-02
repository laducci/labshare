import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';
import { formatDateBR } from '../utils/format';

/** VARIABILIDADE: tela e perfil que só existem para clientes com "approvalRequired". */
export default function ManagerPanel() {
  const { user, tenant } = useApp();
  const navigate = useNavigate();
  const { dados, carregando, erro } = useApi('/reservas?status=AGUARDANDO_APROVACAO');
  const pendentes = dados || [];

  return (
    <Layout>
      <h1 className="page-title">Painel do Gestor</h1>
      <p className="page-subtitle">{user.nome} · {tenant.nome}</p>

      <div className="info-panel" style={{ marginBottom: '1.5rem' }}>
        <strong>Recurso exclusivo deste cliente:</strong> toda retirada de equipamento passa por aprovação do
        gestor responsável pelo centro de custo antes de ser liberada ao técnico. Na Universidade e na Escola
        Técnica esta etapa não existe (estratégia AprovacaoAutomatica).
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
