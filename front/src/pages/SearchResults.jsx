/*
 * ============================================================
 *  SearchResults.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: João  |  Atividade: Q2 (consulta ao banco com filtro)
 * ------------------------------------------------------------
 *  O que faz: mostra o resultado da busca de equipamentos por nome, categoria ou patrimônio.
 *  O texto vem da URL (?q=...), então a busca pode ser compartilhada/recarregada.
 *  Quem chama: App.jsx, rota /busca (barra de busca e categorias da Home).
 *  Chama: GET /api/equipamentos?busca=...; componente EquipmentCard para cada resultado.
 * ============================================================
 */
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from '../components/Layout';
import EquipmentCard from '../components/EquipmentCard';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';

/** Tela de resultados da busca. */
export default function SearchResults() {
  // useSearchParams: lê os parâmetros da URL; query = valor de ?q=
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const navigate = useNavigate();
  // GET /api/equipamentos?busca=arduino -> EquipamentoController.pesquisar (@GetMapping(params = "busca"))
  //   -> EquipamentoService.pesquisar -> EquipamentoDao.pesquisar
  //   -> SELECT t.*, c.nome AS categoria_nome, ... FROM equipamento t LEFT JOIN categoria c ... LEFT JOIN local l ...
  //      WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.nome ILIKE ? OR c.nome ILIKE ? OR t.patrimonio ILIKE ?)
  //   ILIKE = LIKE sem diferenciar maiúsculas; o termo vai como "%arduino%" no parâmetro "?" (sem concatenar
  //   texto do usuário no SQL, o que evita SQL Injection). Como o caminho muda com a query, o useApi refaz o GET.
  const { dados, carregando, erro } = useApi(`/equipamentos?busca=${encodeURIComponent(query)}`);
  const resultados = dados || [];

  /** Nova busca: troca o ?q= da URL; isso muda o caminho do useApi e dispara um novo GET. */
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/busca?q=${encodeURIComponent(e.target.querySelector('input').value)}`);
  };

  // JSX: título com o termo, nova busca (key={query} recria o input quando a busca muda) e a grade de resultados.
  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Resultados para &apos;{query}&apos;</h1>
        <p className="page-subtitle">{resultados.length} itens encontrados</p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <Search size={20} className="search-bar__icon" />
        <input type="search" className="search-bar__input" defaultValue={query} key={query} placeholder="Buscar equipamentos..." />
      </form>

      {carregando && <LoadingState />}
      <ErrorState mensagem={erro} />
      {!carregando && resultados.length === 0 && <EmptyState>Nenhum equipamento encontrado.</EmptyState>}
      <div className="equipment-grid">
        {resultados.map((eq) => <EquipmentCard key={eq.id} equipamento={eq} />)}
      </div>
    </Layout>
  );
}
