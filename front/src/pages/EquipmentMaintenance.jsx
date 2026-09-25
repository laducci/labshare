import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { USERS, STATUS_OPTIONS } from '../data/mockData';
import { useApp, getEquipmentById } from '../context/AppContext';

export default function EquipmentMaintenance() {
  const { id } = useParams();
  const { occurrence, equipments, completeMaintenance: finish } = useApp();
  const navigate = useNavigate();
  const equipment = getEquipmentById(id, equipments);

  const [repairDescription, setRepairDescription] = useState('');
  const [parts, setParts] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('2025-08-23');
  const [responsible, setResponsible] = useState(USERS.fernanda.name);
  const [status, setStatus] = useState('Em manutenção');

  if (!equipment) {
    return (
      <Layout>
        <p>Equipamento não encontrado.</p>
      </Layout>
    );
  }

  const handleFinish = () => {
    finish();
    navigate('/manutencao/concluida');
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Manutenção do equipamento</h1>
        <p className="page-subtitle">{equipment.name}</p>
      </div>

      <div className="maintenance-layout">
        <aside className="card">
          <img src={equipment.image} alt={equipment.name} className="detail-image" />
          <h2 className="section-title" style={{ marginTop: '20px' }}>{equipment.name}</h2>
          <div className="summary-box" style={{ marginTop: '16px' }}>
            <div className="summary-row">
              <span className="summary-label">Patrimônio</span>
              <span className="summary-value">{equipment.patrimonio}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Localização</span>
              <span className="summary-value">{equipment.local}</span>
            </div>
          </div>
          <div className="info-panel">
            <strong>Histórico da ocorrência</strong>
            <p style={{ marginTop: '6px' }}>
              {occurrence?.problem || 'Sensor ultrassônico com falha no Trigger.'}
            </p>
          </div>
        </aside>

        <section className="card">
          <h2 className="section-title" style={{ marginBottom: '20px' }}>Registro da manutenção</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="repairDescription">
              Descrição do reparo
            </label>
            <textarea
              id="repairDescription"
              className="form-textarea"
              value={repairDescription}
              onChange={(e) => setRepairDescription(e.target.value)}
              placeholder="Descreva o reparo realizado..."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="parts">
              Peças substituídas
            </label>
            <input
              id="parts"
              type="text"
              className="form-input"
              value={parts}
              onChange={(e) => setParts(e.target.value)}
              placeholder="Ex: Sensor ultrassônico HC-SR04"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="maintenanceDate">Data de manutenção</label>
              <input id="maintenanceDate" type="date" className="form-input" value={maintenanceDate} onChange={(e) => setMaintenanceDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="responsible">Responsável</label>
              <input id="responsible" type="text" className="form-input" value={responsible} onChange={(e) => setResponsible(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">Status</label>
            <select id="status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {['Em manutenção', 'Aguardando peça', 'Concluída'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button type="button" className="btn btn-primary btn-block" onClick={handleFinish}>
            Finalizar manutenção
          </button>
        </section>
      </div>
    </Layout>
  );
}
