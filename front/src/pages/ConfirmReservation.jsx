/*
 * ============================================================
 *  ConfirmReservation.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Reservas - CREATE + variabilidade), Q1 (Strategy no backend)
 * ------------------------------------------------------------
 *  O que faz: segundo passo da reserva: mostra o resumo e grava a reserva no banco (INSERT).
 *  É a mesma tela para todos os clientes (tenants): os campos de centro de custo e de
 *  justificativa só aparecem se as regras do cliente exigirem (variabilidade).
 *  Quem chama: App.jsx, rota /equipamento/:id/confirmar (navigate do Availability com as datas no state).
 *  Chama: GET /api/equipamentos/{id}, GET /api/reservas/regras, GET /api/centros-custo,
 *         POST /api/reservas; depois navega para /reserva-sucesso/:id.
 * ============================================================
 */
import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR } from '../utils/format';

/**
 * Confirmação da reserva — a mesma tela para todos os clientes.
 * VARIABILIDADE: o backend diz (GET /api/reservas/regras) se este cliente exige
 * aprovação do gestor e centro de custo; a tela só mostra o que for preciso.
 */
export default function ConfirmReservation() {
  const { id } = useParams();
  // useLocation: dá acesso ao "state" enviado pela tela anterior (startDate e endDate).
  const location = useLocation();
  const navigate = useNavigate();
  // GET /api/equipamentos/{id} -> EquipamentoController.buscar -> EquipamentoService.buscar
  //   -> SELECT t.*, c.nome AS categoria_nome, ... FROM equipamento t ... WHERE t.id = ? AND t.tenant_id = ?
  const equipamento = useApi(`/equipamentos/${id}`);
  // VARIABILIDADE: GET /api/reservas/regras -> ReservaController.regras -> ReservaService.regrasDoCliente
  //   -> SeletorDeRegras.para(tenant) escolhe as estratégias (Strategy: RegraAprovacao, CalculoMulta,
  //      RegraCentroCusto) e ConfiguracaoEmprestimo.getInstance() (Singleton) dá prazo e regras.
  //   SQL: SELECT recurso, habilitado FROM tenant_recurso WHERE tenant_id = ? (só se não estiver no
  //   FeatureFlagCache). Resposta: { exigeAprovacao, aprovacao, multa, exigeCentroCusto, prazoMaximoDias, regras }.
  const regras = useApi('/reservas/regras');
  const exigeCentroCusto = Boolean(regras.dados?.exigeCentroCusto);
  // Só busca os centros de custo se o cliente usa esse recurso (passar null = não faz GET).
  //   GET /api/centros-custo -> CentroCustoController.listar (herdado) -> CentroCustoService.listar
  //   -> SELECT t.* FROM centro_custo t WHERE t.tenant_id = ? AND t.ativo = TRUE ORDER BY t.nome
  const centros = useApi(exigeCentroCusto ? '/centros-custo' : null);

  // Estado do formulário (centro de custo e justificativa), da mensagem de erro e do
  // "enviando" (desabilita o botão para não criar a reserva duas vezes).
  const [centroCustoId, setCentroCustoId] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Se o usuário abriu esta URL direto (sem passar pela disponibilidade), não há datas:
  // <Navigate> redireciona de volta para a escolha do período (RN03 exige as duas datas).
  const { startDate, endDate } = location.state || {};
  if (!startDate) return <Navigate to={`/equipamento/${id}/disponibilidade`} replace />;
  if (equipamento.carregando || regras.carregando) return <Layout><LoadingState /></Layout>;

  /**
   * Clique em "Confirmar reserva" (CREATE do CRUD de Reservas):
   *   POST /api/reservas { equipamentoId, dataInicio, dataFim, centroCustoId, justificativa }
   *   -> ReservaController.criar (herdado de CrudController) -> CrudService.criar
   *   -> ReservaService.validar: RN03 (datas), RN01/RN02 (equipamento reservável) e conflito de datas
   *   -> ReservaService.antesDeSalvar: Strategy de centro de custo + Strategy de aprovação define o status
   *      inicial ("Agendada" ou "Aguardando aprovação")
   *   -> ReservaDao.inserir -> INSERT INTO reserva (tenant_id, ativo, usuario_id, equipamento_id, data_inicio,
   *      data_fim, status, centro_custo_id, ...) VALUES (?, ?, ...) RETURNING id
   *   -> INSERT INTO historico (...) e UPDATE equipamento SET status = ? (passa a "Reservado")
   *   -> se precisa de aprovação: AvisoReservaPendente (Template Method) -> INSERT INTO notificacao para os gestores
   * O usuario_id vem do cabeçalho X-Usuario-Id (services/api.js). Se der certo, vai para a tela de sucesso;
   * se o backend recusar (RegraNegocioException -> HTTP 400 {erro}), a mensagem aparece na tela.
   */
  const confirmar = async () => {
    setErro(null);
    setEnviando(true);
    try {
      const reserva = await api.post('/reservas', {
        equipamentoId: Number(id),
        dataInicio: startDate,
        dataFim: endDate,
        centroCustoId: centroCustoId ? Number(centroCustoId) : null,
        justificativa: justificativa || null,
      });
      navigate(`/reserva-sucesso/${reserva.id}`);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  // JSX: resumo + campos condicionais. "exigeCentroCusto &&" e "regras.dados?.exigeAprovacao &&"
  // fazem a tela mudar conforme o cliente, sem if no código para cada instituição.
  return (
    <Layout>
      <h1 className="page-title">Confirmar reserva</h1>

      <div className="card" style={{ maxWidth: '560px' }}>
        <ErrorState mensagem={erro || equipamento.erro || regras.erro} />
        <div className="summary-box">
          <div className="summary-row"><span className="summary-label">Equipamento</span><span className="summary-value">{equipamento.dados?.nome}</span></div>
          <div className="summary-row"><span className="summary-label">Data de início</span><span className="summary-value">{formatDateBR(startDate)}</span></div>
          <div className="summary-row"><span className="summary-label">Data de término</span><span className="summary-value">{formatDateBR(endDate)}</span></div>
        </div>

        {exigeCentroCusto && (
          <div className="form-group">
            <label className="form-label" htmlFor="costCenter">Centro de custo *</label>
            <select id="costCenter" className="form-select" value={centroCustoId} onChange={(e) => setCentroCustoId(e.target.value)}>
              <option value="">Selecione...</option>
              {(centros.dados || []).map((cc) => <option key={cc.id} value={cc.id}>{cc.nome}</option>)}
            </select>
          </div>
        )}

        {regras.dados?.exigeAprovacao && (
          <>
            <div className="info-panel" style={{ marginBottom: '1rem' }}>
              {regras.dados.aprovacao} Regra exclusiva de clientes corporativos.
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="justificativa">Justificativa para o gestor</label>
              <textarea id="justificativa" className="form-textarea" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
            </div>
          </>
        )}

        <div className="rules-box">
          <strong>Regras do empréstimo:</strong>
          <ul>
            {(regras.dados?.regras || []).map((rule) => <li key={rule}>{rule}</li>)}
            <li>{regras.dados?.multa}</li>
          </ul>
        </div>

        <div className="button-group">
          <button type="button" className="btn btn-primary" onClick={confirmar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Confirmar reserva'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
        </div>
      </div>
    </Layout>
  );
}
