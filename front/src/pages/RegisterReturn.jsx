import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Checklist, { criarItens } from '../components/Checklist';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR, formatMoney, isoDate } from '../utils/format';

export default function RegisterReturn() {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  const reserva = useApi(`/reservas/${reservaId}`);
  const equipamento = useApi(reserva.dados ? `/equipamentos/${reserva.dados.equipamentoId}` : null);
  const [itens, setItens] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [prioridade, setPrioridade] = useState('Média');
  const [dataDevolucao, setDataDevolucao] = useState(isoDate(0));
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);

  // na devolução começa tudo "OK"; o técnico marca o que estiver com defeito
  useEffect(() => {
    if (equipamento.dados) setItens(criarItens(equipamento.dados.itensParaConferir, true));
  }, [equipamento.dados]);

  if (reserva.carregando || equipamento.carregando) return <Layout><LoadingState /></Layout>;
  if (reserva.erro) return <Layout><ErrorState mensagem={reserva.erro} /></Layout>;
  const r = reserva.dados;
  const temDefeito = itens.some((i) => !i.ok);

  /**
   * POST /api/emprestimos/{id}/devolucao
   * -> ProcessoDevolucao (Template Method): se houver defeito cria ocorrência e manda para manutenção;
   *    se o cliente cobra multa (Strategy) e houve atraso, gera a multa.
   */
  const confirmar = async () => {
    setErro(null);
    try {
      const res = await api.post(`/emprestimos/${reservaId}/devolucao`, { itens, observacoes, prioridade, dataDevolucao });
      if (res.ocorrencia) {
        navigate(`/tecnico/ocorrencia/${res.ocorrencia.id}`, { state: { multa: res.multa } });
      } else {
        setResultado(res);
      }
    } catch (e) {
      setErro(e.message);
    }
  };

  if (resultado) {
    return (
      <Layout>
        <div className="alert alert-success">{resultado.mensagem}</div>
        {resultado.multa && (
          <div className="alert alert-info">
            Multa gerada: {formatMoney(resultado.multa.valor)} ({resultado.multa.diasAtraso} dia(s) de atraso).
          </div>
        )}
        <button type="button" className="btn btn-primary" onClick={() => navigate('/tecnico/painel')}>Voltar ao painel</button>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Registrar devolução</h1>
        <p className="page-subtitle">Inspeção: confira o estado de cada item recebido.</p>
      </div>

      <div className="card" style={{ maxWidth: '720px' }}>
        <ErrorState mensagem={erro} />
        <div className="summary-box">
          <div className="summary-row"><span className="summary-label">Equipamento</span><span className="summary-value">{r.equipamentoNome}</span></div>
          <div className="summary-row"><span className="summary-label">Usuário</span><span className="summary-value">{r.usuarioNome}</span></div>
          <div className="summary-row"><span className="summary-label">Devolução prevista</span><span className="summary-value">{formatDateBR(r.dataFim)}</span></div>
        </div>

        <h3 className="section-title">Checklist</h3>
        <Checklist itens={itens} modo="devolucao" onChange={setItens} />

        <div className="form-row" style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="dataDevolucao">Data da devolução</label>
            <input id="dataDevolucao" type="date" className="form-input" value={dataDevolucao} onChange={(e) => setDataDevolucao(e.target.value)} />
          </div>
          {temDefeito && (
            <div className="form-group">
              <label className="form-label" htmlFor="prioridade">Prioridade do reparo</label>
              <select id="prioridade" className="form-select" value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
                <option>Baixa</option><option>Média</option><option>Alta</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="observations">{temDefeito ? 'Descrição do defeito' : 'Observações'}</label>
          <textarea id="observations" className="form-textarea" value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
            placeholder={temDefeito ? 'Ex.: Sensor ultrassônico com falha no Trigger.' : ''} />
        </div>

        <button type="button" className="btn btn-primary btn-block" onClick={confirmar}>
          {temDefeito ? 'Confirmar devolução e abrir ocorrência' : 'Confirmar devolução'}
        </button>
      </div>
    </Layout>
  );
}
