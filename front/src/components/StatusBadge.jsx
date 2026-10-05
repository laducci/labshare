/*
 * ============================================================
 *  StatusBadge.jsx  |  Camada: Front-end (componente visual reutilizável)
 *  Responsável na apresentação: Todos  |  Atividade: Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: mostra um "selo" colorido com o status (texto) de equipamento, reserva, ocorrência,
 *  manutenção, multa ou prioridade. A cor é escolhida pelo texto do status.
 *  Quem chama: EquipmentCard, CrudPage, crudConfigs e várias páginas (listas e detalhes).
 *  Chama: nada (só CSS: classes badge-*).
 * ============================================================
 */
/** Ativo reutilizável: o mesmo badge mostra status de equipamento, reserva, ocorrência, manutenção e multa. */
// Tabela texto do status -> classe CSS de cor. Os textos são os rótulos (getRotulo) dos enums do backend.
const CORES = {
  Disponível: 'badge-success',
  Reservado: 'badge-primary',
  'Em uso': 'badge-warning',
  'Em inspeção': 'badge-primary',
  'Em manutenção': 'badge-warning',
  Indisponível: 'badge-error',
  'Aguardando aprovação': 'badge-primary',
  Agendada: 'badge-primary',
  Finalizada: 'badge-neutral',
  Cancelada: 'badge-error',
  Rejeitada: 'badge-error',
  'Aguardando manutenção': 'badge-warning',
  'Aguardando peça': 'badge-warning',
  Concluída: 'badge-success',
  'Em aberto': 'badge-warning',
  Paga: 'badge-success',
  Alta: 'badge-error',
  Média: 'badge-warning',
  Baixa: 'badge-neutral',
};

// Props: status = texto já traduzido (ex.: "Em uso"). Status desconhecido usa a cor neutra.
export default function StatusBadge({ status }) {
  if (!status) return null;
  return <span className={`badge ${CORES[status] || 'badge-neutral'}`}>{status}</span>;
}
