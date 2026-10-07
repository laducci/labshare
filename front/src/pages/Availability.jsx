/*
 * ============================================================
 *  Availability.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Reservas - passo 1 da criação)
 * ------------------------------------------------------------
 *  O que faz: primeiro passo da reserva: o aluno/professor escolhe data de início e fim.
 *  Mostra os períodos já ocupados do equipamento e bloqueia o botão se houver conflito
 *  (o backend confere de novo no POST, a checagem aqui é só para ajudar o usuário). RN03.
 *  Quem chama: App.jsx, rota /equipamento/:id/disponibilidade (botão "Ver disponibilidade" do EquipmentDetails).
 *  Chama: GET /api/equipamentos/{id}, GET /api/equipamentos/{id}/ocupacao,
 *         GET /api/integracoes/feriados (AIE "Calendário de feriados", Laura - Medição);
 *         navega para /equipamento/:id/confirmar (ConfirmReservation) levando as datas no "state".
 * ============================================================
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import { ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { daysBetween, formatDateBR, isoDate } from '../utils/format';

/** Tela de escolha do período. O id do equipamento vem da URL. */
export default function Availability() {
  const { id } = useParams();
  const navigate = useNavigate();
  // GET automático: /api/equipamentos/{id} -> EquipamentoController.buscar (herdado de CrudController)
  //   -> EquipamentoService.buscar -> EquipamentoDao.buscarPorId
  //   -> SELECT t.*, c.nome AS categoria_nome, l.nome AS local_nome FROM equipamento t
  //      LEFT JOIN categoria c ... LEFT JOIN local l ... WHERE t.id = ? AND t.tenant_id = ?
  const { dados: equipamento, carregando, erro } = useApi(`/equipamentos/${id}`);
  // Períodos já reservados: GET /api/equipamentos/{id}/ocupacao
  //   -> EquipamentoController.ocupacao -> EquipamentoService.ocupacao -> ReservaDao.listarAtivasDoEquipamento
  //   -> SELECT ... FROM reserva t WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.equipamento_id = ?
  //      AND t.status IN ('AGUARDANDO_APROVACAO', 'AGENDADA', 'EM_USO'))
  const ocupacao = useApi(`/equipamentos/${id}/ocupacao`);
  // Medição (AIE "Calendário de feriados", Laura): feriados/recessos dos próximos 120 dias vindos do
  // Calendário Acadêmico (sistema externo, só leitura): GET /api/integracoes/feriados?inicio=..&fim=..
  // Em feriado o laboratório está fechado: não dá para retirar nem devolver (o backend confere de novo).
  const feriados = useApi(`/integracoes/feriados?inicio=${isoDate(0)}&fim=${isoDate(120)}`);

  // Estado das datas escolhidas (formato AAAA-MM-DD do <input type="date">).
  // Valor inicial: amanhã até daqui a 3 dias.
  const [startDate, setStartDate] = useState(isoDate(1));
  const [endDate, setEndDate] = useState(isoDate(3));

  if (carregando) return <Layout><LoadingState /></Layout>;
  if (erro || !equipamento) return <Layout><ErrorState mensagem={erro || 'Equipamento não encontrado.'} /></Layout>;

  // Cálculos feitos a cada renderização:
  //  - days: quantidade de dias do período;
  //  - conflito: primeira reserva ativa cujo período se sobrepõe ao escolhido
  //    (mesma lógica de Reserva.conflitaCom no backend: NÃO (fim < início OU início > fim));
  //  - periodoInvalido: RN03, precisa ter as duas datas e o fim não pode ser antes do início.
  const days = daysBetween(startDate, endDate);
  const ocupados = ocupacao.dados || [];
  const conflito = ocupados.find((r) => !(r.dataFim < startDate || r.dataInicio > endDate));
  const periodoInvalido = !startDate || !endDate || endDate < startDate;
  // Feriados: os que caem dentro do período escolhido e os que batem com a retirada/devolução.
  const listaFeriados = feriados.dados || [];
  const feriadosNoPeriodo = listaFeriados.filter((f) => f.data >= startDate && f.data <= endDate);
  const feriadoNaRetirada = listaFeriados.find((f) => f.data === startDate);
  const feriadoNaDevolucao = listaFeriados.find((f) => f.data === endDate);
  const bloqueadoPorFeriado = Boolean(feriadoNaRetirada || feriadoNaDevolucao);

  // JSX: formulário de datas, lista de datas ocupadas e resumo. O botão "Continuar" fica
  // desabilitado se houver conflito ou período inválido; ao clicar, navigate leva as datas
  // para a tela de confirmação via location.state (nada é gravado no banco ainda).
  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Disponibilidade</h1>
        <p className="page-subtitle">{equipamento.nome} · Selecione as datas do empréstimo.</p>
      </div>

      <div className="availability-layout">
        <section className="calendar-panel">
          <div className="section-header">
            <h2 className="section-title">Período da reserva</h2>
            <CalendarDays size={20} color="var(--color-primary)" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="startDate">Data de início</label>
              <input id="startDate" type="date" className="form-input" value={startDate} min={isoDate(0)} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="endDate">Data de término</label>
              <input id="endDate" type="date" className="form-input" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="period-display">
            <div className="period-display__label">Período selecionado</div>
            <div className="period-display__value">
              {formatDateBR(startDate)} a {formatDateBR(endDate)} ({days} dias)
            </div>
          </div>

          <div className="info-panel" style={{ marginTop: 16 }}>
            <strong>Datas já ocupadas</strong>
            {ocupados.length === 0 ? (
              <p style={{ marginTop: 6 }}>Nenhuma reserva ativa para este equipamento.</p>
            ) : (
              <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                {ocupados.map((r) => (
                  <li key={r.id}>{formatDateBR(r.dataInicio)} a {formatDateBR(r.dataFim)} ({r.status})</li>
                ))}
              </ul>
            )}
          </div>
          {/* Feriados do Calendário Acadêmico (AIE) que caem no período escolhido */}
          <div className="info-panel" style={{ marginTop: 16 }} data-testid="painel-feriados">
            <strong>Feriados e recessos no período</strong> <span className="aie-tag">Calendário Acadêmico</span>
            {feriadosNoPeriodo.length === 0 ? (
              <p style={{ marginTop: 6 }}>Nenhum feriado entre as datas escolhidas.</p>
            ) : (
              <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                {feriadosNoPeriodo.map((f) => <li key={f.data}>{formatDateBR(f.data)} – {f.descricao} ({f.tipo})</li>)}
              </ul>
            )}
          </div>
          {feriadoNaRetirada && (
            <ErrorState mensagem={`A retirada cai em ${formatDateBR(feriadoNaRetirada.data)} (${feriadoNaRetirada.descricao}): o laboratório estará fechado.`} />
          )}
          {feriadoNaDevolucao && (
            <ErrorState mensagem={`A devolução cai em ${formatDateBR(feriadoNaDevolucao.data)} (${feriadoNaDevolucao.descricao}): o laboratório estará fechado.`} />
          )}
          {conflito && (
            <ErrorState mensagem={`Conflito: o equipamento já está reservado de ${formatDateBR(conflito.dataInicio)} a ${formatDateBR(conflito.dataFim)}.`} />
          )}
        </section>

        <aside className="reservation-summary">
          <h2 className="section-title" style={{ marginBottom: '18px' }}>Resumo da reserva</h2>
          <div className="summary-box">
            <div className="summary-row"><span className="summary-label">Equipamento</span><span className="summary-value">{equipamento.nome}</span></div>
            <div className="summary-row"><span className="summary-label">Duração</span><span className="summary-value">{days} dias</span></div>
            <div className="summary-row">
              <span className="summary-label">Retirada</span>
              <span className="summary-value"><MapPin size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{equipamento.localNome}</span>
            </div>
          </div>
          <button type="button" className="btn btn-primary btn-block" disabled={Boolean(conflito) || periodoInvalido || bloqueadoPorFeriado}
            onClick={() => navigate(`/equipamento/${id}/confirmar`, { state: { startDate, endDate } })}>
            Continuar
          </button>
        </aside>
      </div>
    </Layout>
  );
}
