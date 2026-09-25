import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

const ARDUINO_RESULTS = ['arduino-uno', 'arduino-mega', 'arduino-shield'];

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get('q') || 'Arduino';
  const { equipments, setSearchQuery } = useApp();
  const navigate = useNavigate();

  const displayResults =
    query.toLowerCase().includes('arduino') || query === 'Eletrônica'
      ? equipments.filter((eq) => ARDUINO_RESULTS.includes(eq.id))
      : equipments.filter(
          (eq) =>
            eq.name.toLowerCase().includes(query.toLowerCase()) ||
            eq.category.toLowerCase().includes(query.toLowerCase())
        );

  const handleSearch = (e) => {
    e.preventDefault();
    const form = e.target;
    const q = form.querySelector('input').value;
    setSearchQuery(q);
    navigate(`/busca?q=${encodeURIComponent(q)}`);
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Resultados para &apos;{query}&apos;</h1>
        <p className="page-subtitle">{displayResults.length} itens encontrados</p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <Search size={20} className="search-bar__icon" />
        <input
          type="search"
          className="search-bar__input"
          defaultValue={query}
          placeholder="Buscar equipamentos..."
        />
      </form>

      <div className="equipment-grid">
        {displayResults.map((eq) => (
          <article className="equipment-card" key={eq.id}>
            <div className="equipment-card__image-wrap">
              <img className="equipment-card__image" src={eq.image} alt={eq.name} />
            </div>
            <div className="equipment-card__body">
              <div className="equipment-card__top">
                <h2 className="equipment-card__name">{eq.name}</h2>
                <StatusBadge status={eq.status} />
              </div>
              <p className="equipment-card__category">{eq.category}</p>
              <p className="equipment-card__location">
                <MapPin size={14} />
                {eq.local}
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-block equipment-card__action"
                onClick={() => navigate(`/equipamento/${eq.id}`)}
              >
                Ver detalhes
              </button>
            </div>
          </article>
        ))}
      </div>
    </Layout>
  );
}
