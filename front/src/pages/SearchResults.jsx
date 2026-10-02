import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from '../components/Layout';
import EquipmentCard from '../components/EquipmentCard';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const navigate = useNavigate();
  // GET /api/equipamentos?busca=arduino -> SQL com ILIKE no backend
  const { dados, carregando, erro } = useApi(`/equipamentos?busca=${encodeURIComponent(query)}`);
  const resultados = dados || [];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/busca?q=${encodeURIComponent(e.target.querySelector('input').value)}`);
  };

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
