import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { ErrorState, LoadingState, SuccessMessage } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR, formatDateTimeBR } from '../utils/format';

export default function ActiveLoan() {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  const { dados: r, carregando, erro } = useApi(`/reservas/${reservaId}`);
  const [mensagem, setMensagem] = useState(null);

  if (carregando) return <Layout><LoadingState /></Layout>;
  if (erro) return <Layout><ErrorState mensagem={erro} /></Layout>;

  const enviarLembrete = async () => {
    const resp = await api.post('/notificacoes/lembretes');
    setMensagem(resp.enviados > 0
      ? `${resp.enviados} lembrete(s) enviado(s) para quem devolve até amanhã.`
      : 'Nenhuma devolução vence até amanhã, então nenhum lembrete foi enviado.');
  };

  return (
    <Layout>
      <div className="alert alert-success">Retirada registrada com sucesso.</div>
      <SuccessMessage mensagem={mensagem} />

      <div className="card" style={{ maxWidth: '520px' }}>
        <div className="reservation-card__equipment">{r.equipamentoNome}</div>
        <div style={{ margin: '1rem 0' }}>
          <span className="badge badge-warning">Em uso por {r.usuarioNome?.split(' ')[0]}</span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Retirado em {formatDateTimeBR(r.dataRetirada)} · devolução até {formatDateBR(r.dataFim)} às 18:00
        </p>

        <div className="button-group" style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={enviarLembrete}>Enviar lembretes de devolução</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate(`/tecnico/devolucao/${reservaId}`)}>Registrar devolução</button>
        </div>
      </div>
    </Layout>
  );
}
