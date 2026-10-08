/*
 * ============================================================
 *  Home.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: João  |  Atividade: Q2 (telas com banco: categorias e equipamentos)
 * ------------------------------------------------------------
 *  O que faz: tela inicial do aluno/professor: barra de busca, categorias (vindas do CRUD de
 *  Categorias), alguns equipamentos disponíveis e a próxima reserva do usuário.
 *  Quem chama: App.jsx, rota /home (rotaInicial depois do login para aluno/professor).
 *  Chama: GET /api/categorias, GET /api/equipamentos, GET /api/reservas/minhas;
 *         navega para /busca?q=..., /equipamentos e /minhas-reservas/:id.
 * ============================================================
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from '../components/Layout';
import CategoryIcon from '../components/CategoryIcon';
import EquipmentCard from '../components/EquipmentCard';
import { ErrorState, LoadingState } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';
import { formatDateBR } from '../utils/format';

/** Tela inicial dos solicitantes (aluno/professor). */
export default function Home() {
  // useState: texto digitado na barra de busca.
  const [query, setQuery] = useState('');
  const { user } = useApp();
  const navigate = useNavigate();
  // Três GETs automáticos (useApi) quando a tela abre:
  //   GET /api/categorias -> CategoriaController.listar (herdado de CrudController) -> CategoriaService.listar
  //     -> CategoriaDao (AbstractDao.listar) -> SELECT t.* FROM categoria t WHERE t.tenant_id = ? AND t.ativo = TRUE ORDER BY t.nome
  //   GET /api/equipamentos -> EquipamentoController.listar -> SELECT t.*, c.nome AS categoria_nome, ... FROM equipamento t
  //     LEFT JOIN categoria c ... LEFT JOIN local l ... WHERE t.tenant_id = ? AND t.ativo = TRUE ORDER BY t.nome
  //   GET /api/reservas/minhas -> ReservaController.minhas -> ReservaService.listarMinhas
  //     -> SELECT ... FROM reserva t ... WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.usuario_id = ?)
  const categorias = useApi('/categorias');        // GET /api/categorias
  const equipamentos = useApi('/equipamentos');    // GET /api/equipamentos
  const reservas = useApi('/reservas/minhas');     // GET /api/reservas/minhas

  // No front: pega até 3 equipamentos "Disponível" e a primeira reserva ainda ativa do usuário.
  const disponiveis = (equipamentos.dados || []).filter((e) => e.status === 'Disponível').slice(0, 4);
  const proxima = (reservas.dados || []).find((r) => ['Em uso', 'Agendada', 'Aguardando aprovação'].includes(r.status));

  /**
   * Envio da busca: e.preventDefault() evita recarregar a página e navigate leva para
   * /busca?q=texto (tela SearchResults, que faz o GET com ILIKE).
   */
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/busca?q=${encodeURIComponent(query.trim())}`);
  };

  // JSX: saudação, busca, grade de categorias (clicar busca pelo nome da categoria),
  // equipamentos disponíveis (EquipmentCard) e, se existir, a próxima reserva.
  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Olá, {user?.primeiroNome}</h1>
        <p className="page-subtitle">Veja o que está disponível hoje.</p>
      </div>

      <form className="search-bar search-bar--hero" onSubmit={handleSearch}>
        <Search size={20} className="search-bar__icon" />
        <input type="search" className="search-bar__input" placeholder="Buscar equipamentos, categorias ou patrimônio..."
          value={query} onChange={(e) => setQuery(e.target.value)} />
      </form>

      <section className="content-section">
        <div className="section-header"><h2 className="section-title">Categorias</h2></div>
        <div className="category-grid">
          {(categorias.dados || []).map((cat) => (
            <div key={cat.id} className="category-card" role="button" tabIndex={0}
              onClick={() => navigate(`/busca?q=${encodeURIComponent(cat.nome)}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/busca?q=${encodeURIComponent(cat.nome)}`)}>
              <div className="category-card__icon"><CategoryIcon name={cat.icone} size={21} /></div>
              <div className="category-card__name">{cat.nome}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">Disponíveis para você</h2>
          <button type="button" className="btn btn-link" onClick={() => navigate('/equipamentos')}>Ver todos</button>
        </div>
        {equipamentos.carregando && <LoadingState />}
        <ErrorState mensagem={equipamentos.erro} onTentarNovamente={equipamentos.recarregar} />
        <div className="equipment-grid">
          {disponiveis.map((eq) => <EquipmentCard key={eq.id} equipamento={eq} />)}
        </div>
      </section>

      {proxima && (
        <section className="content-section">
          <div className="section-header"><h2 className="section-title">Sua próxima reserva</h2></div>
          <div className="card compact-loan">
            {proxima.equipamentoImagem && <img src={proxima.equipamentoImagem} onError={(e) => { e.currentTarget.style.display = "none"; }} alt={proxima.equipamentoNome} className="compact-loan__image" />}
            <div>
              <div className="reservation-card__equipment">{proxima.equipamentoNome}</div>
              <div className="reservation-card__dates">
                {proxima.status} · devolução em {formatDateBR(proxima.dataFim)} · {proxima.localNome}
              </div>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/minhas-reservas/${proxima.id}`)}>
              Ver detalhes
            </button>
          </div>
        </section>
      )}
    </Layout>
  );
}
