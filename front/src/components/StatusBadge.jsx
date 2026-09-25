export default function StatusBadge({ status }) {
  const map = {
    Disponível: 'badge-success',
    'Em uso': 'badge-warning',
    Agendada: 'badge-primary',
    Finalizada: 'badge-neutral',
    Cancelada: 'badge-error',
    Indisponível: 'badge-error',
    Reservado: 'badge-primary',
    'Em manutenção': 'badge-warning',
    'Aguardando manutenção': 'badge-warning',
    'Aguardando peça': 'badge-warning',
    'Aguardando aprovação': 'badge-primary',
    Pendente: 'badge-warning',
    Aprovada: 'badge-success',
    Rejeitada: 'badge-error',
    'Em aberto': 'badge-warning',
    Paga: 'badge-success',
    Concluída: 'badge-success',
  };

  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
}
