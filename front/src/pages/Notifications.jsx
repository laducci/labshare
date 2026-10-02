import Layout from '../components/Layout';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateTimeBR } from '../utils/format';

/** RF20/RF21: notificações geradas pelo backend (padrão Template Method). */
export default function Notifications() {
  const { dados, setDados, carregando, erro } = useApi('/notificacoes/minhas');

  const marcarLida = async (n) => {
    const atualizada = await api.post(`/notificacoes/${n.id}/lida`);
    setDados((lista) => lista.map((x) => (x.id === n.id ? atualizada : x)));
  };

  return (
    <Layout>
      <h1 className="page-title">Notificações</h1>
      <p className="page-subtitle">Lembretes de devolução, aprovações e avisos de manutenção.</p>

      {carregando && <LoadingState />}
      <ErrorState mensagem={erro} />
      {!carregando && (dados || []).length === 0 && <EmptyState>Você não tem notificações.</EmptyState>}

      <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
        {(dados || []).map((n) => (
          <div key={n.id} className={`card notification-item ${n.lida ? '' : 'notification-item--unread'}`}>
            <div>
              <div className="reservation-card__equipment">{n.titulo}</div>
              <p style={{ margin: '6px 0', color: 'var(--color-text-muted)' }}>{n.mensagem}</p>
              <small style={{ color: 'var(--color-text-muted)' }}>{formatDateTimeBR(n.dataCriacao)}</small>
            </div>
            {!n.lida && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => marcarLida(n)}>Marcar como lida</button>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}
