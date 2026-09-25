import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import Layout from '../components/Layout';
import CategoryIcon from '../components/CategoryIcon';
import StatusBadge from '../components/StatusBadge';
import { CATEGORIES } from '../data/mockData';
import { formatDateBR, getEquipmentById, useApp } from '../context/AppContext';

export default function Home() {
  const [query, setQuery] = useState('');
  const { user, setSearchQuery, equipments, reservation } = useApp();
  const navigate = useNavigate();
  const available = equipments.filter((equipment) => equipment.status === 'Disponível').slice(0, 3);
  const reservedEquipment = reservation
    ? getEquipmentById(reservation.equipmentId, equipments)
    : null;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim() || 'Arduino';
    setSearchQuery(q);
    navigate(`/busca?q=${encodeURIComponent(q)}`);
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Olá, {user?.firstName}</h1>
        <p className="page-subtitle">Veja o que está disponível hoje.</p>
      </div>

      <form className="search-bar search-bar--hero" onSubmit={handleSearch}>
        <Search size={20} className="search-bar__icon" />
        <input
          type="search"
          className="search-bar__input"
          placeholder="Buscar equipamentos, categorias ou patrimônio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">Categorias</h2>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => navigate(`/busca?q=${encodeURIComponent(cat.name)}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/busca?q=${encodeURIComponent(cat.name)}`)}
            >
              <div className="category-card__icon">
                <CategoryIcon name={cat.icon} size={21} />
              </div>
              <div className="category-card__name">{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">Disponíveis para você</h2>
          <button type="button" className="btn btn-link" onClick={() => navigate('/equipamentos')}>
            Ver todos
          </button>
        </div>
        <div className="equipment-grid">
          {available.map((equipment) => (
            <article className="equipment-card" key={equipment.id}>
              <div className="equipment-card__image-wrap">
                <img className="equipment-card__image" src={equipment.image} alt={equipment.name} />
              </div>
              <div className="equipment-card__body">
                <div className="equipment-card__top">
                  <h3 className="equipment-card__name">{equipment.name}</h3>
                  <StatusBadge status={equipment.status} />
                </div>
                <p className="equipment-card__category">{equipment.category}</p>
                <p className="equipment-card__location">
                  <MapPin size={14} />
                  {equipment.local}
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-block equipment-card__action"
                  onClick={() => navigate(`/equipamento/${equipment.id}`)}
                >
                  Ver detalhes
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {reservation && reservedEquipment && (
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">Próxima devolução</h2>
          </div>
          <div className="card compact-loan">
            <img
              src={reservedEquipment.image}
              alt={reservedEquipment.name}
              className="compact-loan__image"
            />
            <div>
              <div className="reservation-card__equipment">{reservedEquipment.name}</div>
              <div className="reservation-card__dates">
                Devolução em {formatDateBR(reservation.endDate)} · {reservedEquipment.local}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/minhas-reservas/detalhe')}
            >
              Ver detalhes
            </button>
          </div>
        </section>
      )}
    </Layout>
  );
}
