/*
 * ============================================================
 *  ConsultaView.jsx  |  Camada: Front-end React (tela genérica de consulta)
 *  Responsável na apresentação: Laura, João e Camilla  |  Disciplina: Medição (Consultas Externas - CE)
 * ------------------------------------------------------------
 *  O que faz: UMA tela que mostra qualquer consulta (CE). Lê a config em consultaConfigs.jsx
 *  pelo tipo da URL (/consultas/salas) e desenha:
 *    ENTRADA: os campos de filtro + botão "Consultar";
 *    SAÍDA: a ficha (rótulo/valor) e/ou a tabela que a função "consultar" da config devolver.
 *  Diferente do RelatorioView, aqui não há totais nem cálculos: só os dados recuperados.
 *  Quem chama: App.jsx, rota /consultas/:tipo (cards do Consultas.jsx).
 *  Chama: CONSULTAS (config), Layout, States.
 * ============================================================
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from '../components/Layout';
import { EmptyState, ErrorState } from '../components/States';
import { CONSULTAS } from '../config/consultaConfigs';

export default function ConsultaView() {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const config = CONSULTAS[tipo];
  const [filtros, setFiltros] = useState({});   // valores digitados/escolhidos na ENTRADA
  const [opcoes, setOpcoes] = useState({});     // opções dos selects (algumas vêm de um AIE)
  const [resultado, setResultado] = useState(null); // SAÍDA
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Ao abrir a tela: carrega as opções de cada select da entrada.
  useEffect(() => {
    if (!config) return;
    setFiltros({}); setResultado(null); setErro(null);
    config.filtros.filter((f) => f.opcoes).forEach(async (f) => {
      try {
        const lista = await f.opcoes();
        setOpcoes((atual) => ({ ...atual, [f.campo]: lista }));
      } catch (e) {
        setErro(e.message);
      }
    });
  }, [config]);

  if (!config) return <Layout><ErrorState mensagem="Consulta não encontrada." /></Layout>;

  const faltaObrigatorio = config.filtros.some((f) => f.obrigatorio && !filtros[f.campo]);

  // Botão "Consultar": chama a função da config com os filtros e mostra o que ela devolver.
  const consultar = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      setResultado(await config.consultar(filtros));
    } catch (ex) {
      setResultado(null);
      setErro(ex.message); // ex.: "Patrimônio não encontrado"
    } finally {
      setCarregando(false);
    }
  };

  const mostrar = (col, valor) => (col.formato ? col.formato(valor) : valor ?? '—');
  const { ficha, tabela } = resultado || {};

  return (
    <Layout fullWidth>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{config.titulo}</h1>
          <p className="page-subtitle">{config.descricao}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/consultas')}>Voltar</button>
      </div>

      {/* ENTRADA */}
      <form className="filters-bar" onSubmit={consultar} aria-label="Filtros da consulta">
        {config.filtros.map((f) => (
          <div className="form-group" key={f.campo}>
            <label className="form-label" htmlFor={f.campo}>{f.rotulo}{f.obrigatorio ? ' *' : ''}</label>
            {f.tipo === 'select' ? (
              <select id={f.campo} className="form-select" value={filtros[f.campo] || ''}
                onChange={(e) => setFiltros({ ...filtros, [f.campo]: e.target.value })}>
                <option value="">{f.obrigatorio ? 'Selecione...' : 'Todos'}</option>
                {(opcoes[f.campo] || []).map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
              </select>
            ) : (
              <input id={f.campo} type={f.tipo === 'data' ? 'date' : 'text'} className="form-input" value={filtros[f.campo] || ''}
                onChange={(e) => setFiltros({ ...filtros, [f.campo]: e.target.value })} />
            )}
          </div>
        ))}
        <div className="form-group" style={{ flex: '0 0 auto' }}>
          <button type="submit" className="btn btn-primary" disabled={carregando || faltaObrigatorio}>
            <Search size={16} /> {carregando ? 'Consultando...' : 'Consultar'}
          </button>
        </div>
      </form>

      <ErrorState mensagem={erro} />

      {/* SAÍDA: ficha (um registro) */}
      {ficha && (
        <section className="detail-section">
          <h3>{ficha.titulo}</h3>
          <div className="detail-meta-grid consulta-ficha">
            {ficha.campos.map(([rotulo, valor]) => (
              <div className="detail-meta" key={rotulo}>
                <span className="detail-meta__label">{rotulo}</span>
                <span className="detail-meta__value">{valor ?? '—'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SAÍDA: tabela (vários registros) */}
      {tabela && (
        <section className="detail-section">
          <h3>{tabela.titulo}</h3>
          {tabela.linhas.length === 0 ? (
            <EmptyState>{tabela.vazio}</EmptyState>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr>{tabela.colunas.map((c) => <th key={c.campo}>{c.rotulo}</th>)}</tr></thead>
                <tbody>
                  {tabela.linhas.map((linha, i) => (
                    <tr key={i}>{tabela.colunas.map((c) => (
                      // curta = coluna de código/data que não deve quebrar linha
                      <td key={c.campo} style={c.curta ? { whiteSpace: 'nowrap' } : undefined}>{mostrar(c, linha[c.campo])}</td>
                    ))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {!resultado && !erro && <EmptyState>Escolha os filtros e clique em Consultar.</EmptyState>}
    </Layout>
  );
}
