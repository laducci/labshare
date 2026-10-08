/*
 * ============================================================
 *  TechnicianPanel.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (fluxo de retirada/devolução), Q3 (um componente para 3 rotas)
 * ------------------------------------------------------------
 *  O que faz: painel do técnico: lista reservas "Agendada" (a retirar) e "Em uso" (a devolver),
 *  mostra indicadores (atrasadas, ocorrências abertas) e permite enviar lembretes (RN12).
 *  Quem chama: App.jsx, rotas /tecnico/painel, /tecnico/retiradas e /tecnico/devolucoes (prop filtro).
 *  Chama: GET /api/reservas?status=AGENDADA,EM_USO, GET /api/ocorrencias/abertas, POST /api/notificacoes/lembretes;
 *         navega para /tecnico/retirada/:id (RegisterPickup) e /tecnico/devolucao/:id (RegisterReturn).
 * ============================================================
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, BellRing, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState, SuccessMessage } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR, isoDate } from '../utils/format';

/**
 * Painel do técnico. O mesmo componente atende 3 rotas (reuso):
 *  /tecnico/painel (tudo), /tecnico/retiradas (só agendadas), /tecnico/devolucoes (só em uso)
 */
export default function TechnicianPanel({ filtro = 'todos' }) {
  const { user } = useApp();
  const navigate = useNavigate();
  // GET /api/reservas?status=AGENDADA,EM_USO -> ReservaController.porStatus (@GetMapping(params = "status"))
  //   -> ReservaService.listarPorStatus -> ReservaDao.listarPorStatus
  //   -> SELECT t.*, u.nome AS usuario_nome, e.nome AS equipamento_nome, ... FROM reserva t ...
  //      WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.status IN (?, ?)) ORDER BY t.data_inicio DESC
  const { dados, carregando, erro, recarregar } = useApi('/reservas?status=AGENDADA,EM_USO');
  // Indicador "Ocorrências abertas": GET /api/ocorrencias/abertas -> OcorrenciaController.abertas
  //   -> OcorrenciaService.listarAbertas -> SELECT t.*, e.nome AS equipamento_nome, ... FROM ocorrencia t
  //      JOIN equipamento e ... WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.status = 'ABERTA')
  const ocorrencias = useApi('/ocorrencias/abertas');
  // Estado: mensagem mostrada depois de enviar os lembretes.
  const [mensagem, setMensagem] = useState(null);

  // Separação feita no front: agendadas (a retirar), emUso (a devolver) e atrasadas (fim antes de hoje).
  // "lista" é o que a tabela mostra, de acordo com a rota (prop filtro).
  const reservas = dados || [];
  const hoje = isoDate(0);
  const agendadas = reservas.filter((r) => r.status === 'Agendada');
  const emUso = reservas.filter((r) => r.status === 'Em uso');
  const atrasadas = emUso.filter((r) => r.dataFim < hoje);
  const lista = filtro === 'retiradas' ? agendadas : filtro === 'devolucoes' ? emUso : reservas;

  /**
   * Botão "Enviar lembretes de devolução" (RN12):
   *   POST /api/notificacoes/lembretes -> NotificacaoController.enviarLembretes
   *   -> NotificacaoService.enviarLembretesDeDevolucao -> SELECT das reservas "Em uso" do cliente
   *   -> LembreteDevolucao.enviar (Template Method de NotificacaoTemplate) para as que vencem até amanhã
   *   -> INSERT INTO notificacao (tenant_id, ativo, usuario_id, titulo, mensagem, lida, data_criacao) VALUES (?, ...)
   */
  const enviarLembretes = async () => {
    try {
      const r = await api.post('/notificacoes/lembretes');
      setMensagem(`${r.enviados} lembrete(s) de devolução enviado(s).`);
    } catch (e) {
      setMensagem(e.message);
    }
  };

  // Título da página conforme a rota usada.
  const titulos = { todos: 'Painel do Técnico', retiradas: 'Retiradas pendentes', devolucoes: 'Devoluções previstas' };

  // JSX: cabeçalho com botão de lembretes, cartões de indicadores (só no painel completo) e a tabela.
  // Na tabela o botão muda: "Agendada" -> Registrar retirada; "Em uso" -> Registrar devolução.
  return (
    <Layout fullWidth>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{titulos[filtro]}</h1>
          <p className="page-subtitle">{user.nome} · Operações do laboratório</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={enviarLembretes}>
          <BellRing size={18} /> Enviar lembretes de devolução
        </button>
      </div>
      <SuccessMessage mensagem={mensagem} />

      {filtro === 'todos' && (
        <div className="metric-grid">
          {[
            { label: 'Retiradas pendentes', value: agendadas.length, icon: ArrowDownToLine },
            { label: 'Equipamentos em uso', value: emUso.length, icon: ArrowUpFromLine },
            { label: 'Devoluções atrasadas', value: atrasadas.length, icon: Clock },
            { label: 'Ocorrências abertas', value: (ocorrencias.dados || []).length, icon: AlertTriangle },
          ].map(({ label, value, icon: Icon }) => (
            <div className="metric-card" key={label}>
              <span className="metric-card__icon"><Icon size={19} /></span>
              <span>
                <strong className="metric-card__value">{value}</strong>
                <span className="metric-card__label">{label}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <section className="content-section">
        {carregando && <LoadingState />}
        <ErrorState mensagem={erro} onTentarNovamente={recarregar} />
        {!carregando && lista.length === 0 && <EmptyState>Nenhuma reserva aguardando ação.</EmptyState>}
        {lista.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Usuário</th><th>Equipamento</th><th>Período</th><th>Status</th><th className="col-acoes">Ação</th></tr>
              </thead>
              <tbody>
                {lista.map((r) => (
                  <tr key={r.id}>
                    <td>{r.usuarioNome}</td>
                    <td>{r.equipamentoNome}</td>
                    <td>
                      {formatDateBR(r.dataInicio)} a {formatDateBR(r.dataFim)}
                      {r.status === 'Em uso' && r.dataFim < hoje && <span className="badge badge-error" style={{ marginLeft: 6 }}>Atrasada</span>}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="col-acoes">
                      {r.status === 'Agendada' ? (
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate(`/tecnico/retirada/${r.id}`)}>
                          Registrar retirada
                        </button>
                      ) : (
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate(`/tecnico/devolucao/${r.id}`)}>
                          Registrar devolução
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}
