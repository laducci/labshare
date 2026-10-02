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
  const location = useLocation();
  const navigate = useNavigate();
  const equipamento = useApi(`/equipamentos/${id}`);
  const regras = useApi('/reservas/regras');
  const exigeCentroCusto = Boolean(regras.dados?.exigeCentroCusto);
  const centros = useApi(exigeCentroCusto ? '/centros-custo' : null);

  const [centroCustoId, setCentroCustoId] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const { startDate, endDate } = location.state || {};
  if (!startDate) return <Navigate to={`/equipamento/${id}/disponibilidade`} replace />;
  if (equipamento.carregando || regras.carregando) return <Layout><LoadingState /></Layout>;

  /**
   * Clique em "Confirmar reserva":
   *   POST /api/reservas  ->  ReservaController.criar  ->  ReservaService (regras + Strategy)
   *   ->  ReservaDao.inserir  ->  INSERT INTO reserva (...) VALUES (...)
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
