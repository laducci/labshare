/*
 * ============================================================
 *  CrudPage.jsx  |  Camada: Front-end (tela genérica de CRUD)
 *  Responsável na apresentação: João  |  Atividade: Q3 (compactação de código / reuso), Q2 (telas CRUD com banco)
 * ------------------------------------------------------------
 *  O que faz: UMA tela que serve para vários cadastros (categorias, locais, usuários, reservas,
 *  ocorrências, manutenções, centros de custo, multas). Recebe por props uma "config" que diz
 *  o endpoint, as colunas da tabela e os campos do formulário; monta a lista, a busca, o
 *  formulário de novo/editar e o botão de desativar. É o par do CrudController no backend.
 *  Quem chama: App.jsx (componente Crud com CRUDS[nome]) e LateFeePanel (CRUDS.multas).
 *  Chama: useApi (GET da lista), api.post/put/delete, Layout, StatusBadge, States; configs em config/crudConfigs.jsx.
 * ============================================================
 */
import { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Layout from './Layout';
import StatusBadge from './StatusBadge';
import { EmptyState, ErrorState, LoadingState, SuccessMessage } from './States';
import { useApi } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

/**
 * ============================================================
 *  Tela de CRUD GENÉRICA (reuso / compactação de código)
 * ============================================================
 * Antes: cada cadastro (categorias, locais, usuários...) teria sua própria tela
 * com tabela + formulário + chamadas fetch — quase tudo copiado e colado.
 * Agora: UMA tela que recebe uma "config" (src/config/crudConfigs.js) dizendo
 * o endpoint, as colunas e os campos. Cada novo cadastro = só uma config nova.
 * (O arquivo de configs é src/config/crudConfigs.jsx.)
 *
 * Fluxo do botão "Salvar":
 *   salvar() -> api.post('/categorias', form)  (novo)   -> backend faz INSERT
 *            -> api.put('/categorias/3', form) (edição) -> backend faz UPDATE
 * Botão "Desativar": api.delete('/categorias/3')        -> backend faz UPDATE ativo=false
 */
// Props: config = objeto de crudConfigs.jsx (endpoint, titulo, singular, colunas, campos, acoesExtras...).
export default function CrudPage({ config }) {
  // app = { user, tenant, hasFeature... } do AppContext; repassado para configs cujos campos dependem do cliente.
  const app = useApp();
  // "campos" pode ser uma lista fixa ou uma função (app) => lista. Ex.: reservas só mostram o campo
  // "Centro de custo" se hasFeature('costCenter') (VARIABILIDADE). useMemo evita recalcular a cada render.
  const campos = useMemo(
    () => (typeof config.campos === 'function' ? config.campos(app) : config.campos),
    [config, app]
  );
  // GET automático da lista: ex. useApi('/categorias') -> GET /api/categorias -> CrudController.listar
  // -> SELECT ... WHERE tenant_id = ? AND ativo = TRUE.
  const { dados, carregando, erro, recarregar } = useApi(config.endpoint);
  // Estado da tela (useState): formulário aberto, opções dos selects, mensagens, texto da busca e "salvando".
  const [form, setForm] = useState(null); // null = fechado | {} = novo | {...} = edição
  const [opcoes, setOpcoes] = useState({}); // opções dos <select> que vêm do backend
  const [erroForm, setErroForm] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [busca, setBusca] = useState('');
  const [salvando, setSalvando] = useState(false);
  const a = config.feminino ? 'a' : 'o'; // concordância: Nova categoria / Novo local

  // Carrega as opções dos selects ligados a outra tabela (ex.: categoria do equipamento)
  useEffect(() => {
    campos.filter((c) => c.opcoesDe).forEach((c) => {
      api.get(c.opcoesDe.endpoint)
        .then((lista) => setOpcoes((prev) => ({
          ...prev,
          [c.nome]: lista.map((item) => ({ valor: item.id, rotulo: c.opcoesDe.rotulo(item) })),
        })))
        .catch(() => setOpcoes((prev) => ({ ...prev, [c.nome]: [] })));
    });
  }, [campos]);

  // Filtro da caixa "Busca" feito no próprio navegador (sem ir ao backend): procura o texto em qualquer campo do registro.
  const registros = (dados || []).filter((item) =>
    !busca || JSON.stringify(item).toLowerCase().includes(busca.toLowerCase())
  );

  // Botão "Novo(a) ...": abre o formulário vazio (ou com valoresIniciais da config).
  const abrirNovo = () => {
    setErroForm(null);
    setMensagem(null);
    setForm({ ...(config.valoresIniciais || {}) });
  };

  // Botão "Editar" da linha: abre o formulário com uma cópia do registro. Campos do tipo "linhas"
  // (listas, ex.: itens do checklist) viram texto com um item por linha para caber no <textarea>.
  const abrirEdicao = (item) => {
    setErroForm(null);
    setMensagem(null);
    const copia = { ...item };
    campos.filter((c) => c.tipo === 'linhas').forEach((c) => {
      copia[c.nome] = (item[c.nome] || []).join('\n');
    });
    setForm(copia);
  };

  // Atualiza só o campo digitado, mantendo os outros (spread ...prev).
  const alterarCampo = (campo, valor) => setForm((prev) => ({ ...prev, [campo.nome]: valor }));

  /** Converte o formulário no JSON que o backend espera. */
  const montarCorpo = () => {
    // Ajustes: "linhas" volta a ser array; números e ids de select viram Number (ou null se vazio),
    // porque o Java espera Long/Integer e não texto.
    const corpo = { ...form };
    campos.forEach((c) => {
      const v = corpo[c.nome];
      if (c.tipo === 'linhas') corpo[c.nome] = String(v || '').split('\n').map((s) => s.trim()).filter(Boolean);
      if ((c.tipo === 'number' || c.opcoesDe) && v !== undefined) corpo[c.nome] = v === '' || v === null ? null : Number(v);
    });
    return corpo;
  };

  // Botão "Salvar" (submit do formulário). Com id = edição -> PUT /api{endpoint}/{id} -> UPDATE;
  // sem id = novo -> POST /api{endpoint} -> INSERT. Se o backend recusar (RegraNegocioException -> 400),
  // a mensagem aparece no formulário. Depois de salvar, fecha o form e recarrega a lista.
  const salvar = async (e) => {
    e.preventDefault(); // impede o navegador de recarregar a página ao enviar o form
    setSalvando(true);
    setErroForm(null);
    try {
      if (form.id) {
        await api.put(`${config.endpoint}/${form.id}`, montarCorpo());   // UPDATE
        setMensagem(`${config.singular} atualizad${a} com sucesso.`);
      } else {
        await api.post(config.endpoint, montarCorpo());                   // INSERT
        setMensagem(`${config.singular} cadastrad${a} com sucesso.`);
      }
      setForm(null);
      recarregar();
    } catch (err) {
      setErroForm(err.message); // mensagem de validação vinda do backend
    } finally {
      setSalvando(false);
    }
  };

  // Botão "Desativar" (ou rotuloExcluir da config): pede confirmação e chama DELETE /api{endpoint}/{id}.
  // No backend é EXCLUSÃO LÓGICA (UPDATE ... SET ativo = FALSE), o registro continua no histórico (RN11).
  const excluir = async (item) => {
    if (!window.confirm(`Deseja ${config.rotuloExcluir?.toLowerCase() || 'desativar'} este registro?`)) return;
    try {
      await api.delete(`${config.endpoint}/${item.id}`);
      setMensagem(`${config.singular} removid${a}.`);
      recarregar();
    } catch (err) {
      setMensagem(null);
      setErroForm(err.message);
    }
  };

  // Campos marcados como somenteCriacao (ex.: senha, equipamento da ocorrência) somem na edição.
  const camposVisiveis = campos.filter((c) => !(form?.id && c.somenteCriacao));

  // Estrutura da tela: título + botão Novo, aviso da config, mensagens, formulário (quando aberto),
  // barra de busca, estados (carregando/erro/vazio) e a tabela. As colunas e ações vêm da config:
  // col.formato (formata o valor), col.badge (mostra StatusBadge), acoesExtras (botões específicos,
  // ex.: "Marcar como paga" das multas), podeEditar/podeExcluir (esconde botões).
  return (
    <Layout fullWidth>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{config.titulo}</h1>
          {config.subtitulo && <p className="page-subtitle">{config.subtitulo}</p>}
        </div>
        {config.podeCriar !== false && !form && (
          <button type="button" className="btn btn-primary" onClick={abrirNovo}>
            <Plus size={18} />
            {config.rotuloNovo || `Nov${a} ${config.singular.toLowerCase()}`}
          </button>
        )}
      </div>

      {config.aviso && <div className="info-panel" style={{ marginBottom: 20 }}>{config.aviso}</div>}
      <SuccessMessage mensagem={mensagem} />
      {!form && <ErrorState mensagem={erroForm} />}

      {form && (
        <form className="card crud-form" onSubmit={salvar}>
          <h2 className="form-section__title">{form.id ? `Editar ${config.singular.toLowerCase()}` : `Cadastrar ${config.singular.toLowerCase()}`}</h2>
          <ErrorState mensagem={erroForm} />
          <div className="form-row" style={{ flexWrap: 'wrap' }}>
            {camposVisiveis.map((c) => (
              <div className="form-group" key={c.nome} style={{ flex: c.largo ? '1 1 100%' : '1 1 240px' }}>
                <label className="form-label" htmlFor={c.nome}>
                  {c.rotulo}{c.obrigatorio ? ' *' : ''}
                </label>
                <CampoFormulario campo={c} valor={form[c.nome]} opcoes={c.opcoes || opcoes[c.nome] || []} onChange={(v) => alterarCampo(c, v)} />
                {c.ajuda && <span className="form-hint">{c.ajuda}</span>}
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setForm(null)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}

      <div className="filters-bar">
        <div className="form-group search-filter">
          <label className="form-label" htmlFor="busca-crud">Busca</label>
          <div className="form-input-wrapper">
            <input id="busca-crud" type="search" className="form-input" placeholder="Filtrar..." value={busca}
              onChange={(e) => setBusca(e.target.value)} style={{ paddingLeft: '40px' }} />
            <Search size={18} style={{ position: 'absolute', left: 13, top: 14, color: 'var(--color-text-muted)' }} />
          </div>
        </div>
      </div>

      {carregando && <LoadingState />}
      <ErrorState mensagem={erro} onTentarNovamente={recarregar} />
      {!carregando && !erro && registros.length === 0 && <EmptyState>Nenhum registro encontrado.</EmptyState>}

      {!carregando && registros.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {config.colunas.map((col) => <th key={col.campo}>{col.rotulo}</th>)}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((item) => (
                <tr key={item.id}>
                  {config.colunas.map((col) => (
                    <td key={col.campo}>
                      {col.formato ? col.formato(item[col.campo], item)
                        : col.badge ? <StatusBadge status={item[col.campo]} />
                          : item[col.campo] ?? '—'}
                    </td>
                  ))}
                  <td>
                    <div className="table-actions">
                      {config.acoesExtras?.(item, { recarregar, setMensagem, setErro: setErroForm })}
                      {config.podeEditar !== false && (!config.podeEditarItem || config.podeEditarItem(item)) && (
                        <button type="button" className="btn btn-link btn-sm" onClick={() => abrirEdicao(item)}>Editar</button>
                      )}
                      {config.podeExcluir !== false && (!config.podeExcluirItem || config.podeExcluirItem(item)) && (
                        <button type="button" className="btn btn-link btn-sm" onClick={() => excluir(item)}>
                          {config.rotuloExcluir || 'Desativar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

/** Um campo do formulário genérico, de acordo com o "tipo" da config. */
// Componente interno: decide qual elemento HTML desenhar pelo "tipo" do campo:
// select (opções fixas ou vindas de outra tabela), textarea (texto longo ou "linhas") ou input (text, number, date, email...).
// "comum" junta as props repetidas (id, required, value, onChange) para não escrevê-las 3 vezes.
function CampoFormulario({ campo, valor, opcoes, onChange }) {
  const comum = { id: campo.nome, required: campo.obrigatorio, value: valor ?? '', onChange: (e) => onChange(e.target.value) };

  if (campo.tipo === 'select' || campo.opcoesDe) {
    return (
      <select className="form-select" {...comum}>
        <option value="">Selecione...</option>
        {opcoes.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
      </select>
    );
  }
  if (campo.tipo === 'textarea' || campo.tipo === 'linhas') {
    return <textarea className="form-textarea" placeholder={campo.placeholder} {...comum} />;
  }
  return <input className="form-input" type={campo.tipo || 'text'} placeholder={campo.placeholder} {...comum} />;
}
