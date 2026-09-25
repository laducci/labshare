import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApp, getEquipmentById } from '../context/AppContext';

export default function MaintenanceComplete() {
  const { equipments } = useApp();
  const navigate = useNavigate();
  const equipment = getEquipmentById('arduino-uno', equipments);

  return (
    <Layout>
      <div className="alert alert-success">Manutenção concluída com sucesso.</div>

      <div className="card" style={{ maxWidth: '480px' }}>
        <div className="summary-box">
          <div className="summary-row">
            <span className="summary-label">Equipamento</span>
            <span className="summary-value">{equipment?.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Status</span>
            <span><StatusBadge status={equipment?.status || 'Disponível'} /></span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => navigate('/equipamentos')}
        >
          Voltar aos equipamentos
        </button>
      </div>
    </Layout>
  );
}
