import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Checklist, { criarItens } from '../components/Checklist';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR } from '../utils/format';

export default function RegisterPickup() {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  const reserva = useApi(`/reservas/${reservaId}`);
  const equipamento = useApi(reserva.dados ? `/equipamentos/${reserva.dados.equipamentoId}` : null);
  const [itens, setItens] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState(null);

  // começa com tudo DESmarcado: o técnico confere item por item (RN05)
  useEffect(() => {
    if (equipamento.dados) setItens(criarItens(equipamento.dados.itensParaConferir, false));
  }, [equipamento.dados]);

  if (reserva.carregando || equipamento.carregando) return <Layout><LoadingState /></Layout>;
  if (reserva.erro) return <Layout><ErrorState mensagem={reserva.erro} /></Layout>;
  const r = reserva.dados;

  /**
   * POST /api/emprestimos/{id}/retirada { itens, observacoes }
   * -> ProcessoRetirada.executar (Template Method) -> reserva e equipamento "Em uso"
   */
  const confirmar = async () => {
    setErro(null);
    try {
      await api.post(`/emprestimos/${reservaId}/retirada`, { itens, observacoes });
      navigate(`/tecnico/emprestimo-ativo/${reservaId}`);
    } catch (e) {
      setErro(e.message);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Registrar retirada</h1>
        <p className="page-subtitle">Confira os dados e valide todos os itens entregues.</p>
      </div>

      <div className="card" style={{ maxWidth: '720px' }}>
        <ErrorState mensagem={erro} />
        <div className="summary-box">
          <div className="summary-row"><span className="summary-label">Equipamento</span><span className="summary-value">{r.equipamentoNome}</span></div>
          <div className="summary-row"><span className="summary-label">Usuário</span><span className="summary-value">{r.usuarioNome}</span></div>
          <div className="summary-row"><span className="summary-label">Período</span><span className="summary-value">{formatDateBR(r.dataInicio)} a {formatDateBR(r.dataFim)}</span></div>
        </div>

        <h3 className="section-title">Checklist de itens ({itens.filter((i) => i.ok).length}/{itens.length})</h3>
        <Checklist itens={itens} modo="retirada" onChange={setItens} />

        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label className="form-label" htmlFor="observations">Observações (opcional)</label>
          <textarea id="observations" className="form-textarea" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </div>

        <button type="button" className="btn btn-primary btn-block" onClick={confirmar}>Confirmar retirada</button>
      </div>
    </Layout>
  );
}
