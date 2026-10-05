/*
 * ============================================================
 *  ApprovalDetail.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (variabilidade), Q1 (Strategy RegraAprovacao)
 * ------------------------------------------------------------
 *  O que faz: o gestor analisa uma solicitação "Aguardando aprovação" e aprova ou rejeita.
 *  Só existe para clientes com o recurso approvalRequired (estratégia AprovacaoPeloGestor).
 *  Quem chama: App.jsx, rota /gestor/aprovacoes/:id (clique em um card do ManagerPanel).
 *  Chama: GET /api/reservas/{id}, POST /api/reservas/{id}/aprovar, POST /api/reservas/{id}/rejeitar.
 * ============================================================
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR } from '../utils/format';

/** Tela de decisão do gestor. O id da reserva vem da URL. */
export default function ApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  // GET /api/reservas/{id} -> ReservaController.buscar (herdado de CrudController) -> ReservaService.buscar
  //   -> SELECT t.*, u.nome AS usuario_nome, e.nome AS equipamento_nome, cc.nome AS centro_custo_nome, ...
  //      FROM reserva t ... LEFT JOIN centro_custo cc ... WHERE t.id = ? AND t.tenant_id = ?
  const { dados: r, setDados, carregando, erro } = useApi(`/reservas/${id}`);
  // Estado: motivo digitado (usado só na rejeição) e erro da ação.
  const [motivo, setMotivo] = useState('');
  const [erroAcao, setErroAcao] = useState(null);

  if (carregando) return <Layout><LoadingState /></Layout>;
  if (erro) return <Layout><ErrorState mensagem={erro} /></Layout>;

  /**
   * Botões "Aprovar retirada" / "Rejeitar" (acao = 'aprovar' ou 'rejeitar'):
   *   POST /api/reservas/{id}/aprovar -> ReservaController.aprovar -> ReservaService.aprovar
   *     -> exige o recurso approvalRequired (senão 403); status "Aguardando aprovação" -> "Agendada"
   *     -> UPDATE reserva SET ..., status = 'AGENDADA', ... WHERE id = ? AND tenant_id = ?
   *     -> INSERT INTO historico (... 'APROVACAO' ...)
   *   POST /api/reservas/{id}/rejeitar { motivo } -> ReservaService.rejeitar
   *     -> status "Rejeitada", observacoes = motivo -> UPDATE reserva SET ...
   *     -> libera o equipamento se ninguém mais reservou (UPDATE equipamento SET status = ?)
   *     -> INSERT INTO historico (... 'REJEICAO' ...)
   * O backend devolve a reserva atualizada e setDados troca o que está na tela.
   */
  const decidir = async (acao) => {
    setErroAcao(null);
    try {
      setDados(await api.post(`/reservas/${id}/${acao}`, acao === 'rejeitar' ? { motivo } : {}));
    } catch (e) {
      setErroAcao(e.message);
    }
  };

  // Só mostra os botões enquanto a solicitação está pendente.
  const pendente = r.status === 'Aguardando aprovação';

  // JSX: resumo da solicitação + justificativa; botões de decisão ou o resultado da decisão.
  return (
    <Layout>
      <h1 className="page-title">Aprovação de retirada</h1>
      <ErrorState mensagem={erroAcao} />

      <div className="card" style={{ maxWidth: '560px' }}>
        <div className="summary-box">
          <div className="summary-row"><span className="summary-label">Equipamento</span><span className="summary-value">{r.equipamentoNome}</span></div>
          <div className="summary-row"><span className="summary-label">Solicitante</span><span className="summary-value">{r.usuarioNome}</span></div>
          <div className="summary-row"><span className="summary-label">Centro de custo</span><span className="summary-value">{r.centroCustoNome || '—'}</span></div>
          <div className="summary-row"><span className="summary-label">Período</span><span className="summary-value">{formatDateBR(r.dataInicio)} – {formatDateBR(r.dataFim)}</span></div>
          <div className="summary-row"><span className="summary-label">Status</span><span><StatusBadge status={r.status} /></span></div>
        </div>

        <h3 className="section-title">Justificativa</h3>
        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{r.justificativa || 'Sem justificativa.'}</p>

        {pendente ? (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="motivo">Motivo (em caso de rejeição)</label>
              <textarea id="motivo" className="form-textarea" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={() => decidir('aprovar')}>Aprovar retirada</button>
              <button type="button" className="btn btn-secondary" onClick={() => decidir('rejeitar')}>Rejeitar</button>
            </div>
          </>
        ) : (
          <div className="info-panel">
            Solicitação <strong>{r.status === 'Agendada' ? 'aprovada' : r.status.toLowerCase()}</strong>.
            {r.status === 'Agendada' && ' O técnico já pode registrar a retirada do equipamento.'}
            <div style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/gestor/painel')}>Voltar ao painel</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
