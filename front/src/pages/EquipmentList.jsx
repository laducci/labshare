/*
 * ============================================================
 *  EquipmentList.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Equipamentos - READ + DELETE lógico)
 * ------------------------------------------------------------
 *  O que faz: lista os equipamentos do cliente. Admin/técnico veem uma tabela com Ver, Editar
 *  e Desativar; aluno/professor veem cards para reservar. Os filtros (busca, categoria,
 *  status, local) são feitos no navegador, em cima da lista que veio do banco.
 *  Quem chama: App.jsx, rota /equipamentos (menu lateral, Home "Ver todos", Dashboard).
 *  Chama: GET /api/equipamentos, GET /api/categorias, GET /api/locais, DELETE /api/equipamentos/{id};
 *         navega para /equipamentos/novo, /equipamentos/:id/editar e /equipamento/:id.
 * ============================================================
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import Layout from '../components/Layout';
import FotoEquipamento from '../components/FotoEquipamento';
import EquipmentCard from '../components/EquipmentCard';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState, SuccessMessage } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';

// Opções do filtro de status (rótulos que o backend devolve no JSON via StatusEquipamento).
const STATUS = ['Disponível', 'Reservado', 'Em uso', 'Em manutenção', 'Indisponível'];

/**
 * READ do CRUD de equipamentos (Laura) + botão de DELETE lógico (exclusão lógica: ativo = FALSE).
 */
export default function EquipmentList() {
  const { user } = useApp();
  const navigate = useNavigate();
  // useApi faz o GET assim que a tela abre e guarda o resultado em "dados":
  //   GET /api/equipamentos -> EquipamentoController.listar (herdado de CrudController)
  //   -> EquipamentoService.listar (CrudService) -> AbstractDao.listar (Template Method)
  //   -> SELECT t.*, c.nome AS categoria_nome, ..., l.nome AS local_nome FROM equipamento t
  //      LEFT JOIN categoria c ... LEFT JOIN local l ... WHERE t.tenant_id = ? AND t.ativo = TRUE ORDER BY t.nome
  // tenant_id = ? garante que cada cliente só vê os próprios equipamentos (multi-cliente);
  // ativo = TRUE esconde os desativados. "recarregar" refaz o GET depois de desativar.
  const { dados, carregando, erro, recarregar } = useApi('/equipamentos');   // GET /api/equipamentos
  // Opções dos filtros, vindas das tabelas categoria e local:
  //   GET /api/categorias -> CategoriaController.listar -> SELECT t.* FROM categoria t WHERE t.tenant_id = ? AND t.ativo = TRUE
  //   GET /api/locais     -> LocalController.listar     -> SELECT t.* FROM local t WHERE t.tenant_id = ? AND t.ativo = TRUE
  const categorias = useApi('/categorias');
  const locais = useApi('/locais');
  // useState: valores dos filtros e mensagens de sucesso/erro da ação de desativar.
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState('');
  const [local, setLocal] = useState('');
  const [mensagem, setMensagem] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  // RNF05: só admin e técnico gerenciam o acervo (tabela com ações).
  const canManage = ['admin', 'tecnico'].includes(user?.perfil);
  // Filtro feito no front (não vai ao banco): aplica busca por nome/patrimônio, categoria, status e local.
  const filtrados = (dados || []).filter((eq) =>
    (!search || eq.nome.toLowerCase().includes(search.toLowerCase()) || (eq.patrimonio || '').toLowerCase().includes(search.toLowerCase()))
    && (!categoria || String(eq.categoriaId) === categoria)
    && (!status || eq.status === status)
    && (!local || String(eq.localId) === local)
  );

  /**
   * Botão "Desativar" (DELETE do CRUD):
   *   DELETE /api/equipamentos/{id} -> EquipamentoController.excluir (herdado de CrudController)
   *   -> CrudService.excluir -> EquipamentoService.antesDeExcluir: não deixa desativar se estiver
   *      "Em uso" ou com reservas ativas (SELECT ... FROM reserva ... status IN (...))
   *   -> AbstractDao.desativar -> UPDATE equipamento SET ativo = FALSE WHERE id = ? AND tenant_id = ?
   *   -> INSERT INTO historico (... 'DESATIVACAO' ...)   (RN11: o registro continua no banco)
   * Responde 204 (sem conteúdo); a tela mostra a mensagem e chama recarregar() para refazer o GET.
   */
  const desativar = async (eq) => {
    if (!window.confirm(`Deseja desativar "${eq.nome}"?`)) return;
    setErroAcao(null);
    try {
      await api.delete(`/equipamentos/${eq.id}`);
      setMensagem(`${eq.nome} foi desativado.`);
      recarregar();
    } catch (e) {
      setErroAcao(e.message);
    }
  };

  // JSX: cabeçalho, filtros e depois tabela (admin/técnico) ou grade de cards (aluno/professor).
  return (
    <Layout fullWidth>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Equipamentos</h1>
          <p className="page-subtitle">{canManage ? 'Gerencie o acervo do laboratório.' : 'Encontre e reserve equipamentos disponíveis.'}</p>
        </div>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={() => navigate('/equipamentos/novo')}>
            <Plus size={18} /> Novo equipamento
          </button>
        )}
      </div>
      <SuccessMessage mensagem={mensagem} />
      <ErrorState mensagem={erroAcao} />

      <div className="filters-bar">
        <div className="form-group search-filter">
          <label className="form-label">Buscar</label>
          <div className="form-input-wrapper">
            <Search size={17} />
            <input type="search" className="form-input" placeholder="Nome ou patrimônio..." value={search}
              onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Categoria</label>
          <select className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas</option>
            {(categorias.dados || []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            {STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Localização</label>
          <select className="form-select" value={local} onChange={(e) => setLocal(e.target.value)}>
            <option value="">Todos</option>
            {(locais.dados || []).map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>
        </div>
      </div>

      {carregando && <LoadingState />}
      <ErrorState mensagem={erro} onTentarNovamente={recarregar} />
      {!carregando && filtrados.length === 0 && <EmptyState>Nenhum equipamento encontrado.</EmptyState>}

      {canManage ? (
        filtrados.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Equipamento</th><th>Patrimônio</th><th>Categoria</th><th>Local</th><th>Status</th><th className="col-acoes">Ações</th></tr>
              </thead>
              <tbody>
                {filtrados.map((eq) => (
                  <tr key={eq.id}>
                    <td><div className="table-equipment"><FotoEquipamento src={eq.imagemUrl} alt="" className="table-thumb" tamanhoIcone={16} />{eq.nome}</div></td>
                    <td>{eq.patrimonio || '—'}</td>
                    <td>{eq.categoriaNome}</td>
                    <td>{eq.localNome || '—'}</td>
                    <td><StatusBadge status={eq.status} /></td>
                    <td className="col-acoes">
                      <div className="table-actions">
                        <button type="button" className="btn btn-link btn-sm" onClick={() => navigate(`/equipamento/${eq.id}`)}>Ver</button>
                        <button type="button" className="btn btn-link btn-sm" onClick={() => navigate(`/equipamentos/${eq.id}/editar`)}>Editar</button>
                        <button type="button" className="btn btn-link btn-sm" onClick={() => desativar(eq)}>Desativar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="equipment-grid">
          {filtrados.map((eq) => <EquipmentCard key={eq.id} equipamento={eq} />)}
        </div>
      )}
    </Layout>
  );
}
