/*
 * ============================================================
 *  RelatorioView.jsx  |  Camada: Front-end React (tela genérica de relatório)
 *  Responsável na apresentação: Laura, João e Camilla  |  Disciplina: Medição (Saídas Externas - SE)
 * ------------------------------------------------------------
 *  O que faz: UMA tela que mostra qualquer relatório (SE). Lê a config em relatorioConfigs.jsx
 *  pelo tipo da URL (/relatorios/utilizacao), pede o relatório ao backend e desenha:
 *  filtro de período (se o relatório tiver), cards de totais, tabela e botão "Exportar CSV".
 *  Fluxo do botão "Gerar relatório":
 *    GET /api/relatorios/utilizacao?inicio=2026-09-05&fim=2026-11-04
 *      -> RelatorioController -> RelatorioService (cálculos) -> RelatorioDao (SELECT com JOIN/GROUP BY)
 *  Quem chama: App.jsx, rota /relatorios/:tipo (cards do Reports.jsx).
 *  Chama: api.get, RELATORIOS (config), Layout, States.
 * ============================================================
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import Layout from '../components/Layout';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { RELATORIOS } from '../config/relatorioConfigs';
import { api } from '../services/api';
import { formatDateBR, formatDateTimeBR, isoDate } from '../utils/format';

export default function RelatorioView() {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const config = RELATORIOS[tipo];
  // Período padrão: 30 dias para trás e 30 para frente (o backend usa o mesmo padrão).
  const [inicio, setInicio] = useState(isoDate(-30));
  const [fim, setFim] = useState(isoDate(30));
  const [relatorio, setRelatorio] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Botão "Gerar relatório": GET no endpoint da config, com o período quando o relatório tiver filtro.
  const gerar = useCallback(async () => {
    if (!config) return;
    setCarregando(true);
    setErro(null);
    try {
      const filtro = config.periodo ? `?inicio=${inicio}&fim=${fim}` : '';
      setRelatorio(await api.get(`${config.endpoint}${filtro}`));
    } catch (e) {
      setRelatorio(null);
      setErro(e.message); // ex.: 403 "módulo não habilitado" quando o cliente não tem lateFee
    } finally {
      setCarregando(false);
    }
  }, [config, inicio, fim]);

  // Gera automaticamente ao abrir a tela (só uma vez por tipo; depois, pelo botão).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { gerar(); }, [tipo]);

  if (!config) return <Layout><ErrorState mensagem="Relatório não encontrado." /></Layout>;

  // Valor mostrado numa célula: usa o formato da config ou o valor puro.
  const mostrar = (def, valor, linha) => (def.formato ? def.formato(valor, linha) : valor ?? '—');

  // "Exportar CSV": monta o texto separado por ";" (padrão do Excel em português) e baixa o arquivo.
  const exportarCsv = () => {
    const cab = config.colunas.map((c) => c.rotulo).join(';');
    const linhas = relatorio.linhas.map((l) => config.colunas.map((c) => String(l[c.campo] ?? '').replace(/;/g, ',')).join(';'));
    const blob = new Blob(['﻿' + [cab, ...linhas].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `relatorio-${tipo}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Layout fullWidth>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{config.titulo}</h1>
          <p className="page-subtitle">{config.descricao}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/relatorios')}>Voltar</button>
      </div>

      <div className="filters-bar">
        {config.periodo && (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="inicio">De</label>
              <input id="inicio" type="date" className="form-input" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="fim">Até</label>
              <input id="fim" type="date" className="form-input" value={fim} min={inicio} onChange={(e) => setFim(e.target.value)} />
            </div>
          </>
        )}
        <div className="form-group" style={{ alignSelf: 'flex-end', display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-primary" onClick={gerar} disabled={carregando}>
            {carregando ? 'Gerando...' : 'Gerar relatório'}
          </button>
          {relatorio?.linhas.length > 0 && (
            <button type="button" className="btn btn-secondary" onClick={exportarCsv}><Download size={16} /> Exportar CSV</button>
          )}
        </div>
      </div>

      <ErrorState mensagem={erro} />
      {carregando && !relatorio && <LoadingState texto="Gerando relatório..." />}

      {relatorio && (
        <>
          {/* Cards de totais (dados calculados no RelatorioService) */}
          <div className="report-totals">
            {config.totais.map((t) => (
              <div key={t.campo} className="report-total" style={t.largo ? { gridColumn: '1 / -1' } : undefined}>
                <span>{t.rotulo}</span>
                <b style={t.largo ? { fontSize: 15, fontWeight: 500 } : undefined}>{mostrar(t, relatorio.totais[t.campo])}</b>
              </div>
            ))}
          </div>

          {relatorio.linhas.length === 0 ? (
            <EmptyState>Nenhum dado para este relatório.</EmptyState>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>{config.colunas.map((c) => <th key={c.campo}>{c.rotulo}</th>)}</tr>
                </thead>
                <tbody>
                  {relatorio.linhas.map((linha, i) => (
                    <tr key={i}>
                      {config.colunas.map((c) => <td key={c.campo}>{mostrar(c, linha[c.campo], linha)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="report-meta">
            {relatorio.inicio && `Período: ${formatDateBR(relatorio.inicio)} a ${formatDateBR(relatorio.fim)} · `}
            Gerado em {formatDateTimeBR(relatorio.geradoEm)}
          </p>
        </>
      )}
    </Layout>
  );
}
