/*
 * ============================================================
 *  EquipmentForm.jsx  |  Camada: Front-end (formulário reutilizável)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Equipamentos), Q3 (compactação: 1 form para criar e editar)
 * ------------------------------------------------------------
 *  O que faz: formulário de equipamento usado tanto para CADASTRAR quanto para EDITAR.
 *  Se receber equipamentoId, carrega o equipamento e salva com PUT; se não, começa vazio e salva com POST.
 *  Carrega também as categorias e os locais para os selects.
 *  Quem chama: pages/CreateEquipment.jsx (sem id) e pages/EditEquipment.jsx (com id da URL).
 *  Chama: useApi (GET /equipamentos/{id}, /categorias, /locais), api.post/put (/equipamentos), navigate.
 *  Medição (AIE "Bem patrimonial", Laura): botão "Consultar no patrimônio" -> GET /api/integracoes/patrimonio/{numero}
 *  traz os dados do bem do Sistema de Patrimônio (só leitura) e preenche nome/descrição.
 * ============================================================
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import StatusBadge from './StatusBadge';
import { ErrorState, LoadingState } from './States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR, formatMoney } from '../utils/format';

// Valores iniciais do formulário de cadastro. Itens são texto (um por linha) enquanto estão no formulário.
const VAZIO = {
  nome: '', descricao: '', patrimonio: '', categoriaId: '', localId: '', status: 'Disponível',
  imagemUrl: '', itensInclusos: '', itensChecklist: '',
};
// Status controlados pelo FLUXO (reserva, retirada, manutenção): o técnico não pode trocá-los à mão,
// senão quebraria RN06/RN09/RN10. Na edição, se o equipamento estiver num deles, o select fica travado.
const STATUS_DO_FLUXO = ['Reservado', 'Em uso', 'Em manutenção', 'Em inspeção'];

/**
 * Formulário ÚNICO de equipamento, usado no cadastro (CREATE) e na edição (UPDATE).
 * COMPACTAÇÃO: antes existiam CreateEquipment.jsx e EditEquipment.jsx com ~95% do código igual.
 *  - sem equipamentoId -> POST /api/equipamentos       -> INSERT INTO equipamento
 *  - com equipamentoId -> PUT  /api/equipamentos/{id}  -> UPDATE equipamento SET ...
 */
// Props: equipamentoId (opcional). navigate = troca de tela sem recarregar a página.
export default function EquipmentForm({ equipamentoId }) {
  const navigate = useNavigate();
  // Três GETs automáticos (useApi): o equipamento (só na edição; null = não busca), categorias e locais.
  const edicao = Boolean(equipamentoId);
  const existente = useApi(edicao ? `/equipamentos/${equipamentoId}` : null);
  const categorias = useApi('/categorias');   // as opções vêm das tabelas categoria e local
  const locais = useApi('/locais');
  // Estado da tela: form = valores digitados (null enquanto o equipamento da edição ainda não chegou),
  // erro = mensagem do backend, salvando = desabilita o botão para evitar duplo clique.
  const [form, setForm] = useState(edicao ? null : VAZIO);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);
  // Resultado da consulta ao Sistema de Patrimônio (AIE): null = ainda não consultou.
  const [bem, setBem] = useState(null);
  const [erroBem, setErroBem] = useState(null);

  // useEffect roda quando o GET do equipamento termina (dependência existente.dados): copia os dados
  // para o formulário, trocando null por '' (inputs controlados não aceitam null) e listas por texto.
  useEffect(() => {
    const e = existente.dados;
    if (e) setForm({
      ...e,
      categoriaId: e.categoriaId ?? '',
      localId: e.localId ?? '',
      patrimonio: e.patrimonio || '',
      descricao: e.descricao || '',
      imagemUrl: e.imagemUrl || '',
      itensInclusos: e.itensInclusos.join('\n'),
      itensChecklist: e.itensChecklist.join('\n'),
    });
  }, [existente.dados]);

  // Enquanto não há formulário pronto mostra erro ou "Carregando..." (retornos antecipados).
  if (existente.erro) return <Layout estreito><ErrorState mensagem={existente.erro} /></Layout>;
  if (!form) return <Layout estreito><LoadingState /></Layout>;

  // update('nome') devolve a função de onChange daquele campo (evita escrever uma função por input).
  // linhas() transforma o texto do textarea em array, ignorando linhas vazias.
  const update = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));
  const linhas = (texto) => texto.split('\n').map((s) => s.trim()).filter(Boolean);
  const statusTravado = edicao && STATUS_DO_FLUXO.includes(form.status);

  // Botão "Consultar no patrimônio" (AIE, Medição): GET /api/integracoes/patrimonio/PAT-2024-001.
  // O backend lê o arquivo do sistema externo (SistemaPatrimonioBens) — NÃO grava nada no nosso banco.
  // Se nome/descrição estiverem vazios, copia do bem para o usuário não redigitar.
  const consultarPatrimonio = async () => {
    setErroBem(null);
    setBem(null);
    if (!form.patrimonio.trim()) { setErroBem('Informe o número de patrimônio.'); return; }
    try {
      const b = await api.get(`/integracoes/patrimonio/${encodeURIComponent(form.patrimonio.trim())}`);
      setBem(b);
      setForm((prev) => ({
        ...prev,
        nome: prev.nome || b.descricao,
        descricao: prev.descricao || `${b.marca} ${b.modelo} – nº de série ${b.numeroSerie}.`,
      }));
    } catch (err) {
      setErroBem(err.message);
    }
  };

  // Botão "Salvar equipamento": monta o JSON (ids viram Number, textos viram listas) e chama
  // PUT /api/equipamentos/{id} (edição -> UPDATE) ou POST /api/equipamentos (novo -> INSERT).
  // As validações ficam no EquipamentoService; se falhar, a mensagem aparece no <ErrorState>.
  // Deu certo -> navigate('/equipamentos') volta para a lista.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    const corpo = {
      ...form,
      categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
      localId: form.localId ? Number(form.localId) : null,
      itensInclusos: linhas(form.itensInclusos),
      itensChecklist: linhas(form.itensChecklist),
    };
    try {
      if (edicao) await api.put(`/equipamentos/${equipamentoId}`, corpo);
      else await api.post('/equipamentos', corpo);
      navigate('/equipamentos');
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  // Formulário em seções: informações básicas, localização/status, descrição, itens/checklist e imagem.
  // Os <select> de categoria e local são preenchidos com o GET de /categorias e /locais.
  // "Itens do checklist" alimentam o componente Checklist na retirada/devolução (RN05/RN07).
  return (
    <Layout estreito>
      <div className="page-header">
        <h1 className="page-title">{edicao ? 'Editar equipamento' : 'Cadastrar equipamento'}</h1>
        <p className="page-subtitle">{edicao ? form.nome : 'Preencha as informações para adicionar um item ao acervo.'}</p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <ErrorState mensagem={erro} />
        <section className="form-section">
          <h2 className="form-section__title">Informações básicas</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nome">Nome *</label>
              <input id="nome" className="form-input" value={form.nome} onChange={update('nome')} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="patrimonio">Número de patrimônio</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input id="patrimonio" className="form-input" value={form.patrimonio} onChange={update('patrimonio')} placeholder="Ex.: PAT-2025-031" />
                <button type="button" className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }} onClick={consultarPatrimonio}>
                  Consultar no patrimônio
                </button>
              </div>
            </div>
          </div>
          {/* Painel com os dados do bem vindos do Sistema de Patrimônio (AIE). */}
          {erroBem && <ErrorState mensagem={erroBem} />}
          {bem && (
            <div className={bem.situacao === 'BAIXADO' ? 'info-panel warning-panel' : 'info-panel'} style={{ marginBottom: 16 }} data-testid="painel-patrimonio">
              <strong>Sistema de Patrimônio – {bem.numero}</strong>
              {bem.situacao === 'BAIXADO' && <> · bem BAIXADO: não pode entrar no acervo de empréstimo.</>}
              <div className="aie-grid">
                <span>Descrição</span><b>{bem.descricao}</b>
                <span>Marca / modelo</span><b>{bem.marca} {bem.modelo}</b>
                <span>Nº de série</span><b>{bem.numeroSerie}</b>
                <span>Aquisição</span><b>{formatDateBR(bem.dataAquisicao)} · {formatMoney(bem.valorAquisicao)}</b>
                <span>Situação</span><b>{bem.situacao}</b>
                <span>Unidade responsável</span><b>{bem.unidadeResponsavel}</b>
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="categoria">Categoria *</label>
            <select id="categoria" className="form-select" value={form.categoriaId} onChange={update('categoriaId')} required>
              <option value="">Selecione...</option>
              {(categorias.dados || []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Localização e status</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="local">Localização</label>
              <select id="local" className="form-select" value={form.localId} onChange={update('localId')}>
                <option value="">Selecione...</option>
                {(locais.dados || []).map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              {statusTravado ? (
                <div><StatusBadge status={form.status} /><span className="form-hint">Controlado pelo fluxo de reserva/manutenção.</span></div>
              ) : (
                <select id="status" className="form-select" value={form.status} onChange={update('status')}>
                  <option>Disponível</option>
                  <option>Indisponível</option>
                </select>
              )}
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Descrição</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="descricao">Descrição do equipamento</label>
            <textarea id="descricao" className="form-textarea" value={form.descricao} onChange={update('descricao')} />
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Itens e checklist</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="itensInclusos">Itens inclusos (um por linha)</label>
              <textarea id="itensInclusos" className="form-textarea" value={form.itensInclusos} onChange={update('itensInclusos')}
                placeholder={'1x Placa Arduino Uno R3\n1x Cabo USB'} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="itensChecklist">Itens do checklist (um por linha)</label>
              <textarea id="itensChecklist" className="form-textarea" value={form.itensChecklist} onChange={update('itensChecklist')}
                placeholder="Se ficar vazio, usa os itens inclusos" />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Imagem</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="imagemUrl">URL da foto</label>
            <input id="imagemUrl" className="form-input" value={form.imagemUrl} onChange={update('imagemUrl')} placeholder="https://..." />
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/equipamentos')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar equipamento'}</button>
        </div>
      </form>
    </Layout>
  );
}
