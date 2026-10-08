/*
 * ============================================================
 *  EquipmentMaintenance.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Camilla  |  Atividade: Q2 (CRUD de Manutenções - READ, UPDATE, DELETE e conclusão)
 * ------------------------------------------------------------
 *  O que faz: registro do reparo de um equipamento: salvar andamento (UPDATE), finalizar
 *  (equipamento volta a "Disponível", RN10) ou cancelar (DELETE lógico, ocorrência volta à fila).
 *  Quem chama: App.jsx, rota /manutencao/:id (MaintenancePanel: "Iniciar manutenção" e "Continuar").
 *  Chama: GET /api/manutencoes/{id}, GET /api/usuarios?perfil=manutencao, PUT /api/manutencoes/{id},
 *         POST /api/manutencoes/{id}/concluir, DELETE /api/manutencoes/{id},
 *         GET /api/integracoes/fornecedores (AIE "Fornecedor de assistência técnica", Camilla - Medição).
 * ============================================================
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import FotoEquipamento from '../components/FotoEquipamento';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState, SuccessMessage } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR } from '../utils/format';

/**
 * Registro do reparo: salvar andamento (UPDATE), finalizar, ou cancelar (DELETE).
 */
export default function EquipmentMaintenance() {
  const { id } = useParams();
  const navigate = useNavigate();
  // GET /api/manutencoes/{id} -> ManutencaoController.buscar (herdado) -> ManutencaoService.buscar
  //   -> SELECT t.*, e.nome AS equipamento_nome, o.descricao AS ocorrencia_descricao, o.prioridade, u.nome AS responsavel_nome
  //      FROM manutencao t JOIN equipamento e ... LEFT JOIN ocorrencia o ... LEFT JOIN usuario u ... WHERE t.id = ? AND t.tenant_id = ?
  const { dados: m, setDados, carregando, erro } = useApi(`/manutencoes/${id}`);
  // Opções do campo "Responsável": GET /api/usuarios?perfil=manutencao -> UsuarioController.porPerfil
  //   -> UsuarioService.listarPorPerfil -> SELECT t.* FROM usuario t WHERE t.tenant_id = ? AND t.ativo = TRUE AND (t.perfil = ?)
  const responsaveis = useApi('/usuarios?perfil=manutencao');
  // Medição (AIE): empresas de assistência técnica do Sistema de Compras (só leitura).
  // GET /api/integracoes/fornecedores -> SistemaCompras.listar. Só fornecedor com contrato vigente é aceito.
  const fornecedores = useApi('/integracoes/fornecedores');
  // Estado: form = cópia editável da manutenção; mensagem de sucesso; erro da ação.
  const [form, setForm] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  // useEffect: quando a manutenção chega (ou é atualizada), preenche o formulário com os dados dela.
  useEffect(() => {
    if (m) setForm({
      descricaoReparo: m.descricaoReparo || '',
      pecasSubstituidas: m.pecasSubstituidas || '',
      responsavelId: m.responsavelId || '',
      fornecedorCnpj: m.fornecedorCnpj || '',
      status: m.status === 'Concluída' ? 'Em manutenção' : m.status,
    });
  }, [m]);

  if (carregando || !form) return <Layout>{erro ? <ErrorState mensagem={erro} /> : <LoadingState />}</Layout>;

  // corpo(): monta o JSON enviado (responsavelId como número). atualizar(campo): handler genérico dos inputs.
  const corpo = () => ({
    ...form,
    responsavelId: form.responsavelId ? Number(form.responsavelId) : null,
    fornecedorCnpj: form.fornecedorCnpj || null, // vazio = reparo interno
  });
  const fornecedorEscolhido = (fornecedores.dados || []).find((f) => f.cnpj === form.fornecedorCnpj);
  const atualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  /** Executa uma ação da API limpando mensagens antes e mostrando o erro do backend se falhar. */
  const executar = async (acao) => {
    setErroAcao(null);
    setMensagem(null);
    try {
      await acao();
    } catch (e) {
      setErroAcao(e.message);
    }
  };

  /**
   * "Salvar andamento" (UPDATE):
   *   PUT /api/manutencoes/{id} -> ManutencaoController.atualizar (herdado) -> CrudService.atualizar
   *   -> ManutencaoService.validar (não pode concluir por aqui) e antesDeSalvar (mantém equipamento, ocorrência e início)
   *   -> UPDATE manutencao SET equipamento_id = ?, ..., descricao_reparo = ?, pecas_substituidas = ?, status = ?
   *      WHERE id = ? AND tenant_id = ?
   *   -> INSERT INTO historico (... 'ATUALIZACAO' ...)
   */
  const salvar = () => executar(async () => {
    setDados(await api.put(`/manutencoes/${id}`, corpo()));
    setMensagem('Andamento salvo.');
  });

  /**
   * "Finalizar manutenção":
   *   POST /api/manutencoes/{id}/concluir -> ManutencaoController.concluir -> ManutencaoService.concluir
   *   -> UPDATE manutencao SET ..., data_fim = ?, status = 'CONCLUIDA' WHERE id = ? AND tenant_id = ?
   *   -> UPDATE ocorrencia SET ..., status = 'ENCERRADA' ...
   *   -> RN10: UPDATE equipamento SET status = 'DISPONIVEL' (ou 'RESERVADO' se houver reservas futuras)
   *   -> INSERT INTO historico (2x) e AvisoManutencaoConcluida (Template Method) -> INSERT INTO notificacao
   */
  const finalizar = () => executar(async () => {
    await api.post(`/manutencoes/${id}/concluir`, corpo());
    navigate(`/manutencao/${id}/concluida`);
  });

  /**
   * "Cancelar manutenção" (DELETE lógico):
   *   DELETE /api/manutencoes/{id} -> ManutencaoController.excluir (herdado) -> CrudService.excluir
   *   -> ManutencaoService.antesDeExcluir: concluída não pode; ocorrência volta para "ABERTA" (UPDATE ocorrencia)
   *   -> UPDATE manutencao SET ativo = FALSE WHERE id = ? AND tenant_id = ?  (exclusão lógica)
   *   -> INSERT INTO historico (... 'DESATIVACAO' ...)
   */
  const cancelar = () => executar(async () => {
    if (!window.confirm('Cancelar esta manutenção? A ocorrência volta para a fila.')) return;
    await api.delete(`/manutencoes/${id}`);
    navigate('/manutencao/painel');
  });

  // Manutenção concluída fica só para leitura (campos desabilitados e sem botões).
  const concluida = m.status === 'Concluída';

  // JSX: à esquerda os dados do equipamento e do problema; à direita o formulário do reparo.
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
          <FotoEquipamento src={m.equipamentoImagem} alt={m.equipamentoNome} className="detail-image" />
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

          {/* Assistência técnica externa (AIE do Sistema de Compras). Vazio = reparo feito pela equipe interna. */}
          <div className="form-group">
            <label className="form-label" htmlFor="fornecedor">Assistência técnica externa <span className="aie-tag">Sistema de Compras</span></label>
            <select id="fornecedor" className="form-select" value={form.fornecedorCnpj} onChange={atualizar('fornecedorCnpj')} disabled={concluida}>
              <option value="">Reparo interno (sem fornecedor)</option>
              {(fornecedores.dados || []).map((f) => (
                <option key={f.cnpj} value={f.cnpj}>
                  {f.nomeFantasia} – {f.especialidade}{f.contratoVigente ? '' : ' (contrato encerrado)'}
                </option>
              ))}
            </select>
            {fornecedorEscolhido && (
              <span className="form-hint">
                CNPJ {fornecedorEscolhido.cnpj} · {fornecedorEscolhido.telefone} · {fornecedorEscolhido.email}
              </span>
            )}
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
