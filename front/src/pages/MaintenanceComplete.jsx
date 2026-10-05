/*
 * ============================================================
 *  MaintenanceComplete.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (CRUD de Manutenções - conclusão)
 * ------------------------------------------------------------
 *  O que faz: confirmação de manutenção concluída. Relê a manutenção e o equipamento do banco
 *  para mostrar que o equipamento voltou a ficar disponível (RN10).
 *  Quem chama: App.jsx, rota /manutencao/:id/concluida (navigate do EquipmentMaintenance após "Finalizar").
 *  Chama: GET /api/manutencoes/{id}, GET /api/equipamentos/{id}; botão volta para /manutencao/painel.
 * ============================================================
 */
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';

/**
 * Fim do ciclo: o equipamento volta a ficar disponível para reserva (RN10).
 */
export default function MaintenanceComplete() {
  const { id } = useParams();
  const navigate = useNavigate();
  // GET /api/manutencoes/{id} -> ManutencaoController.buscar (herdado de CrudController) -> ManutencaoService.buscar
  //   -> SELECT t.*, e.nome AS equipamento_nome, o.descricao AS ocorrencia_descricao, u.nome AS responsavel_nome
  //      FROM manutencao t JOIN equipamento e ... LEFT JOIN ocorrencia o ... LEFT JOIN usuario u ...
  //      WHERE t.id = ? AND t.tenant_id = ?
  const manutencao = useApi(`/manutencoes/${id}`);
  // GET dependente: só depois que a manutenção chegou sabemos o equipamentoId (antes passa null = não busca).
  //   GET /api/equipamentos/{id} -> EquipamentoController.buscar -> SELECT ... FROM equipamento t ... WHERE t.id = ? AND t.tenant_id = ?
  const equipamento = useApi(manutencao.dados ? `/equipamentos/${manutencao.dados.equipamentoId}` : null);

  if (manutencao.carregando || equipamento.carregando) return <Layout><LoadingState /></Layout>;
  if (manutencao.erro) return <Layout><ErrorState mensagem={manutencao.erro} /></Layout>;

  // JSX: resumo com o reparo feito e o status atual do equipamento (deve estar "Disponível").
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
