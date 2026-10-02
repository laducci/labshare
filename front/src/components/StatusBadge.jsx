/** Ativo reutilizável: o mesmo badge mostra status de equipamento, reserva, ocorrência, manutenção e multa. */
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

export default function StatusBadge({ status }) {
  if (!status) return null;
  return <span className={`badge ${CORES[status] || 'badge-neutral'}`}>{status}</span>;
}
