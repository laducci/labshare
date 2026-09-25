import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { USERS } from '../data/mockData';
import { useApp, getEquipmentById } from '../context/AppContext';

export default function MaintenancePanel() {
  const { occurrence, equipments } = useApp();
  const navigate = useNavigate();
  const equipment = getEquipmentById('arduino-uno', equipments);

  const hasMaintenance =
    occurrence ||
    equipment?.status === 'Em manutenção' ||
    equipments.some((eq) => eq.id === 'arduino-uno' && eq.status === 'Em manutenção');

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Manutenções</h1>
        <p className="page-subtitle">{USERS.fernanda.name} · Acompanhe ocorrências e reparos.</p>
      </div>

      <div className="filters-bar">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" defaultValue="">
            <option value="">Todos</option>
            <option>Aguardando manutenção</option>
            <option>Em manutenção</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Prioridade</label>
          <select className="form-select" defaultValue="">
            <option value="">Todas</option>
            <option>Média</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Responsável</label>
          <select className="form-select" defaultValue="">
            <option value="">Todos</option>
            <option>{USERS.fernanda.name}</option>
          </select>
        </div>
      </div>

      {hasMaintenance ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipamento</th>
                <th>Problema</th>
                <th>Data</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Responsável</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="table-equipment">
                    <img src={equipment?.image} alt="" />
                    {equipment?.name}
                  </div>
                </td>
                <td>{occurrence?.problem || 'Sensor ultrassônico com falha no Trigger.'}</td>
                <td>{occurrence?.date || '22/08/2025'}</td>
                <td><span className="badge badge-warning">Média</span></td>
                <td><StatusBadge status="Aguardando manutenção" /></td>
                <td>{occurrence?.responsible || 'A definir'}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/manutencao/equipamento/arduino-uno')}
                  >
                    Iniciar manutenção
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">Nenhum equipamento aguardando manutenção.</div>
      )}
    </Layout>
  );
}
