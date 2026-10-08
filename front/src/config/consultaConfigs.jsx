/*
 * ============================================================
 *  consultaConfigs.jsx  |  Camada: Front-end (configuração das consultas)
 *  Responsável na apresentação: Laura (CE01, CE02), João (CE03, CE05), Camilla (CE04, CE06)
 *  Disciplina: Medição (Consultas Externas - CE)
 * ------------------------------------------------------------
 *  O que faz: cada objeto descreve UMA consulta (CE): os campos de ENTRADA (filtros) e a função
 *  "consultar", que busca os dados e devolve a SAÍDA (ficha e/ou tabela). A tela ConsultaView lê
 *  esta descrição e monta a consulta inteira (mesma ideia do relatorioConfigs + RelatorioView).
 *  Por que são CE (e não SE): só RECUPERAM dados gravados nos ALI/AIE e mostram na tela.
 *  Não há cálculo, total nem dado derivado, e nada é gravado.
 *  Quem chama: pages/Consultas.jsx (cards) e pages/ConsultaView.jsx (tela da consulta).
 *  Chama: GETs que já existem na API (integracoes, equipamentos, locais, usuarios, reservas, historico).
 * ============================================================
 */
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';
import { PERFIS, formatDateBR, formatDateTimeBR, formatMoney } from '../utils/format';

const badge = (v) => <StatusBadge status={v} />;

// Ações gravadas no Histórico (RN11) e o texto mostrado na tela.
const ACOES = {
  CRIACAO: 'Inclusão', ATUALIZACAO: 'Alteração', DESATIVACAO: 'Desativação', CANCELAMENTO: 'Cancelamento',
  APROVACAO: 'Aprovação', REJEICAO: 'Rejeição', RETIRADA: 'Retirada', DEVOLUCAO: 'Devolução',
  CONCLUSAO: 'Conclusão', LIBERACAO: 'Liberação', PAGAMENTO: 'Pagamento', PERSONALIZACAO: 'Personalização',
};
// Tipos de registro do Histórico (coluna "entidade").
const REGISTROS = {
  equipamento: 'Equipamento', reserva: 'Reserva', usuario: 'Usuário', categoria: 'Categoria', local: 'Local',
  ocorrencia: 'Ocorrência', manutencao: 'Manutenção', multa: 'Multa', centro_custo: 'Centro de custo', tenant: 'Cliente',
};
const opcoesDe = (mapa) => Object.entries(mapa).map(([valor, rotulo]) => ({ valor, rotulo }));

// Chave = parte final da URL (/consultas/patrimonio).
export const CONSULTAS = {
  // ---------------- Laura ----------------
  patrimonio: {
    id: 'CE01',
    titulo: 'Consultar bem patrimonial',
    autora: 'Laura',
    descricao: 'Dados do bem no Sistema de Patrimônio e o equipamento ligado a ele no LabShare.',
    perfis: ['admin'],
    // ENTRADA: nº do patrimônio. As opções vêm do AIE Bem patrimonial.
    filtros: [
      { campo: 'numero', rotulo: 'Nº do patrimônio', tipo: 'select', obrigatorio: true,
        opcoes: async () => (await api.get('/integracoes/patrimonio')).map((b) => ({ valor: b.numero, rotulo: `${b.numero} – ${b.descricao}` })) },
    ],
    // SAÍDA: ficha do bem (AIE) + equipamento do LabShare com o mesmo patrimônio (ALI Equipamento, com nome da categoria e do local).
    consultar: async ({ numero }) => {
      const bem = await api.get(`/integracoes/patrimonio/${encodeURIComponent(numero)}`);
      const equipamentos = await api.get('/equipamentos');
      const eq = equipamentos.find((e) => e.patrimonio === numero);
      return {
        ficha: {
          titulo: 'Sistema de Patrimônio',
          campos: [
            ['Número', bem.numero], ['Descrição', bem.descricao], ['Marca', bem.marca], ['Modelo', bem.modelo],
            ['Nº de série', bem.numeroSerie], ['Data de aquisição', formatDateBR(bem.dataAquisicao)],
            ['Valor de aquisição', formatMoney(bem.valorAquisicao)], ['Situação', bem.situacao],
            ['Unidade responsável', bem.unidadeResponsavel],
          ],
        },
        tabela: {
          titulo: 'Equipamento no LabShare',
          vazio: 'Este bem ainda não foi cadastrado como equipamento.',
          colunas: [
            { campo: 'nome', rotulo: 'Equipamento' }, { campo: 'categoriaNome', rotulo: 'Categoria' },
            { campo: 'localNome', rotulo: 'Local' }, { campo: 'status', rotulo: 'Status', formato: badge },
          ],
          linhas: eq ? [eq] : [],
        },
      };
    },
  },

  historico: {
    id: 'CE02',
    titulo: 'Consultar histórico de ações',
    autora: 'Laura',
    descricao: 'Quem fez o quê e quando no LabShare (auditoria).',
    perfis: ['admin'],
    // ENTRADA: tipo de registro, ação e período (listas fixas, sem consultar arquivo).
    filtros: [
      { campo: 'entidade', rotulo: 'Tipo de registro', tipo: 'select', opcoes: async () => opcoesDe(REGISTROS) },
      { campo: 'acao', rotulo: 'Ação', tipo: 'select', opcoes: async () => opcoesDe(ACOES) },
      { campo: 'inicio', rotulo: 'De', tipo: 'data' },
      { campo: 'fim', rotulo: 'Até', tipo: 'data' },
    ],
    // SAÍDA: linhas do Histórico com o nome do usuário (JOIN com Usuário), já filtradas.
    consultar: async ({ entidade, acao, inicio, fim }) => {
      const lista = await api.get(`/historico${entidade ? `?entidade=${entidade}` : ''}`);
      const dia = (h) => String(h.dataHora).slice(0, 10);
      return {
        tabela: {
          titulo: 'Ações registradas',
          vazio: 'Nenhuma ação encontrada com esses filtros.',
          colunas: [
            { campo: 'dataHora', rotulo: 'Data e hora', formato: formatDateTimeBR, curta: true },
            { campo: 'entidade', rotulo: 'Registro', formato: (v) => REGISTROS[v] || v },
            { campo: 'entidadeId', rotulo: 'Código', curta: true },
            { campo: 'acao', rotulo: 'Ação', formato: (v) => ACOES[v] || v },
            { campo: 'descricao', rotulo: 'Descrição' },
            { campo: 'usuarioNome', rotulo: 'Usuário' },
          ],
          linhas: lista.filter((h) => (!acao || h.acao === acao) && (!inicio || dia(h) >= inicio) && (!fim || dia(h) <= fim)),
        },
      };
    },
  },

  // ---------------- João ----------------
  salas: {
    id: 'CE03',
    titulo: 'Consultar salas do ensalamento',
    autora: 'João',
    descricao: 'Salas oficiais da instituição, o local do LabShare ligado a cada uma e os equipamentos que estão nele.',
    perfis: ['admin'],
    // ENTRADA: bloco e tipo de sala. As opções vêm do AIE Sala do ensalamento.
    filtros: [
      { campo: 'bloco', rotulo: 'Bloco', tipo: 'select',
        opcoes: async () => [...new Set((await api.get('/integracoes/salas')).map((s) => s.bloco))].map((b) => ({ valor: b, rotulo: b })) },
      { campo: 'tipo', rotulo: 'Tipo de sala', tipo: 'select',
        opcoes: async () => [...new Set((await api.get('/integracoes/salas')).map((s) => s.tipo))].map((t) => ({ valor: t, rotulo: t })) },
    ],
    // SAÍDA: salas (AIE) + local ligado pelo código da sala (ALI Local) + equipamentos desse local (ALI Equipamento).
    consultar: async ({ bloco, tipo }) => {
      const [salas, locais, equipamentos] = await Promise.all([api.get('/integracoes/salas'), api.get('/locais'), api.get('/equipamentos')]);
      const linhas = salas.filter((s) => (!bloco || s.bloco === bloco) && (!tipo || s.tipo === tipo)).map((s) => {
        const local = locais.find((l) => l.codigoSala === s.codigo);
        const nomes = local ? equipamentos.filter((e) => e.localId === local.id).map((e) => e.nome) : [];
        return { ...s, local: local?.nome, equipamentos: nomes.join(', ') };
      });
      return {
        tabela: {
          titulo: 'Salas encontradas',
          vazio: 'Nenhuma sala encontrada com esses filtros.',
          colunas: [
            { campo: 'codigo', rotulo: 'Código', curta: true }, { campo: 'nome', rotulo: 'Sala' }, { campo: 'bloco', rotulo: 'Bloco', curta: true },
            { campo: 'andar', rotulo: 'Andar', curta: true }, { campo: 'capacidade', rotulo: 'Capacidade' }, { campo: 'tipo', rotulo: 'Tipo' },
            { campo: 'local', rotulo: 'Local no LabShare', formato: (v) => v || 'Não vinculada' },
            { campo: 'equipamentos', rotulo: 'Equipamentos no local', formato: (v) => v || '—' },
          ],
          linhas,
        },
      };
    },
  },

  grupos: {
    id: 'CE05',
    titulo: 'Consultar grupo patrimonial',
    autora: 'João',
    descricao: 'Dados do grupo no Sistema de Patrimônio e as categorias e equipamentos do LabShare ligados a ele.',
    perfis: ['admin'],
    // ENTRADA: grupo patrimonial. As opções vêm do AIE Grupo patrimonial.
    filtros: [
      { campo: 'codigo', rotulo: 'Grupo patrimonial', tipo: 'select', obrigatorio: true,
        opcoes: async () => (await api.get('/integracoes/grupos-patrimoniais')).map((g) => ({ valor: g.codigo, rotulo: `${g.codigo} – ${g.nome}` })) },
    ],
    // SAÍDA: ficha do grupo (AIE) + equipamentos das categorias ligadas a ele (ALI Categoria e ALI Equipamento).
    consultar: async ({ codigo }) => {
      const [grupos, categorias, equipamentos] = await Promise.all([
        api.get('/integracoes/grupos-patrimoniais'), api.get('/categorias'), api.get('/equipamentos')]);
      const grupo = grupos.find((g) => g.codigo === codigo);
      if (!grupo) throw new Error(`Grupo ${codigo} não encontrado no Sistema de Patrimônio.`);
      const minhas = categorias.filter((c) => c.grupoPatrimonial === codigo);
      return {
        ficha: {
          titulo: 'Sistema de Patrimônio',
          campos: [
            ['Código', grupo.codigo], ['Nome', grupo.nome], ['Descrição', grupo.descricao],
            ['Vida útil', `${grupo.vidaUtilAnos} anos`], ['Taxa de depreciação anual', `${String(grupo.taxaDepreciacaoAnual).replace('.', ',')}%`],
          ],
        },
        tabela: {
          titulo: 'Categorias e equipamentos no LabShare',
          vazio: 'Nenhuma categoria do LabShare está ligada a este grupo.',
          colunas: [
            { campo: 'categoriaNome', rotulo: 'Categoria' }, { campo: 'nome', rotulo: 'Equipamento' },
            { campo: 'patrimonio', rotulo: 'Patrimônio', curta: true }, { campo: 'status', rotulo: 'Status', formato: badge },
          ],
          linhas: equipamentos.filter((e) => minhas.some((c) => c.id === e.categoriaId)),
        },
      };
    },
  },

  // ---------------- Camilla ----------------
  pessoas: {
    id: 'CE04',
    titulo: 'Consultar aluno ou servidor',
    autora: 'Camilla',
    descricao: 'Situação da pessoa no Sistema Acadêmico/RH, o acesso dela ao LabShare e as reservas que fez.',
    perfis: ['admin'],
    // ENTRADA: matrícula. As opções vêm do AIE Pessoa institucional.
    filtros: [
      { campo: 'matricula', rotulo: 'Matrícula', tipo: 'select', obrigatorio: true,
        opcoes: async () => (await api.get('/integracoes/pessoas')).map((p) => ({ valor: p.matricula, rotulo: `${p.matricula} – ${p.nome}` })) },
    ],
    // SAÍDA: ficha da pessoa (AIE) + perfil no LabShare (ALI Usuário) + reservas dela (ALI Reserva, com nome do Equipamento).
    consultar: async ({ matricula }) => {
      const [pessoas, usuarios, reservas] = await Promise.all([api.get('/integracoes/pessoas'), api.get('/usuarios'), api.get('/reservas')]);
      const pessoa = pessoas.find((p) => p.matricula === matricula);
      if (!pessoa) throw new Error(`Matrícula ${matricula} não encontrada no Sistema Acadêmico.`);
      const usuario = usuarios.find((u) => u.matricula === matricula);
      return {
        ficha: {
          titulo: 'Sistema Acadêmico / RH',
          campos: [
            ['Matrícula', pessoa.matricula], ['Nome', pessoa.nome], ['E-mail', pessoa.email], ['Vínculo', pessoa.vinculo],
            ['Curso / setor', pessoa.curso], ['Situação', pessoa.situacao],
            ['Perfil no LabShare', usuario ? PERFIS[usuario.perfil] : 'Sem acesso ao LabShare'],
          ],
        },
        tabela: {
          titulo: 'Reservas no LabShare',
          vazio: 'Nenhuma reserva desta pessoa.',
          colunas: [
            { campo: 'equipamentoNome', rotulo: 'Equipamento' },
            { campo: 'dataInicio', rotulo: 'Início', formato: formatDateBR, curta: true },
            { campo: 'dataFim', rotulo: 'Término', formato: formatDateBR, curta: true },
            { campo: 'status', rotulo: 'Status', formato: badge },
          ],
          linhas: usuario ? reservas.filter((r) => r.usuarioId === usuario.id) : [],
        },
      };
    },
  },
  fornecedores: {
    id: 'CE06',
    titulo: 'Consultar assistência técnica',
    autora: 'Camilla',
    descricao: 'Dados do fornecedor no Sistema de Compras e as manutenções que ele fez nos equipamentos.',
    perfis: ['admin'],
    // ENTRADA: fornecedor. As opções vêm do AIE Fornecedor de assistência técnica.
    filtros: [
      { campo: 'cnpj', rotulo: 'Fornecedor', tipo: 'select', obrigatorio: true,
        opcoes: async () => (await api.get('/integracoes/fornecedores')).map((f) => ({ valor: f.cnpj, rotulo: `${f.nomeFantasia} – ${f.cnpj}` })) },
    ],
    // SAÍDA: ficha do fornecedor (AIE) + manutenções com o CNPJ dele (ALI Manutenção, com nome e patrimônio do Equipamento).
    consultar: async ({ cnpj }) => {
      const [fornecedores, manutencoes] = await Promise.all([api.get('/integracoes/fornecedores'), api.get('/manutencoes')]);
      const f = fornecedores.find((x) => x.cnpj === cnpj);
      if (!f) throw new Error(`Fornecedor ${cnpj} não encontrado no Sistema de Compras.`);
      return {
        ficha: {
          titulo: 'Sistema de Compras',
          campos: [
            ['CNPJ', f.cnpj], ['Razão social', f.razaoSocial], ['Nome fantasia', f.nomeFantasia], ['Especialidade', f.especialidade],
            ['Telefone', f.telefone], ['E-mail', f.email], ['Contrato', f.contratoVigente ? 'Vigente' : 'Encerrado'],
          ],
        },
        tabela: {
          titulo: 'Manutenções feitas por este fornecedor',
          vazio: 'Nenhuma manutenção do LabShare foi feita por este fornecedor.',
          colunas: [
            { campo: 'equipamentoNome', rotulo: 'Equipamento' }, { campo: 'equipamentoPatrimonio', rotulo: 'Patrimônio', curta: true },
            { campo: 'dataInicio', rotulo: 'Início', formato: formatDateBR, curta: true },
            { campo: 'dataFim', rotulo: 'Término', formato: (v) => (v ? formatDateBR(v) : '—'), curta: true },
            { campo: 'status', rotulo: 'Status', formato: badge },
          ],
          linhas: manutencoes.filter((m) => m.fornecedorCnpj === cnpj),
        },
      };
    },
  },
};
