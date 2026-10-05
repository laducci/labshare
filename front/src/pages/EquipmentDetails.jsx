/*
 * ============================================================
 *  EquipmentDetails.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Equipamentos - READ de um item)
 * ------------------------------------------------------------
 *  O que faz: mostra os dados de um equipamento (categoria, patrimônio, local, itens
 *  inclusos). Para aluno/professor mostra "Ver disponibilidade" se o equipamento for
 *  reservável (RN01/RN02); para a equipe mostra o histórico de movimentações (RN11/RNF10).
 *  Quem chama: App.jsx, rota /equipamento/:id (EquipmentCard, botão "Ver" da EquipmentList).
 *  Chama: GET /api/equipamentos/{id}, GET /api/historico?entidade=equipamento&entidadeId={id};
 *         navega para /equipamento/:id/disponibilidade e /equipamentos/:id/editar.
 * ============================================================
 */
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';
import { formatDateTimeBR, SOLICITANTES } from '../utils/format';

// RN01/RN02: status em que o equipamento NÃO pode ser reservado (mesma regra de
// Equipamento.podeSerReservado no backend; aqui serve só para esconder o botão).
const NAO_RESERVAVEL = ['Em manutenção', 'Indisponível', 'Em inspeção'];

/** Tela de detalhes. O id vem da URL; o usuário logado vem do AppContext (useApp). */
export default function EquipmentDetails() {
  const { id } = useParams();
  // useApp: lê o contexto global (usuário logado e tenant) definido no login.
  const { user } = useApp();
  const navigate = useNavigate();
  // GET /api/equipamentos/{id} -> EquipamentoController.buscar (herdado de CrudController)
  //   -> EquipamentoService.buscar -> EquipamentoDao.buscarPorId
  //   -> SELECT t.*, c.nome AS categoria_nome, c.icone AS categoria_icone, l.nome AS local_nome
  //      FROM equipamento t LEFT JOIN categoria c ... LEFT JOIN local l ... WHERE t.id = ? AND t.tenant_id = ?
  //   (o "?" é parâmetro do PreparedStatement: evita SQL Injection)
  const { dados: equipamento, carregando, erro } = useApi(`/equipamentos/${id}`);
  const ehEquipe = ['admin', 'tecnico', 'manutencao'].includes(user.perfil);
  // RF25 / RN11: histórico do equipamento (só para a equipe; para aluno passa null e não faz GET).
  //   GET /api/historico?entidade=equipamento&entidadeId={id} -> ConsultaController.historico
  //   -> HistoricoService.listar -> HistoricoDao.listar
  //   -> SELECT h.*, u.nome AS usuario_nome FROM historico h LEFT JOIN usuario u ON u.id = h.usuario_id
  //      WHERE h.tenant_id = ? AND h.entidade = ? AND h.entidade_id = ? ORDER BY h.data_hora DESC LIMIT 200
  const historico = useApi(ehEquipe ? `/historico?entidade=equipamento&entidadeId=${id}` : null);

  if (carregando) return <Layout><LoadingState /></Layout>;
  if (erro || !equipamento) return <Layout><ErrorState mensagem={erro || 'Equipamento não encontrado.'} /></Layout>;

  // Só aluno/professor (SOLICITANTES) reservam, e só se o status permitir (RN01/RN02).
  const podeReservar = SOLICITANTES.includes(user.perfil) && !NAO_RESERVAVEL.includes(equipamento.status);

  // JSX: foto + dados do equipamento; botões aparecem conforme o perfil (RNF05 - autorização
  // por perfil) e, para a equipe, uma tabela com o histórico vindo do banco.
  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Detalhes do equipamento</h1>
        <p className="page-subtitle">Consulte as informações e a disponibilidade do item.</p>
      </div>

      <div className="detail-layout">
        <div>
          {equipamento.imagemUrl && <img src={equipamento.imagemUrl} alt={equipamento.nome} className="detail-image" />}
        </div>
        <div>
          <StatusBadge status={equipamento.status} />
          <h2 className="detail-name">{equipamento.nome}</h2>
          <p className="detail-description">{equipamento.descricao}</p>

          <div className="detail-meta-grid">
            <div className="detail-meta"><span className="detail-meta__label">Categoria</span><span className="detail-meta__value">{equipamento.categoriaNome}</span></div>
            <div className="detail-meta"><span className="detail-meta__label">Patrimônio</span><span className="detail-meta__value">{equipamento.patrimonio || '—'}</span></div>
            <div className="detail-meta"><span className="detail-meta__label">Localização</span><span className="detail-meta__value">{equipamento.localNome || '—'}</span></div>
            <div className="detail-meta"><span className="detail-meta__label">Status</span><span className="detail-meta__value">{equipamento.status}</span></div>
          </div>

          <div className="detail-section included-panel">
            <h3>Itens inclusos</h3>
            <ul className="included-items">
              {equipamento.itensInclusos.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          {podeReservar && (
            <button type="button" className="btn btn-primary btn-block" onClick={() => navigate(`/equipamento/${id}/disponibilidade`)}>
              Ver disponibilidade
            </button>
          )}
          {SOLICITANTES.includes(user.perfil) && !podeReservar && (
            <div className="info-panel">Este equipamento não pode ser reservado no momento ({equipamento.status}).</div>
          )}
          {['admin', 'tecnico'].includes(user.perfil) && (
            <button type="button" className="btn btn-secondary btn-block" onClick={() => navigate(`/equipamentos/${id}/editar`)}>
              Editar equipamento
            </button>
          )}
        </div>
      </div>

      {ehEquipe && (
        <section className="content-section">
          <div className="section-header"><h2 className="section-title">Histórico do equipamento</h2></div>
          {(historico.dados || []).length === 0 ? (
            <div className="empty-state">Sem movimentações registradas.</div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Data</th><th>Ação</th><th>Descrição</th><th>Usuário</th></tr></thead>
                <tbody>
                  {historico.dados.map((h) => (
                    <tr key={h.id}>
                      <td>{formatDateTimeBR(h.dataHora)}</td>
                      <td>{h.acao}</td>
                      <td>{h.descricao}</td>
                      <td>{h.usuarioNome || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </Layout>
  );
}
