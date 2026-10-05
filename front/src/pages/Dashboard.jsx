/*
 * ============================================================
 *  Dashboard.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (consulta/relatório no banco)
 * ------------------------------------------------------------
 *  O que faz: indicadores do administrador: quantidade de equipamentos, reservas, ocorrências
 *  e manutenções por status, e os equipamentos mais reservados do cliente.
 *  Quem chama: App.jsx, rotas /admin/dashboard e /admin/relatorios (rotaInicial do admin).
 *  Chama: GET /api/relatorios/resumo; navega para /admin/personalizacao e /equipamentos.
 * ============================================================
 */
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ErrorState, LoadingState } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';

/** Nomes do banco (enum) -> texto da tela. O relatório devolve o valor cru da coluna status. */
const ROTULOS = {
  DISPONIVEL: 'Disponível', RESERVADO: 'Reservado', EM_USO: 'Em uso', EM_INSPECAO: 'Em inspeção',
  EM_MANUTENCAO: 'Em manutenção', INDISPONIVEL: 'Indisponível', AGUARDANDO_APROVACAO: 'Aguardando aprovação',
  AGENDADA: 'Agendada', FINALIZADA: 'Finalizada', CANCELADA: 'Cancelada', REJEITADA: 'Rejeitada',
  ABERTA: 'Aguardando manutenção', ENCERRADA: 'Concluída', EM_ANDAMENTO: 'Em andamento',
  AGUARDANDO_PECA: 'Aguardando peça', CONCLUIDA: 'Concluída',
};

/**
 * Componente interno: um card com a contagem por status.
 * Props: titulo (texto) e contagem (objeto { STATUS: quantidade } vindo do backend).
 */
function Bloco({ titulo, contagem }) {
  // Transforma o objeto em lista de pares [status, quantidade] e soma o total.
  const itens = Object.entries(contagem || {});
  const total = itens.reduce((s, [, v]) => s + v, 0);
  return (
    <div className="card">
      <h3 className="section-title">{titulo} <small style={{ color: 'var(--color-text-muted)' }}>({total})</small></h3>
      {itens.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>Sem registros.</p> : (
        <div className="summary-box">
          {itens.map(([status, qtd]) => (
            <div className="summary-row" key={status}>
              <span className="summary-label">{ROTULOS[status] || status}</span>
              <span className="summary-value">{qtd}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Indicadores operacionais (GET /api/relatorios/resumo -> SELECT ... GROUP BY status).
 */
export default function Dashboard() {
  const { tenant } = useApp();
  const navigate = useNavigate();
  // GET /api/relatorios/resumo -> ConsultaController.resumo -> RelatorioDao (consulta direta, sem Service)
  //   -> SELECT status, COUNT(*) AS total FROM equipamento WHERE tenant_id = ? AND ativo = TRUE GROUP BY status ORDER BY status
  //      (o mesmo para reserva, ocorrencia e manutencao)
  //   -> SELECT e.nome, COUNT(r.id) AS total FROM equipamento e LEFT JOIN reserva r ON r.equipamento_id = e.id
  //      WHERE e.tenant_id = ? AND e.ativo = TRUE GROUP BY e.nome ORDER BY total DESC, e.nome LIMIT 5
  const { dados, carregando, erro } = useApi('/relatorios/resumo');

  // JSX: um Bloco para cada tabela, o card "Mais reservados" e atalhos de navegação.
  return (
    <Layout fullWidth>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral de {tenant.nome}</p>
      </div>
      {carregando && <LoadingState />}
      <ErrorState mensagem={erro} />
      {dados && (
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <Bloco titulo="Equipamentos" contagem={dados.equipamentos} />
          <Bloco titulo="Reservas" contagem={dados.reservas} />
          <Bloco titulo="Ocorrências" contagem={dados.ocorrencias} />
          <Bloco titulo="Manutenções" contagem={dados.manutencoes} />
          <div className="card">
            <h3 className="section-title">Mais reservados</h3>
            <div className="summary-box">
              {Object.entries(dados.maisReservados || {}).map(([nome, qtd]) => (
                <div className="summary-row" key={nome}><span className="summary-label">{nome}</span><span className="summary-value">{qtd}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="button-group" style={{ marginTop: 24 }}>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/personalizacao')}>Personalização por cliente</button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/equipamentos')}>Equipamentos</button>
      </div>
    </Layout>
  );
}
