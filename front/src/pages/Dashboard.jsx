/*
 * ============================================================
 *  Dashboard.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (consulta/relatório no banco)
 * ------------------------------------------------------------
 *  O que faz: tela inicial do administrador. Mostra 4 indicadores no topo, a distribuição
 *  por situação de equipamentos, reservas, ocorrências e manutenções, os equipamentos mais
 *  reservados e atalhos para as tarefas mais comuns.
 *  Quem chama: App.jsx, rota /admin/dashboard (rotaInicial do admin).
 *  Chama: GET /api/relatorios/resumo; navega para relatórios, equipamentos e configuração.
 * ============================================================
 */
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, BarChart3, CalendarClock, Database, PackageCheck, PackagePlus, SlidersHorizontal, Wrench,
} from 'lucide-react';
import Layout from '../components/Layout';
import { ErrorState, LoadingState } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';

/** Nomes do banco (enum) -> texto da tela e cor da barra. O relatório devolve o valor cru da coluna status. */
const SITUACOES = {
  DISPONIVEL: ['Disponível', '#5fa36a'],
  RESERVADO: ['Reservado', '#3d7ea6'],
  EM_USO: ['Em uso', '#0f3d4c'],
  EM_INSPECAO: ['Em inspeção', '#8fb3c4'],
  EM_MANUTENCAO: ['Em manutenção', '#d4a23c'],
  INDISPONIVEL: ['Indisponível', '#c96a62'],
  AGUARDANDO_APROVACAO: ['Aguardando aprovação', '#8fb3c4'],
  AGENDADA: ['Agendada', '#3d7ea6'],
  FINALIZADA: ['Finalizada', '#5fa36a'],
  CANCELADA: ['Cancelada', '#b7c2c7'],
  REJEITADA: ['Rejeitada', '#c96a62'],
  ABERTA: ['Aguardando manutenção', '#d4a23c'],
  ENCERRADA: ['Concluída', '#5fa36a'],
  EM_ANDAMENTO: ['Em andamento', '#3d7ea6'],
  AGUARDANDO_PECA: ['Aguardando peça', '#d4a23c'],
  CONCLUIDA: ['Concluída', '#5fa36a'],
};

/**
 * Componente interno: card com a contagem por situação, uma barra empilhada e a legenda.
 * Props: titulo (texto) e contagem (objeto { STATUS: quantidade } vindo do backend).
 */
function Distribuicao({ titulo, contagem }) {
  // Transforma o objeto em lista de pares [status, quantidade] e soma o total.
  const itens = Object.entries(contagem || {}).filter(([, v]) => v > 0);
  const total = itens.reduce((s, [, v]) => s + v, 0);
  return (
    <div className="card">
      <div className="section-header">
        <h2 className="section-title">{titulo}</h2>
        <span className="badge badge-neutral">{total}</span>
      </div>
      {total === 0 ? <p className="page-subtitle">Nenhum registro ainda.</p> : (
        <>
          <div className="status-bar" aria-hidden="true">
            {itens.map(([status, qtd]) => (
              <span key={status} style={{ width: `${(qtd / total) * 100}%`, background: (SITUACOES[status] || [])[1] || '#b7c2c7' }} />
            ))}
          </div>
          <ul className="status-legend">
            {itens.map(([status, qtd]) => (
              <li className="status-legend__item" key={status}>
                <span className="status-legend__dot" style={{ background: (SITUACOES[status] || [])[1] || '#b7c2c7' }} />
                {(SITUACOES[status] || [status])[0]}
                <span className="status-legend__value">{qtd}</span>
              </li>
            ))}
          </ul>
        </>
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

  // Indicadores do topo: somas feitas aqui a partir das contagens por situação.
  const conta = (grupo, ...status) => status.reduce((s, st) => s + ((dados?.[grupo] || {})[st] || 0), 0);
  const totalEquip = Object.values(dados?.equipamentos || {}).reduce((s, v) => s + v, 0);
  const indicadores = dados ? [
    { rotulo: `disponíveis de ${totalEquip} equipamentos`, valor: conta('equipamentos', 'DISPONIVEL'), icone: PackageCheck },
    { rotulo: 'empréstimos em andamento', valor: conta('reservas', 'EM_USO'), icone: CalendarClock },
    { rotulo: 'reservas aguardando retirada', valor: conta('reservas', 'AGENDADA', 'AGUARDANDO_APROVACAO'), icone: CalendarClock },
    { rotulo: 'ocorrências aguardando reparo', valor: conta('ocorrencias', 'ABERTA'), icone: AlertTriangle, alerta: conta('ocorrencias', 'ABERTA') > 0 },
  ] : [];
  const maisReservados = Object.entries(dados?.maisReservados || {});
  const maiorQtd = Math.max(1, ...maisReservados.map(([, q]) => q));

  // Atalhos para as tarefas mais comuns do administrador.
  const atalhos = [
    { rotulo: 'Cadastrar equipamento', desc: 'Adicionar um item ao acervo', icone: PackagePlus, rota: '/equipamentos/novo' },
    { rotulo: 'Relatórios', desc: 'Utilização, atrasos, inventário e manutenção', icone: BarChart3, rota: '/relatorios' },
    { rotulo: 'Manutenções', desc: 'Ocorrências e reparos em andamento', icone: Wrench, rota: '/manutencao/painel' },
    { rotulo: 'Sistemas externos', desc: 'Dados consultados de outros sistemas', icone: Database, rota: '/admin/integracoes' },
    { rotulo: 'Personalização', desc: 'Recursos ligados para este cliente', icone: SlidersHorizontal, rota: '/admin/personalizacao' },
  ];

  // JSX: faixa de indicadores, distribuições por situação, mais reservados e atalhos.
  return (
    <Layout fullWidth>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Situação atual do acervo e dos empréstimos de {tenant.nome}.</p>
      </div>
      {carregando && <LoadingState />}
      <ErrorState mensagem={erro} />
      {dados && (
        <>
          <div className="metric-grid">
            {indicadores.map(({ rotulo, valor, icone: Icone, alerta }) => (
              <div key={rotulo} className={`metric-card ${alerta ? 'metric-card--alerta' : ''}`}>
                <span className="metric-card__icon"><Icone size={18} /></span>
                <span>
                  <span className="metric-card__value">{valor}</span>
                  <span className="metric-card__label">{rotulo}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="dashboard-grid">
            <Distribuicao titulo="Equipamentos" contagem={dados.equipamentos} />
            <Distribuicao titulo="Reservas" contagem={dados.reservas} />
            <Distribuicao titulo="Ocorrências" contagem={dados.ocorrencias} />
            <Distribuicao titulo="Manutenções" contagem={dados.manutencoes} />

            <div className="card">
              <h2 className="section-title">Mais reservados</h2>
              <ul className="status-legend">
                {maisReservados.map(([nome, qtd]) => (
                  <li key={nome}>
                    <div className="status-legend__item">
                      {nome}<span className="status-legend__value">{qtd}</span>
                    </div>
                    <div className="bar-cell__track" style={{ marginTop: 4 }}>
                      <div className="bar-cell__fill" style={{ width: `${(qtd / maiorQtd) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2 className="section-title">Atalhos</h2>
              <div className="shortcut-list">
                {atalhos.map(({ rotulo, desc, icone: Icone, rota }) => (
                  <button key={rota} type="button" className="shortcut-item" onClick={() => navigate(rota)}>
                    <Icone size={18} />
                    <span>{rotulo}<small>{desc}</small></span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
