import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ErrorState, LoadingState } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';

/** Nomes do banco (enum) -> texto da tela */
const ROTULOS = {
  DISPONIVEL: 'Disponível', RESERVADO: 'Reservado', EM_USO: 'Em uso', EM_INSPECAO: 'Em inspeção',
  EM_MANUTENCAO: 'Em manutenção', INDISPONIVEL: 'Indisponível', AGUARDANDO_APROVACAO: 'Aguardando aprovação',
  AGENDADA: 'Agendada', FINALIZADA: 'Finalizada', CANCELADA: 'Cancelada', REJEITADA: 'Rejeitada',
  ABERTA: 'Aguardando manutenção', ENCERRADA: 'Concluída', EM_ANDAMENTO: 'Em andamento',
  AGUARDANDO_PECA: 'Aguardando peça', CONCLUIDA: 'Concluída',
};

function Bloco({ titulo, contagem }) {
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

/** Indicadores operacionais (GET /api/relatorios/resumo -> SELECT ... GROUP BY status). */
export default function Dashboard() {
  const { tenant } = useApp();
  const navigate = useNavigate();
  const { dados, carregando, erro } = useApi('/relatorios/resumo');

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
