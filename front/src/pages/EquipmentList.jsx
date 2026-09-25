import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Search } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { CATEGORIES, STATUS_OPTIONS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function EquipmentList() {
  const { equipments, user } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const locations = [...new Set(equipments.map((eq) => eq.local))];
  const canManage = ['admin', 'tecnico'].includes(user?.role);

  const filtered = equipments.filter((eq) => {
    const matchSearch =
      !search ||
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.patrimonio.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || eq.category === categoryFilter;
    const matchStatus = !statusFilter || eq.status === statusFilter;
    const matchLocation = !locationFilter || eq.local === locationFilter;
    return matchSearch && matchCategory && matchStatus && matchLocation;
  });

  const handleDeactivate = (id) => {
    if (window.confirm('Deseja desativar este equipamento?')) {
      // prototype: no-op or could update status
    }
  };

  return (
    <Layout fullWidth>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Equipamentos</h1>
          <p className="page-subtitle">Encontre e reserve equipamentos disponíveis.</p>
        </div>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={() => navigate('/equipamentos/novo')}>
            <Plus size={18} />
            Novo equipamento
          </button>
        )}
      </div>

      <div className="filters-bar">
        <div className="form-group search-filter">
          <label className="form-label">Busca</label>
          <div className="form-input-wrapper">
            <input
              type="search"
              className="form-input"
              placeholder="Nome ou patrimônio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <Search size={18} style={{ position: 'absolute', left: 13, top: 14, color: 'var(--color-text-muted)' }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Categoria</label>
          <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Localização</label>
          <select className="form-select" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="">Todos</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {canManage ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipamento</th>
                <th>Patrimônio</th>
                <th>Categoria</th>
                <th>Local</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq) => (
                <tr key={eq.id}>
                  <td>
                    <div className="table-equipment">
                      <img src={eq.image} alt="" />
                      {eq.name}
                    </div>
                  </td>
                  <td>{eq.patrimonio}</td>
                  <td>{eq.category}</td>
                  <td>{eq.local}</td>
                  <td><StatusBadge status={eq.status} /></td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn btn-link btn-sm" onClick={() => navigate(`/equipamento/${eq.id}`)}>
                        Ver
                      </button>
                      <button type="button" className="btn btn-link btn-sm" onClick={() => navigate(`/equipamentos/${eq.id}/editar`)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-link btn-sm" onClick={() => handleDeactivate(eq.id)}>
                        Desativar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="equipment-grid">
          {filtered.map((eq) => (
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
                <p className="equipment-card__location"><MapPin size={14} />{eq.local}</p>
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
      )}
    </Layout>
  );
}
