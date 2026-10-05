/*
 * ============================================================
 *  RegisterReturn.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (fluxo de devolução), Q1 (Template Method + Strategy de multa), Q3 (Checklist)
 * ------------------------------------------------------------
 *  O que faz: tela em que o técnico registra a DEVOLUÇÃO com inspeção (RN07). Se algum item
 *  vier com defeito, o backend abre uma ocorrência (RN08) e manda o equipamento para
 *  manutenção (RN09). Se o cliente cobra multa e houve atraso, a multa é gerada (Strategy).
 *  Quem chama: App.jsx, rota /tecnico/devolucao/:reservaId (TechnicianPanel e ActiveLoan).
 *  Chama: GET /api/reservas/{id}, GET /api/equipamentos/{id}, POST /api/emprestimos/{id}/devolucao;
 *         componente Checklist; navega para /tecnico/ocorrencia/:id (Occurrence) quando há defeito.
 * ============================================================
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Checklist, { criarItens } from '../components/Checklist';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR, formatMoney, isoDate } from '../utils/format';

/** Tela de devolução. O id da reserva vem da URL (:reservaId). */
export default function RegisterReturn() {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  // GET /api/reservas/{id} -> ReservaController.buscar (herdado) -> SELECT ... FROM reserva t ... WHERE t.id = ? AND t.tenant_id = ?
  const reserva = useApi(`/reservas/${reservaId}`);
  // GET dependente: só busca o equipamento depois que a reserva chegou (antes passa null).
  //   GET /api/equipamentos/{id} -> EquipamentoController.buscar -> SELECT ... FROM equipamento t ... WHERE t.id = ? AND t.tenant_id = ?
  const equipamento = useApi(reserva.dados ? `/equipamentos/${reserva.dados.equipamentoId}` : null);
  // Estado do formulário de inspeção: itens, observações (vira a descrição do defeito),
  // prioridade do reparo, data real da devolução (usada para calcular atraso), erro e resultado.
  const [itens, setItens] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [prioridade, setPrioridade] = useState('Média');
  const [dataDevolucao, setDataDevolucao] = useState(isoDate(0));
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);

  // useEffect: quando o equipamento carrega, monta o checklist.
  // Na devolução começa tudo "OK"; o técnico desmarca o que estiver com defeito (RN07).
  useEffect(() => {
    if (equipamento.dados) setItens(criarItens(equipamento.dados.itensParaConferir, true));
  }, [equipamento.dados]);

  if (reserva.carregando || equipamento.carregando) return <Layout><LoadingState /></Layout>;
  if (reserva.erro) return <Layout><ErrorState mensagem={reserva.erro} /></Layout>;
  const r = reserva.dados;
  // Se algum item está com defeito a tela muda: aparece prioridade e o botão vira "abrir ocorrência".
  const temDefeito = itens.some((i) => !i.ok);

  /**
   * Botão "Confirmar devolução":
   *   POST /api/emprestimos/{id}/devolucao { itens, observacoes, prioridade, dataDevolucao }
   *   -> EmprestimoController.registrarDevolucao -> ProcessoDevolucao.executar
   *      (método-template de ProcessoChecklist - padrão Template Method):
   *      - reserva -> "Finalizada" com data_devolucao;
   *      - sem defeito: equipamento volta a "Disponível" (ou "Reservado" se houver outra reserva);
   *      - com defeito: RN08 INSERT INTO ocorrencia (tenant_id, ativo, equipamento_id, reserva_id, descricao,
   *        prioridade, status, data_abertura) VALUES (?, ...) e RN09 equipamento -> "Em manutenção";
   *      - UPDATE reserva SET ... ; UPDATE equipamento SET status = ? ; INSERT INTO historico (...);
   *      - gancho depoisDeConcluir: Strategy CalculoMulta (MultaPorDiaDeAtraso ou SemMulta, escolhida pelo
   *        SeletorDeRegras); se o valor > 0 -> INSERT INTO multa (...).
   * Resposta (ResultadoChecklist): { mensagem, reserva, equipamento, ocorrencia?, multa? }.
   * Com ocorrência -> vai para a tela da ocorrência levando a multa no state; sem -> mostra o resultado aqui.
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

  // Depois de uma devolução sem defeito, a tela troca para a mensagem de sucesso (e da multa, se houver).
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

  // JSX principal: resumo, Checklist no modo "devolucao", data, prioridade (só com defeito) e observações.
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
