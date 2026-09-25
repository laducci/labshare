import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApp, getEquipmentById } from '../context/AppContext';

export default function EquipmentDetails() {
  const { id } = useParams();
  const { equipments } = useApp();
  const navigate = useNavigate();
  const equipment = getEquipmentById(id, equipments);

  if (!equipment) {
    return (
      <Layout>
        <p>Equipamento não encontrado.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Detalhes do equipamento</h1>
        <p className="page-subtitle">Consulte as informações e a disponibilidade do item.</p>
      </div>

      <div className="detail-layout">
        <div>
          <img src={equipment.image} alt={equipment.name} className="detail-image" />
        </div>
        <div>
          <StatusBadge status={equipment.status} />
          <h2 className="detail-name">{equipment.name}</h2>
          <p className="detail-description">{equipment.description}</p>

          <div className="detail-meta-grid">
            <div className="detail-meta">
              <span className="detail-meta__label">Categoria</span>
              <span className="detail-meta__value">{equipment.category}</span>
            </div>
            <div className="detail-meta">
              <span className="detail-meta__label">Patrimônio</span>
              <span className="detail-meta__value">{equipment.patrimonio}</span>
            </div>
            <div className="detail-meta">
              <span className="detail-meta__label">Localização</span>
              <span className="detail-meta__value">{equipment.local}</span>
            </div>
            <div className="detail-meta">
              <span className="detail-meta__label">Status</span>
              <span className="detail-meta__value">{equipment.status}</span>
            </div>
          </div>

          <div className="detail-section included-panel">
            <h3>Itens inclusos</h3>
            <ul className="included-items">
              {equipment.includedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {equipment.status === 'Disponível' && (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => navigate(`/equipamento/${id}/disponibilidade`)}
            >
              Ver disponibilidade
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
