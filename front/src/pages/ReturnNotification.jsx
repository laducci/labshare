import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function ReturnNotification() {
  const navigate = useNavigate();

  return (
    <Layout>
      <h1 className="page-title">Notificação</h1>
      <p className="page-subtitle">Visualização mobile</p>

      <div className="phone-mockup">
        <div className="phone-mockup__screen">
          <div className="phone-status-bar">
            <span>09:41</span>
            <span>LabShare</span>
          </div>
          <div className="phone-notification">
            <div className="phone-notification__app">LabShare</div>
            <div className="phone-notification__title">Lembrete de devolução</div>
            <div className="phone-notification__message">
              Olá, Lucas! Não se esqueça de devolver o equipamento Kit Arduino Uno até amanhã
              (22/08) às 18:00.
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/tecnico/devolucao')}>
          Continuar para devolução →
        </button>
      </div>
    </Layout>
  );
}
