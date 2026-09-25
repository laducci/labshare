import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApp, getEquipmentById } from '../context/AppContext';

export default function Occurrence() {
  const { occurrence, equipments } = useApp();
  const navigate = useNavigate();
  const equipment = getEquipmentById('arduino-uno', equipments);

  const data = occurrence || {
    equipmentId: 'arduino-uno',
    problem: 'Sensor ultrassônico com falha no Trigger.',
    date: '22/08/2025',
    status: 'Aguardando manutenção',
    responsible: 'A definir',
  };

  return (
    <Layout>
      <h1 className="page-title">Ocorrência registrada</h1>

      <div className="card" style={{ maxWidth: '520px' }}>
        <div className="summary-box">
          <div className="summary-row">
            <span className="summary-label">Equipamento</span>
            <span className="summary-value">{equipment?.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Problema</span>
            <span className="summary-value">{data.problem}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Data</span>
            <span className="summary-value">{data.date}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Status</span>
            <span><StatusBadge status={data.status} /></span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Responsável</span>
            <span className="summary-value">{data.responsible}</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => navigate('/manutencao/painel')}
        >
          Encaminhar para manutenção
        </button>
      </div>
    </Layout>
  );
}
