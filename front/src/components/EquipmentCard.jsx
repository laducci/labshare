import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

/** Ativo reutilizável: cartão de equipamento (Home, Busca, Catálogo). */
export default function EquipmentCard({ equipamento }) {
  const navigate = useNavigate();
  return (
    <article className="equipment-card">
      <div className="equipment-card__image-wrap">
        {equipamento.imagemUrl && <img className="equipment-card__image" src={equipamento.imagemUrl} alt={equipamento.nome} />}
      </div>
      <div className="equipment-card__body">
        <div className="equipment-card__top">
          <h3 className="equipment-card__name">{equipamento.nome}</h3>
          <StatusBadge status={equipamento.status} />
        </div>
        <p className="equipment-card__category">{equipamento.categoriaNome}</p>
        <p className="equipment-card__location"><MapPin size={14} />{equipamento.localNome || '—'}</p>
        <button type="button" className="btn btn-secondary btn-block equipment-card__action"
          onClick={() => navigate(`/equipamento/${equipamento.id}`)}>
          Ver detalhes
        </button>
      </div>
    </article>
  );
}
