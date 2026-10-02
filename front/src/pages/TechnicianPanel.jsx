import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, BellRing, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState, SuccessMessage } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR, isoDate } from '../utils/format';

/**
 * Painel do técnico. O mesmo componente atende 3 rotas (reuso):
 *  /tecnico/painel (tudo), /tecnico/retiradas (só agendadas), /tecnico/devolucoes (só em uso)
 */
export default function TechnicianPanel({ filtro = 'todos' }) {
  const { user } = useApp();
  const navigate = useNavigate();
  // GET /api/reservas?status=AGENDADA,EM_USO
  const { dados, carregando, erro, recarregar } = useApi('/reservas?status=AGENDADA,EM_USO');
  const ocorrencias = useApi('/ocorrencias/abertas');
  const [mensagem, setMensagem] = useState(null);

  const reservas = dados || [];
  const hoje = isoDate(0);
  const agendadas = reservas.filter((r) => r.status === 'Agendada');
  const emUso = reservas.filter((r) => r.status === 'Em uso');
  const atrasadas = emUso.filter((r) => r.dataFim < hoje);
  const lista = filtro === 'retiradas' ? agendadas : filtro === 'devolucoes' ? emUso : reservas;

  /** POST /api/notificacoes/lembretes -> Template Method LembreteDevolucao */
  const enviarLembretes = async () => {
    try {
      const r = await api.post('/notificacoes/lembretes');
      setMensagem(`${r.enviados} lembrete(s) de devolução enviado(s).`);
    } catch (e) {
      setMensagem(e.message);
    }
  };

  const titulos = { todos: 'Painel do Técnico', retiradas: 'Retiradas pendentes', devolucoes: 'Devoluções previstas' };

  return (
    <Layout fullWidth>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{titulos[filtro]}</h1>
          <p className="page-subtitle">{user.nome} · Operações do laboratório</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={enviarLembretes}>
          <BellRing size={18} /> Enviar lembretes de devolução
        </button>
      </div>
      <SuccessMessage mensagem={mensagem} />

      {filtro === 'todos' && (
        <div className="metric-grid">
          {[
            { label: 'Retiradas pendentes', value: agendadas.length, icon: ArrowDownToLine },
            { label: 'Equipamentos em uso', value: emUso.length, icon: ArrowUpFromLine },
            { label: 'Devoluções atrasadas', value: atrasadas.length, icon: Clock },
            { label: 'Ocorrências abertas', value: (ocorrencias.dados || []).length, icon: AlertTriangle },
          ].map(({ label, value, icon: Icon }) => (
            <div className="metric-card" key={label}>
              <span className="metric-card__icon"><Icon size={19} /></span>
              <span>
                <strong className="metric-card__value">{value}</strong>
                <span className="metric-card__label">{label}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <section className="content-section">
        {carregando && <LoadingState />}
        <ErrorState mensagem={erro} onTentarNovamente={recarregar} />
        {!carregando && lista.length === 0 && <EmptyState>Nenhuma reserva aguardando ação.</EmptyState>}
        {lista.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Usuário</th><th>Equipamento</th><th>Período</th><th>Status</th><th>Ação</th></tr>
              </thead>
              <tbody>
                {lista.map((r) => (
                  <tr key={r.id}>
                    <td>{r.usuarioNome}</td>
                    <td>{r.equipamentoNome}</td>
                    <td>
                      {formatDateBR(r.dataInicio)} a {formatDateBR(r.dataFim)}
                      {r.status === 'Em uso' && r.dataFim < hoje && <span className="badge badge-error" style={{ marginLeft: 6 }}>Atrasada</span>}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      {r.status === 'Agendada' ? (
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate(`/tecnico/retirada/${r.id}`)}>
                          Registrar retirada
                        </button>
                      ) : (
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate(`/tecnico/devolucao/${r.id}`)}>
                          Registrar devolução
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}
