import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { USERS, RETURN_CHECKLIST_DEFAULT } from '../data/mockData';
import { useApp, getEquipmentById } from '../context/AppContext';

export default function RegisterReturn() {
  const [observations, setObservations] = useState('Sensor ultrassônico com falha no Trigger.');
  const { confirmReturn, equipments } = useApp();
  const navigate = useNavigate();
  const equipment = getEquipmentById('arduino-uno', equipments);

  const handleConfirm = () => {
    confirmReturn(observations);
    navigate('/tecnico/ocorrencia');
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Registrar devolução</h1>
        <p className="page-subtitle">Carlos – Técnico · Confira o estado de cada item recebido.</p>
      </div>

      <div className="card" style={{ maxWidth: '720px' }}>
        <div className="summary-box">
          <div className="summary-row">
            <span className="summary-label">Reserva</span>
            <span className="summary-value">{equipment?.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Usuário</span>
            <span className="summary-value">{USERS.lucas.name}</span>
          </div>
        </div>

        <h3 className="section-title">Checklist</h3>
        <ul className="checklist">
          {RETURN_CHECKLIST_DEFAULT.map(({ item, status }) => (
            <li
              key={item}
              className={`checklist-item ${status === 'Com defeito' ? 'checklist-item--error' : 'checklist-item--ok'}`}
            >
              <span>
                {item} – {status}
              </span>
            </li>
          ))}
        </ul>

        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label className="form-label" htmlFor="observations">
            Observações
          </label>
          <textarea
            id="observations"
            className="form-textarea"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </div>

        <button type="button" className="btn btn-primary btn-block" onClick={handleConfirm}>
          Confirmar devolução
        </button>
      </div>
    </Layout>
  );
}
