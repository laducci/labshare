import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR } from '../utils/format';

/** Painel da manutenção (Fernanda): fila de ocorrências + reparos em andamento. */
export default function MaintenancePanel() {
  const { user } = useApp();
  const navigate = useNavigate();
  const fila = useApi('/ocorrencias/abertas');      // GET /api/ocorrencias/abertas
  const manutencoes = useApi('/manutencoes');       // GET /api/manutencoes
  const [prioridade, setPrioridade] = useState('');
  const [erro, setErro] = useState(null);

  const aguardando = (fila.dados || []).filter((o) => !prioridade || o.prioridade === prioridade);
  const andamento = (manutencoes.dados || []).filter((m) => m.status !== 'Concluída');

  /** "Iniciar manutenção": POST /api/manutencoes { ocorrenciaId } -> INSERT INTO manutencao */
  const iniciar = async (ocorrencia) => {
    setErro(null);
    try {
      const m = await api.post('/manutencoes', { ocorrenciaId: ocorrencia.id });
      navigate(`/manutencao/${m.id}`);
    } catch (e) {
      setErro(e.message);
    }
  };

  return (
    <Layout fullWidth>
      <div className="page-header">
        <h1 className="page-title">Manutenções</h1>
        <p className="page-subtitle">{user.nome} · Acompanhe ocorrências e reparos.</p>
      </div>
      <ErrorState mensagem={erro || fila.erro || manutencoes.erro} />

      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">Aguardando manutenção ({aguardando.length})</h2>
          <select className="form-select" style={{ maxWidth: 200 }} value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
            <option value="">Todas as prioridades</option>
            <option>Alta</option><option>Média</option><option>Baixa</option>
          </select>
        </div>
        {fila.carregando && <LoadingState />}
        {!fila.carregando && aguardando.length === 0 && <EmptyState>Nenhum equipamento aguardando manutenção.</EmptyState>}
        {aguardando.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Equipamento</th><th>Problema</th><th>Data</th><th>Prioridade</th><th>Status</th><th>Ação</th></tr></thead>
              <tbody>
                {aguardando.map((o) => (
                  <tr key={o.id}>
                    <td><div className="table-equipment">{o.equipamentoImagem && <img src={o.equipamentoImagem} alt="" />}{o.equipamentoNome}</div></td>
                    <td>{o.descricao}</td>
                    <td>{formatDateBR(o.dataAbertura)}</td>
                    <td><StatusBadge status={o.prioridade} /></td>
                    <td><StatusBadge status={o.status} /></td>
                    <td><button type="button" className="btn btn-primary btn-sm" onClick={() => iniciar(o)}>Iniciar manutenção</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="content-section">
        <div className="section-header"><h2 className="section-title">Em andamento ({andamento.length})</h2></div>
        {!manutencoes.carregando && andamento.length === 0 && <EmptyState>Nenhum reparo em andamento.</EmptyState>}
        {andamento.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Equipamento</th><th>Problema</th><th>Início</th><th>Responsável</th><th>Status</th><th>Ação</th></tr></thead>
              <tbody>
                {andamento.map((m) => (
                  <tr key={m.id}>
                    <td><div className="table-equipment">{m.equipamentoImagem && <img src={m.equipamentoImagem} alt="" />}{m.equipamentoNome}</div></td>
                    <td>{m.ocorrenciaDescricao}</td>
                    <td>{formatDateBR(m.dataInicio)}</td>
                    <td>{m.responsavelNome || '—'}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td><button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(`/manutencao/${m.id}`)}>Continuar</button></td>
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
