import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR } from '../utils/format';

export default function ApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dados: r, setDados, carregando, erro } = useApi(`/reservas/${id}`);
  const [motivo, setMotivo] = useState('');
  const [erroAcao, setErroAcao] = useState(null);

  if (carregando) return <Layout><LoadingState /></Layout>;
  if (erro) return <Layout><ErrorState mensagem={erro} /></Layout>;

  /** POST /api/reservas/{id}/aprovar  ou  /rejeitar { motivo } */
  const decidir = async (acao) => {
    setErroAcao(null);
    try {
      setDados(await api.post(`/reservas/${id}/${acao}`, acao === 'rejeitar' ? { motivo } : {}));
    } catch (e) {
      setErroAcao(e.message);
    }
  };

  const pendente = r.status === 'Aguardando aprovação';

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
