import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import Layout from '../components/Layout';
import EquipmentCard from '../components/EquipmentCard';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState, SuccessMessage } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';

const STATUS = ['Disponível', 'Reservado', 'Em uso', 'Em manutenção', 'Indisponível'];

/** READ do CRUD de equipamentos (Laura) + botão de DELETE lógico. */
export default function EquipmentList() {
  const { user } = useApp();
  const navigate = useNavigate();
  const { dados, carregando, erro, recarregar } = useApi('/equipamentos');   // GET /api/equipamentos
  const categorias = useApi('/categorias');
  const locais = useApi('/locais');
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState('');
  const [local, setLocal] = useState('');
  const [mensagem, setMensagem] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  const canManage = ['admin', 'tecnico'].includes(user?.perfil);
  const filtrados = (dados || []).filter((eq) =>
    (!search || eq.nome.toLowerCase().includes(search.toLowerCase()) || (eq.patrimonio || '').toLowerCase().includes(search.toLowerCase()))
    && (!categoria || String(eq.categoriaId) === categoria)
    && (!status || eq.status === status)
    && (!local || String(eq.localId) === local)
  );

  /** DELETE /api/equipamentos/{id} -> UPDATE equipamento SET ativo = FALSE */
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
          <label className="form-label">Busca</label>
          <div className="form-input-wrapper">
            <input type="search" className="form-input" placeholder="Nome ou patrimônio..." value={search}
              onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '40px' }} />
            <Search size={18} style={{ position: 'absolute', left: 13, top: 14, color: 'var(--color-text-muted)' }} />
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
                <tr><th>Equipamento</th><th>Patrimônio</th><th>Categoria</th><th>Local</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {filtrados.map((eq) => (
                  <tr key={eq.id}>
                    <td><div className="table-equipment">{eq.imagemUrl && <img src={eq.imagemUrl} alt="" />}{eq.nome}</div></td>
                    <td>{eq.patrimonio || '—'}</td>
                    <td>{eq.categoriaNome}</td>
                    <td>{eq.localNome || '—'}</td>
                    <td><StatusBadge status={eq.status} /></td>
                    <td>
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
