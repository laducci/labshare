import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState, SuccessMessage } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR } from '../utils/format';

/** Registro do reparo: salvar andamento (UPDATE), finalizar, ou cancelar (DELETE). */
export default function EquipmentMaintenance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dados: m, setDados, carregando, erro } = useApi(`/manutencoes/${id}`);
  const responsaveis = useApi('/usuarios?perfil=manutencao');
  const [form, setForm] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  useEffect(() => {
    if (m) setForm({
      descricaoReparo: m.descricaoReparo || '',
      pecasSubstituidas: m.pecasSubstituidas || '',
      responsavelId: m.responsavelId || '',
      status: m.status === 'Concluída' ? 'Em manutenção' : m.status,
    });
  }, [m]);

  if (carregando || !form) return <Layout>{erro ? <ErrorState mensagem={erro} /> : <LoadingState />}</Layout>;

  const corpo = () => ({ ...form, responsavelId: form.responsavelId ? Number(form.responsavelId) : null });
  const atualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const executar = async (acao) => {
    setErroAcao(null);
    setMensagem(null);
    try {
      await acao();
    } catch (e) {
      setErroAcao(e.message);
    }
  };

  /** PUT /api/manutencoes/{id} */
  const salvar = () => executar(async () => {
    setDados(await api.put(`/manutencoes/${id}`, corpo()));
    setMensagem('Andamento salvo.');
  });

  /** POST /api/manutencoes/{id}/concluir -> equipamento volta a "Disponível" (RN10) */
  const finalizar = () => executar(async () => {
    await api.post(`/manutencoes/${id}/concluir`, corpo());
    navigate(`/manutencao/${id}/concluida`);
  });

  /** DELETE /api/manutencoes/{id} -> ocorrência volta para a fila */
  const cancelar = () => executar(async () => {
    if (!window.confirm('Cancelar esta manutenção? A ocorrência volta para a fila.')) return;
    await api.delete(`/manutencoes/${id}`);
    navigate('/manutencao/painel');
  });

  const concluida = m.status === 'Concluída';

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Manutenção do equipamento</h1>
        <p className="page-subtitle">{m.equipamentoNome}</p>
      </div>
      <SuccessMessage mensagem={mensagem} />
      <ErrorState mensagem={erroAcao} />

      <div className="maintenance-layout">
        <aside className="card">
          {m.equipamentoImagem && <img src={m.equipamentoImagem} alt={m.equipamentoNome} className="detail-image" />}
          <h2 className="section-title" style={{ marginTop: '20px' }}>{m.equipamentoNome}</h2>
          <div className="summary-box" style={{ marginTop: '16px' }}>
            <div className="summary-row"><span className="summary-label">Patrimônio</span><span className="summary-value">{m.equipamentoPatrimonio || '—'}</span></div>
            <div className="summary-row"><span className="summary-label">Início</span><span className="summary-value">{formatDateBR(m.dataInicio)}</span></div>
            <div className="summary-row"><span className="summary-label">Prioridade</span><span><StatusBadge status={m.prioridade} /></span></div>
            <div className="summary-row"><span className="summary-label">Status</span><span><StatusBadge status={m.status} /></span></div>
          </div>
          <div className="info-panel">
            <strong>Problema relatado</strong>
            <p style={{ marginTop: '6px' }}>{m.ocorrenciaDescricao}</p>
          </div>
        </aside>

        <section className="card">
          <h2 className="section-title" style={{ marginBottom: '20px' }}>Registro da manutenção</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="descricaoReparo">Descrição do reparo *</label>
            <textarea id="descricaoReparo" className="form-textarea" value={form.descricaoReparo} onChange={atualizar('descricaoReparo')}
              placeholder="Descreva o reparo realizado..." disabled={concluida} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="parts">Peças substituídas</label>
            <input id="parts" className="form-input" value={form.pecasSubstituidas} onChange={atualizar('pecasSubstituidas')}
              placeholder="Ex: Sensor ultrassônico HC-SR04" disabled={concluida} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="responsible">Responsável</label>
              <select id="responsible" className="form-select" value={form.responsavelId} onChange={atualizar('responsavelId')} disabled={concluida}>
                <option value="">Selecione...</option>
                {(responsaveis.dados || []).map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select id="status" className="form-select" value={form.status} onChange={atualizar('status')} disabled={concluida}>
                <option>Em manutenção</option>
                <option>Aguardando peça</option>
              </select>
            </div>
          </div>

          {!concluida && (
            <div className="button-group">
              <button type="button" className="btn btn-secondary" onClick={salvar}>Salvar andamento</button>
              <button type="button" className="btn btn-primary" onClick={finalizar}>Finalizar manutenção</button>
              <button type="button" className="btn btn-danger" onClick={cancelar}>Cancelar manutenção</button>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
