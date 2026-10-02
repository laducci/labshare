import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { formatDateBR, formatMoney } from '../utils/format';

/** Resultado da devolução com defeito: a ocorrência já está na fila da manutenção. */
export default function Occurrence() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { dados: o, carregando, erro } = useApi(`/ocorrencias/${id}`);

  if (carregando) return <Layout><LoadingState /></Layout>;
  if (erro) return <Layout><ErrorState mensagem={erro} /></Layout>;

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
