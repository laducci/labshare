import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { LATE_FEES } from '../data/mockData';

export default function LateFeePanel() {
  return (
    <Layout fullWidth>
      <h1 className="page-title">Multas por atraso</h1>
      <p className="page-subtitle">Disponível apenas para o cliente Escola Técnica</p>

      <div className="empty-state" style={{ background: 'var(--color-bg)', textAlign: 'left', marginBottom: '1.5rem' }}>
        <strong>Personalização deste cliente:</strong> a Escola Técnica optou por cobrar
        uma multa proporcional aos dias de atraso na devolução. Este módulo é ativado
        apenas para o plano deste cliente e não aparece para a Universidade nem para a
        Empresa Corporativa.
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Equipamento</th>
            <th>Dias de atraso</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {LATE_FEES.map((fee) => (
            <tr key={fee.id}>
              <td>{fee.student}</td>
              <td>{fee.equipmentName}</td>
              <td>{fee.daysLate}</td>
              <td>{fee.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td><StatusBadge status={fee.status === 'Paga' ? 'Concluída' : 'Aguardando manutenção'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
