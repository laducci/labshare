/*
 * ============================================================
 *  Notifications.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Todos  |  Atividade: Q1 (Template Method NotificacaoTemplate), Q2 (tela com banco)
 * ------------------------------------------------------------
 *  O que faz: lista as notificações do usuário logado (lembretes de devolução, reservas
 *  pendentes de aprovação, manutenção concluída) e permite marcar como lida.
 *  Quem chama: App.jsx, rota /notificacoes (sino/menu do Layout).
 *  Chama: GET /api/notificacoes/minhas, POST /api/notificacoes/{id}/lida.
 * ============================================================
 */
import Layout from '../components/Layout';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateTimeBR } from '../utils/format';

/**
 * RF20/RF21: notificações geradas pelo backend (padrão Template Method).
 * Quem cria as linhas na tabela notificacao são as subclasses de NotificacaoTemplate
 * (LembreteDevolucao, AvisoReservaPendente, AvisoManutencaoConcluida) com INSERT INTO notificacao.
 */
export default function Notifications() {
  // GET /api/notificacoes/minhas -> NotificacaoController.minhas -> NotificacaoService.minhas
  //   -> NotificacaoDao.listarDoUsuario -> SELECT t.* FROM notificacao t
  //      WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.usuario_id = ?) ORDER BY t.data_criacao DESC, t.id DESC
  const { dados, setDados, carregando, erro } = useApi('/notificacoes/minhas');

  /**
   * Botão "Marcar como lida":
   *   POST /api/notificacoes/{id}/lida -> NotificacaoController.marcarComoLida -> NotificacaoService.marcarComoLida
   *   -> SELECT da notificação (confere se é do próprio usuário)
   *   -> UPDATE notificacao SET usuario_id = ?, titulo = ?, mensagem = ?, lida = ?, data_criacao = ? WHERE id = ? AND tenant_id = ?
   * Depois troca só aquela notificação na lista (setDados com map), sem refazer o GET.
   */
  const marcarLida = async (n) => {
    const atualizada = await api.post(`/notificacoes/${n.id}/lida`);
    setDados((lista) => lista.map((x) => (x.id === n.id ? atualizada : x)));
  };

  // JSX: um card por notificação; as não lidas ganham destaque e o botão "Marcar como lida".
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
