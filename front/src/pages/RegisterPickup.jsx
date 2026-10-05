/*
 * ============================================================
 *  RegisterPickup.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (fluxo de retirada), Q1 (Template Method ProcessoChecklist), Q3 (Checklist)
 * ------------------------------------------------------------
 *  O que faz: tela em que o técnico registra a RETIRADA do equipamento. Ele confere item por
 *  item do checklist (RN05) e confirma; a reserva e o equipamento passam a "Em uso" (RN04, RN06).
 *  Quem chama: App.jsx, rota /tecnico/retirada/:reservaId (botão "Registrar retirada" do TechnicianPanel).
 *  Chama: GET /api/reservas/{id}, GET /api/equipamentos/{id}, POST /api/emprestimos/{id}/retirada;
 *         componente Checklist (reuso); depois navega para /tecnico/emprestimo-ativo/:reservaId.
 * ============================================================
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Checklist, { criarItens } from '../components/Checklist';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR } from '../utils/format';

/** Tela de retirada. O id da reserva vem da URL (:reservaId). */
export default function RegisterPickup() {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  // GET /api/reservas/{id} -> ReservaController.buscar (herdado) -> ReservaService.buscar
  //   -> SELECT t.*, u.nome AS usuario_nome, e.nome AS equipamento_nome, ... FROM reserva t ... WHERE t.id = ? AND t.tenant_id = ?
  const reserva = useApi(`/reservas/${reservaId}`);
  // Segundo GET, dependente do primeiro: só roda quando a reserva chegou (antes passa null).
  //   GET /api/equipamentos/{id} -> EquipamentoController.buscar -> SELECT ... FROM equipamento t ... WHERE t.id = ? AND t.tenant_id = ?
  // Precisamos do equipamento para saber a lista de itens a conferir (itensParaConferir).
  const equipamento = useApi(reserva.dados ? `/equipamentos/${reserva.dados.equipamentoId}` : null);
  // Estado: itens do checklist [{ item, ok }], observações digitadas e erro do backend.
  const [itens, setItens] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState(null);

  // useEffect: roda quando equipamento.dados muda (ou seja, quando o GET do equipamento termina).
  // Começa com tudo DESmarcado: o técnico confere item por item (RN05).
  useEffect(() => {
    if (equipamento.dados) setItens(criarItens(equipamento.dados.itensParaConferir, false));
  }, [equipamento.dados]);

  if (reserva.carregando || equipamento.carregando) return <Layout><LoadingState /></Layout>;
  if (reserva.erro) return <Layout><ErrorState mensagem={reserva.erro} /></Layout>;
  // Atalho para a reserva carregada.
  const r = reserva.dados;

  /**
   * Botão "Confirmar retirada":
   *   POST /api/emprestimos/{id}/retirada { itens, observacoes }
   *   -> EmprestimoController.registrarRetirada -> ProcessoRetirada.executar
   *      (método-template final de ProcessoChecklist - padrão Template Method):
   *      1) SELECT da reserva e do equipamento
   *      2) validarConferencia: RN05, se algum item não foi marcado -> erro 400
   *      3) aplicar: RN04 só reserva "Agendada" pode ser retirada; reserva -> "Em uso" com data_retirada,
   *         equipamento -> "Em uso" (RN06)
   *      4) UPDATE reserva SET ... WHERE id = ? AND tenant_id = ?  e  UPDATE equipamento SET status = ? WHERE id = ? AND tenant_id = ?
   *      5) INSERT INTO historico (...) da reserva e do equipamento (RN11)
   * Deu certo -> navigate para a tela de empréstimo ativo.
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

  // JSX: resumo da reserva, componente Checklist (modo "retirada") e campo de observações.
  // onChange={setItens} faz o Checklist atualizar o estado desta tela quando um item é marcado.
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
