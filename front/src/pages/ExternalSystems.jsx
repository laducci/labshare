/*
 * ============================================================
 *  ExternalSystems.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura, João e Camilla  |  Disciplina: Medição (Arquivos de Interface Externa - AIE)
 * ------------------------------------------------------------
 *  O que faz: mostra, SOMENTE PARA CONSULTA, os dados que o LabShare lê de outros sistemas da
 *  instituição (patrimônio, calendário, ensalamento, acadêmico/RH, compras). Esses dados são
 *  mantidos FORA do LabShare: aqui não existe incluir/alterar/excluir — por isso contam como AIE.
 *  Quem chama: App.jsx, rota /admin/integracoes (menu "Sistemas externos").
 *  Chama: GET /api/integracoes (resumo) e GET /api/integracoes/{chave} (IntegracaoController).
 * ============================================================
 */
import { useState } from 'react';
import Layout from '../components/Layout';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useApi } from '../hooks/useApi';
import { formatDateBR, formatMoney } from '../utils/format';

// Colunas de cada AIE (chave = final da URL /api/integracoes/{chave}) e quem é o responsável.
const AIES = {
  patrimonio: {
    titulo: 'Bens patrimoniais', autora: 'Laura', id: (b) => b.numero,
    colunas: [
      ['numero', 'Nº patrimônio'], ['descricao', 'Descrição'], ['marca', 'Marca'], ['modelo', 'Modelo'],
      ['numeroSerie', 'Nº de série'], ['dataAquisicao', 'Aquisição', formatDateBR],
      ['valorAquisicao', 'Valor', formatMoney], ['situacao', 'Situação'], ['unidadeResponsavel', 'Unidade'],
    ],
  },
  feriados: {
    titulo: 'Calendário de feriados', autora: 'Laura', id: (f) => f.data,
    colunas: [['data', 'Data', formatDateBR], ['descricao', 'Descrição'], ['tipo', 'Tipo']],
  },
  salas: {
    titulo: 'Salas do ensalamento', autora: 'João', id: (s) => s.codigo,
    colunas: [['codigo', 'Código'], ['nome', 'Nome'], ['bloco', 'Bloco'], ['andar', 'Andar'], ['capacidade', 'Capacidade'], ['tipo', 'Tipo']],
  },
  'grupos-patrimoniais': {
    titulo: 'Grupos patrimoniais', autora: 'João', id: (g) => g.codigo,
    colunas: [
      ['codigo', 'Código'], ['nome', 'Nome'], ['descricao', 'Descrição'],
      ['vidaUtilAnos', 'Vida útil (anos)'], ['taxaDepreciacaoAnual', 'Depreciação/ano', (v) => `${v}%`],
    ],
  },
  pessoas: {
    titulo: 'Alunos e servidores', autora: 'Camilla', id: (p) => p.matricula,
    colunas: [['matricula', 'Matrícula'], ['nome', 'Nome'], ['email', 'E-mail'], ['vinculo', 'Vínculo'], ['curso', 'Curso / setor'], ['situacao', 'Situação']],
  },
  fornecedores: {
    titulo: 'Fornecedores de assistência técnica', autora: 'Camilla', id: (f) => f.cnpj,
    colunas: [
      ['cnpj', 'CNPJ'], ['razaoSocial', 'Razão social'], ['nomeFantasia', 'Nome fantasia'], ['especialidade', 'Especialidade'],
      ['telefone', 'Telefone'], ['email', 'E-mail'], ['contratoVigente', 'Contrato', (v) => (v ? 'Vigente' : 'Encerrado')],
    ],
  },
};

export default function ExternalSystems() {
  // Resumo: GET /api/integracoes -> [{chave, sistema, descricao, registros}]
  const resumo = useApi('/integracoes');
  const [chave, setChave] = useState('patrimonio');
  const aie = AIES[chave];
  const info = (resumo.dados || []).find((s) => s.chave === chave);

  return (
    <Layout fullWidth>
      <div className="page-header">
        <h1 className="page-title">Sistemas externos</h1>
        <p className="page-subtitle">Dados mantidos por outros sistemas da instituição. O LabShare apenas consulta (AIE).</p>
      </div>

      {/* Abas: um botão por AIE, com a quantidade de registros */}
      <div className="filters-bar" style={{ flexWrap: 'wrap', gap: 8 }}>
        {Object.entries(AIES).map(([k, a]) => {
          const qtd = (resumo.dados || []).find((s) => s.chave === k)?.registros;
          return (
            <button key={k} type="button" className={`btn btn-sm ${k === chave ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChave(k)}>
              {a.titulo}{qtd !== undefined ? ` (${qtd})` : ''}
            </button>
          );
        })}
      </div>

      {info && (
        <div className="info-panel" style={{ marginBottom: 16 }}>
          <strong>{info.sistema}</strong> <span className="aie-tag">Somente leitura</span>
          <p style={{ marginTop: 4 }}>{info.descricao} Responsável na contagem: {aie.autora}.</p>
        </div>
      )}

      {/* key={chave}: ao trocar de aba, a tabela é recriada e busca os dados do novo sistema */}
      <TabelaAie key={chave} chave={chave} />
    </Layout>
  );
}

/** Tabela de UM sistema externo: GET /api/integracoes/{chave} (só leitura; vem do arquivo do sistema externo). */
function TabelaAie({ chave }) {
  const registros = useApi(`/integracoes/${chave}`);
  const aie = AIES[chave];
  return (
    <>
      {registros.carregando && <LoadingState />}
      <ErrorState mensagem={registros.erro} />
      {!registros.carregando && (registros.dados || []).length === 0 && !registros.erro && <EmptyState>Nenhum registro.</EmptyState>}
      {!registros.carregando && (registros.dados || []).length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>{aie.colunas.map(([campo, rotulo]) => <th key={campo}>{rotulo}</th>)}</tr>
            </thead>
            <tbody>
              {registros.dados.map((item) => (
                <tr key={aie.id(item)}>
                  {aie.colunas.map(([campo, , formato]) => (
                    <td key={campo}>{formato ? formato(item[campo]) : item[campo] ?? '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
