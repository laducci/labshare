import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState, SuccessMessage } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR, formatDateTimeBR } from '../utils/format';

/** Detalhe da reserva: o aluno pode alterar as datas (UPDATE) ou cancelar. */
export default function ReservationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dados: reserva, setDados, carregando, erro } = useApi(`/reservas/${id}`);
  const [datas, setDatas] = useState({ dataInicio: '', dataFim: '' });
  const [mensagem, setMensagem] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  useEffect(() => {
    if (reserva) setDatas({ dataInicio: reserva.dataInicio, dataFim: reserva.dataFim });
  }, [reserva]);

  if (carregando) return <Layout><LoadingState /></Layout>;
  if (erro) return <Layout><ErrorState mensagem={erro} /></Layout>;

  const editavel = ['Agendada', 'Aguardando aprovação'].includes(reserva.status);

  /** PUT /api/reservas/{id} -> UPDATE reserva SET data_inicio = ?, data_fim = ? ... */
  const salvarDatas = async () => {
    setErroAcao(null);
    try {
      setDados(await api.put(`/reservas/${id}`, { ...reserva, ...datas }));
      setMensagem('Datas atualizadas.');
    } catch (e) {
      setErroAcao(e.message);
    }
  };

  /** POST /api/reservas/{id}/cancelar */
  const cancelar = async () => {
    if (!window.confirm('Deseja cancelar esta reserva?')) return;
    setErroAcao(null);
    try {
      setDados(await api.post(`/reservas/${id}/cancelar`));
      setMensagem('Reserva cancelada.');
    } catch (e) {
      setErroAcao(e.message);
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Detalhes da reserva</h1>
      <SuccessMessage mensagem={mensagem} />
      <ErrorState mensagem={erroAcao} />

      <div className="card" style={{ maxWidth: '560px' }}>
        <div className="summary-box">
          <div className="summary-row"><span className="summary-label">Equipamento</span><span className="summary-value">{reserva.equipamentoNome}</span></div>
          <div className="summary-row"><span className="summary-label">Local de retirada</span><span className="summary-value">{reserva.localNome}</span></div>
          <div className="summary-row"><span className="summary-label">Período</span><span className="summary-value">{formatDateBR(reserva.dataInicio)} a {formatDateBR(reserva.dataFim)}</span></div>
          {reserva.centroCustoNome && (
            <div className="summary-row"><span className="summary-label">Centro de custo</span><span className="summary-value">{reserva.centroCustoNome}</span></div>
          )}
          {reserva.dataRetirada && (
            <div className="summary-row"><span className="summary-label">Retirado em</span><span className="summary-value">{formatDateTimeBR(reserva.dataRetirada)}</span></div>
          )}
          {reserva.dataDevolucao && (
            <div className="summary-row"><span className="summary-label">Devolvido em</span><span className="summary-value">{formatDateBR(reserva.dataDevolucao)}</span></div>
          )}
          <div className="summary-row"><span className="summary-label">Status</span><span><StatusBadge status={reserva.status} /></span></div>
        </div>

        {editavel && (
          <>
            <h3 className="section-title" style={{ marginTop: 16 }}>Alterar datas</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="ini">Início</label>
                <input id="ini" type="date" className="form-input" value={datas.dataInicio} onChange={(e) => setDatas({ ...datas, dataInicio: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fim">Término</label>
                <input id="fim" type="date" className="form-input" value={datas.dataFim} onChange={(e) => setDatas({ ...datas, dataFim: e.target.value })} />
              </div>
            </div>
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={salvarDatas}>Salvar alterações</button>
              <button type="button" className="btn btn-danger" onClick={cancelar}>Cancelar reserva</button>
            </div>
          </>
        )}
        <button type="button" className="btn btn-link" style={{ marginTop: 12 }} onClick={() => navigate('/minhas-reservas')}>
          ← Voltar
        </button>
      </div>
    </Layout>
  );
}
