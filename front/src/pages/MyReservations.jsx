/*
 * ============================================================
 *  MyReservations.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Reservas - READ das reservas do usuário)
 * ------------------------------------------------------------
 *  O que faz: lista as reservas do usuário logado, separadas em abas (Próximas, Em uso,
 *  Finalizadas, Canceladas). Com a prop somenteHistorico vira a tela de Histórico (reuso).
 *  Quem chama: App.jsx, rotas /minhas-reservas e /historico (esta com somenteHistorico).
 *  Chama: GET /api/reservas/minhas; navega para /minhas-reservas/:id (ReservationDetail).
 * ============================================================
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { formatDateBR } from '../utils/format';

// Cada aba agrupa um ou mais status de reserva (rótulos que o backend devolve no JSON).
const ABAS = {
  Próximas: ['Agendada', 'Aguardando aprovação'],
  'Em uso': ['Em uso'],
  Finalizadas: ['Finalizada'],
  Canceladas: ['Cancelada', 'Rejeitada'],
};

/**
 * Props: somenteHistorico (true na rota /historico) muda título e abas, reaproveitando a mesma tela.
 */
export default function MyReservations({ somenteHistorico = false }) {
  // useState: qual aba está selecionada.
  const [aba, setAba] = useState(somenteHistorico ? 'Finalizadas' : 'Próximas');
  const navigate = useNavigate();
  // GET /api/reservas/minhas -> ReservaController.minhas -> ReservaService.listarMinhas
  //   -> ReservaDao.listarDoUsuario -> SELECT t.*, u.nome AS usuario_nome, e.nome AS equipamento_nome, ...
  //      FROM reserva t JOIN usuario u ... JOIN equipamento e ... WHERE t.tenant_id = ? AND t.ativo = TRUE
  //      AND (t.usuario_id = ?) ORDER BY t.data_inicio DESC
  // O usuario_id vem do cabeçalho X-Usuario-Id (services/api.js), não da URL.
  const { dados, carregando, erro, recarregar } = useApi('/reservas/minhas');   // GET /api/reservas/minhas
  // Filtra no front as reservas da aba atual; "abas" define quais botões de aba aparecem.
  const lista = (dados || []).filter((r) => ABAS[aba].includes(r.status));
  const abas = somenteHistorico ? ['Finalizadas', 'Canceladas'] : Object.keys(ABAS);

  // JSX: abas com contador e um card por reserva; clicar no card abre o detalhe da reserva.
  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">{somenteHistorico ? 'Histórico' : 'Minhas reservas'}</h1>
        <p className="page-subtitle">
          {somenteHistorico ? 'Empréstimos anteriores.' : 'Acompanhe seus agendamentos e empréstimos.'}
        </p>
      </div>

      <div className="tabs">
        {abas.map((tab) => (
          <button key={tab} type="button" className={`tab ${aba === tab ? 'active' : ''}`} onClick={() => setAba(tab)}>
            {tab} ({(dados || []).filter((r) => ABAS[tab].includes(r.status)).length})
          </button>
        ))}
      </div>

      {carregando && <LoadingState />}
      <ErrorState mensagem={erro} onTentarNovamente={recarregar} />
      {!carregando && lista.length === 0 && <EmptyState>Nenhuma reserva nesta categoria.</EmptyState>}

      {lista.map((r) => (
        <div key={r.id} className="reservation-card card-clickable" role="button" tabIndex={0}
          onClick={() => navigate(`/minhas-reservas/${r.id}`)}
          onKeyDown={(e) => e.key === 'Enter' && navigate(`/minhas-reservas/${r.id}`)}>
          <div className="reservation-row">
            <div>
              <div className="reservation-card__equipment">{r.equipamentoNome}</div>
              <div className="reservation-card__dates">{r.localNome}</div>
            </div>
            <div className="reservation-card__dates">{formatDateBR(r.dataInicio)} a {formatDateBR(r.dataFim)}</div>
            <StatusBadge status={r.status} />
            <button type="button" className="btn btn-secondary btn-sm"
              onClick={(event) => { event.stopPropagation(); navigate(`/minhas-reservas/${r.id}`); }}>
              Ver detalhes
            </button>
          </div>
        </div>
      ))}
    </Layout>
  );
}
