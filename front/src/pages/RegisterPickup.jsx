import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { USERS, EQUIPMENTS } from '../data/mockData';
import { formatDateBR, useApp } from '../context/AppContext';

export default function RegisterPickup() {
  const equipment = EQUIPMENTS.find((eq) => eq.id === 'arduino-uno');
  const [checked, setChecked] = useState(
    Object.fromEntries(equipment.checklistItems.map((item) => [item, true]))
  );
  const [observations, setObservations] = useState('Tudo certo com os itens.');
  const { confirmPickup, reservation } = useApp();
  const navigate = useNavigate();

  const toggleItem = (item) => {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleConfirm = () => {
    confirmPickup();
    navigate('/tecnico/emprestimo-ativo');
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Registrar retirada</h1>
        <p className="page-subtitle">Confira os dados e valide todos os itens entregues.</p>
      </div>

      <div className="card" style={{ maxWidth: '720px' }}>
        <div className="summary-box">
          <div className="summary-row">
            <span className="summary-label">Reserva</span>
            <span className="summary-value">{equipment.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Usuário</span>
            <span className="summary-value">{USERS.lucas.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Data</span>
            <span className="summary-value">{formatDateBR(reservation?.startDate || '2025-08-20')}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Horário</span>
            <span className="summary-value">09:00</span>
          </div>
        </div>

        <h3 className="section-title">Checklist de itens</h3>
        <ul className="checklist">
          {equipment.checklistItems.map((item) => (
            <li key={item} className="checklist-item">
              <input
                type="checkbox"
                id={item}
                checked={checked[item]}
                onChange={() => toggleItem(item)}
              />
              <label htmlFor={item}>{item}</label>
            </li>
          ))}
        </ul>

        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label className="form-label" htmlFor="observations">
            Observações (opcional)
          </label>
          <textarea
            id="observations"
            className="form-textarea"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </div>

        <button type="button" className="btn btn-primary btn-block" onClick={handleConfirm}>
          Confirmar retirada
        </button>
      </div>
    </Layout>
  );
}
