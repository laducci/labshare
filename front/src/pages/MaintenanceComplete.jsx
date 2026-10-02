import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';

/** Fim do ciclo: o equipamento volta a ficar disponível para reserva. */
export default function MaintenanceComplete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const manutencao = useApi(`/manutencoes/${id}`);
  const equipamento = useApi(manutencao.dados ? `/equipamentos/${manutencao.dados.equipamentoId}` : null);

  if (manutencao.carregando || equipamento.carregando) return <Layout><LoadingState /></Layout>;
  if (manutencao.erro) return <Layout><ErrorState mensagem={manutencao.erro} /></Layout>;

  return (
    <Layout>
      <div className="alert alert-success">Manutenção concluída com sucesso.</div>
      <div className="card" style={{ maxWidth: '480px' }}>
        <div className="summary-box">
          <div className="summary-row"><span className="summary-label">Equipamento</span><span className="summary-value">{manutencao.dados.equipamentoNome}</span></div>
          <div className="summary-row"><span className="summary-label">Reparo</span><span className="summary-value">{manutencao.dados.descricaoReparo}</span></div>
          <div className="summary-row"><span className="summary-label">Status do equipamento</span><span><StatusBadge status={equipamento.dados?.status} /></span></div>
        </div>
        <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/manutencao/painel')}>
          Voltar às manutenções
        </button>
      </div>
    </Layout>
  );
}
