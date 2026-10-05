/*
 * ============================================================
 *  Occurrence.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (Ocorrências), fluxo RN08/RN09
 * ------------------------------------------------------------
 *  O que faz: mostra a ocorrência aberta automaticamente na devolução com defeito (RN08): o
 *  equipamento já está "Em manutenção" (RN09). Se a devolução gerou multa, mostra também.
 *  Quem chama: App.jsx, rota /tecnico/ocorrencia/:id (navigate do RegisterReturn, com a multa no state).
 *  Chama: GET /api/ocorrencias/{id}; botão volta para /tecnico/painel.
 * ============================================================
 */
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { formatDateBR, formatMoney } from '../utils/format';

/**
 * Resultado da devolução com defeito: a ocorrência já está na fila da manutenção.
 */
export default function Occurrence() {
  const { id } = useParams();
  // useLocation().state: dados enviados pela tela anterior (aqui, a multa gerada, se houver).
  const { state } = useLocation();
  const navigate = useNavigate();
  // GET /api/ocorrencias/{id} -> OcorrenciaController.buscar (herdado de CrudController) -> OcorrenciaService.buscar
  //   -> SELECT t.*, e.nome AS equipamento_nome, e.imagem_url AS equipamento_imagem FROM ocorrencia t
  //      JOIN equipamento e ON e.id = t.equipamento_id WHERE t.id = ? AND t.tenant_id = ?
  const { dados: o, carregando, erro } = useApi(`/ocorrencias/${id}`);

  if (carregando) return <Layout><LoadingState /></Layout>;
  if (erro) return <Layout><ErrorState mensagem={erro} /></Layout>;

  // JSX: aviso de multa (se veio no state) e resumo da ocorrência com prioridade e status.
  return (
    <Layout>
      <h1 className="page-title">Ocorrência registrada</h1>
      {state?.multa && (
        <div className="alert alert-info">
          Multa gerada por atraso: {formatMoney(state.multa.valor)} ({state.multa.diasAtraso} dia(s)).
        </div>
      )}

      <div className="card" style={{ maxWidth: '560px' }}>
        <div className="summary-box">
          <div className="summary-row"><span className="summary-label">Equipamento</span><span className="summary-value">{o.equipamentoNome}</span></div>
          <div className="summary-row"><span className="summary-label">Problema</span><span className="summary-value">{o.descricao}</span></div>
          <div className="summary-row"><span className="summary-label">Data</span><span className="summary-value">{formatDateBR(o.dataAbertura)}</span></div>
          <div className="summary-row"><span className="summary-label">Prioridade</span><span><StatusBadge status={o.prioridade} /></span></div>
          <div className="summary-row"><span className="summary-label">Status</span><span><StatusBadge status={o.status} /></span></div>
        </div>
        <div className="info-panel" style={{ margin: '1rem 0' }}>
          O equipamento foi retirado da disponibilidade (Em manutenção) e encaminhado automaticamente
          para a fila da equipe de manutenção.
        </div>
        <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/tecnico/painel')}>
          Voltar ao painel
        </button>
      </div>
    </Layout>
  );
}
