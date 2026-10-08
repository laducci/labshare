/*
 * ============================================================
 *  EquipmentCard.jsx  |  Camada: Front-end (componente visual reutilizável)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Equipamentos), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: cartão de um equipamento (foto, nome, status, categoria, local e botão "Ver detalhes").
 *  O mesmo cartão é usado em várias telas, recebendo o equipamento por props.
 *  Quem chama: Home, SearchResults, EquipmentList (catálogo).
 *  Chama: StatusBadge, FotoEquipamento; navigate -> /equipamento/:id (EquipmentDetails).
 * ============================================================
 */
import { MapPin } from 'lucide-react';
import FotoEquipamento from './FotoEquipamento';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

/** Ativo reutilizável: cartão de equipamento (Home, Busca, Catálogo). */
// Props: equipamento = objeto vindo de GET /api/equipamentos (com categoriaNome e localNome já
// preenchidos pelo JOIN no EquipamentoDao). O botão usa navigate para abrir a tela de detalhes.
export default function EquipmentCard({ equipamento }) {
  const navigate = useNavigate();
  return (
    <article className="equipment-card">
      <div className="equipment-card__image-wrap">
        {/* Foto ou, se não houver, um ícone no lugar (FotoEquipamento). */}
        <FotoEquipamento src={equipamento.imagemUrl} alt={equipamento.nome} className="equipment-card__image" tamanhoIcone={34} />
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
