import CategoryIcon from '../components/CategoryIcon';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';
import { formatDateBR, formatMoney, PERFIS } from '../utils/format';

/**
 * ============================================================
 *  Configurações das telas de CRUD (usadas pelo CrudPage.jsx)
 * ============================================================
 * Cada objeto abaixo VIRA uma tela completa (listar, cadastrar, editar, desativar)
 * sem escrever um novo componente. É a compactação de código focada em reuso.
 *
 * Campos:  { nome, rotulo, tipo: text|email|password|textarea|linhas|number|date|select,
 *            obrigatorio, opcoes: [{valor, rotulo}], opcoesDe: {endpoint, rotulo}, somenteCriacao }
 * Colunas: { campo, rotulo, badge?, formato?(valor, item) }
 */

const ICONES = [
  { valor: 'cpu', rotulo: 'Eletrônica (chip)' },
  { valor: 'camera', rotulo: 'Áudio e vídeo (câmera)' },
  { valor: 'monitor', rotulo: 'Informática (monitor)' },
  { valor: 'wrench', rotulo: 'Ferramentas (chave)' },
];

const periodo = (_, r) => `${formatDateBR(r.dataInicio)} a ${formatDateBR(r.dataFim)}`;

export const CRUDS = {
  // ---------------- João ----------------
  categorias: {
    titulo: 'Categorias',
    subtitulo: 'Agrupamentos usados no catálogo de equipamentos.',
    singular: 'Categoria',
    feminino: true,
    endpoint: '/categorias',
    valoresIniciais: { icone: 'cpu' },
    campos: [
      { nome: 'nome', rotulo: 'Nome', obrigatorio: true, placeholder: 'Ex.: Robótica' },
      { nome: 'icone', rotulo: 'Ícone', tipo: 'select', opcoes: ICONES },
    ],
    colunas: [
      { campo: 'icone', rotulo: 'Ícone', formato: (v) => <CategoryIcon name={v} size={18} /> },
      { campo: 'nome', rotulo: 'Nome' },
    ],
  },

  locais: {
    titulo: 'Locais',
    subtitulo: 'Laboratórios e salas onde os equipamentos ficam guardados.',
    singular: 'Local',
    endpoint: '/locais',
    campos: [
      { nome: 'nome', rotulo: 'Nome', obrigatorio: true, placeholder: 'Ex.: Laboratório de Eletrônica' },
      { nome: 'descricao', rotulo: 'Descrição / referência', placeholder: 'Ex.: Bloco A, 1º andar' },
    ],
    colunas: [
      { campo: 'nome', rotulo: 'Nome' },
      { campo: 'descricao', rotulo: 'Descrição' },
    ],
  },

  // ---------------- Camilla ----------------
  usuarios: {
    titulo: 'Usuários',
    subtitulo: 'Pessoas com acesso ao LabShare neste cliente.',
    singular: 'Usuário',
    endpoint: '/usuarios',
    valoresIniciais: { perfil: 'aluno' },
    // VARIABILIDADE: o perfil "Gestor" só aparece para clientes com aprovação de gestor
    campos: ({ hasFeature }) => [
      { nome: 'nome', rotulo: 'Nome completo', obrigatorio: true },
      { nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true },
      {
        nome: 'perfil', rotulo: 'Perfil', tipo: 'select', obrigatorio: true,
        opcoes: Object.entries(PERFIS)
          .filter(([codigo]) => codigo !== 'gestor' || hasFeature('approvalRequired'))
          .map(([valor, rotulo]) => ({ valor, rotulo })),
      },
      { nome: 'senha', rotulo: 'Senha', tipo: 'password', ajuda: 'Mínimo 6 caracteres. Na edição, deixe em branco para manter a atual.' },
    ],
    colunas: [
      { campo: 'nome', rotulo: 'Nome' },
      { campo: 'email', rotulo: 'E-mail' },
      { campo: 'perfil', rotulo: 'Perfil', formato: (v) => PERFIS[v] || v },
    ],
  },

  manutencoesHistorico: {
    titulo: 'Histórico de manutenções',
    subtitulo: 'Reparos já realizados e em andamento.',
    singular: 'Manutenção',
    feminino: true,
    endpoint: '/manutencoes',
    podeCriar: false,
    podeEditar: false,
    podeExcluir: false,
    campos: [],
    colunas: [
      { campo: 'equipamentoNome', rotulo: 'Equipamento' },
      { campo: 'ocorrenciaDescricao', rotulo: 'Problema' },
      { campo: 'descricaoReparo', rotulo: 'Reparo' },
      { campo: 'responsavelNome', rotulo: 'Responsável' },
      { campo: 'dataInicio', rotulo: 'Início', formato: formatDateBR },
      { campo: 'dataFim', rotulo: 'Fim', formato: (v) => (v ? formatDateBR(v) : '—') },
      { campo: 'status', rotulo: 'Status', badge: true },
    ],
  },

  // ---------------- Técnico ----------------
  ocorrencias: {
    titulo: 'Ocorrências',
    subtitulo: 'Defeitos registrados. Toda ocorrência aberta tira o equipamento de circulação (RN09).',
    singular: 'Ocorrência',
    feminino: true,
    endpoint: '/ocorrencias',
    rotuloExcluir: 'Excluir',
    valoresIniciais: { prioridade: 'Média' },
    campos: [
      {
        nome: 'equipamentoId', rotulo: 'Equipamento', obrigatorio: true, somenteCriacao: true,
        opcoesDe: { endpoint: '/equipamentos', rotulo: (e) => `${e.nome} (${e.patrimonio || 's/ patrimônio'}) – ${e.status}` },
      },
      { nome: 'prioridade', rotulo: 'Prioridade', tipo: 'select', opcoes: ['Baixa', 'Média', 'Alta'].map((p) => ({ valor: p, rotulo: p })) },
      { nome: 'descricao', rotulo: 'Descrição do problema', tipo: 'textarea', obrigatorio: true, largo: true },
    ],
    colunas: [
      { campo: 'equipamentoNome', rotulo: 'Equipamento' },
      { campo: 'descricao', rotulo: 'Problema' },
      { campo: 'prioridade', rotulo: 'Prioridade', badge: true },
      { campo: 'dataAbertura', rotulo: 'Data', formato: formatDateBR },
      { campo: 'status', rotulo: 'Status', badge: true },
    ],
    podeExcluirItem: (o) => o.status === 'Aguardando manutenção',
    podeEditarItem: (o) => o.status !== 'Concluída',
  },

  // ---------------- Laura (visão administrativa das reservas) ----------------
  reservas: {
    titulo: 'Reservas',
    subtitulo: 'Todas as reservas do cliente. O aluno também cria/cancela pelas telas dele.',
    singular: 'Reserva',
    feminino: true,
    endpoint: '/reservas',
    rotuloExcluir: 'Cancelar',
    // VARIABILIDADE: o campo "Centro de custo" só existe para clientes com costCenter
    campos: ({ hasFeature }) => [
      {
        nome: 'usuarioId', rotulo: 'Solicitante', obrigatorio: true, somenteCriacao: true,
        opcoesDe: { endpoint: '/usuarios', rotulo: (u) => `${u.nome} (${PERFIS[u.perfil]})` },
      },
      {
        nome: 'equipamentoId', rotulo: 'Equipamento', obrigatorio: true, somenteCriacao: true,
        opcoesDe: { endpoint: '/equipamentos', rotulo: (e) => `${e.nome} – ${e.status}` },
      },
      { nome: 'dataInicio', rotulo: 'Data de início', tipo: 'date', obrigatorio: true },
      { nome: 'dataFim', rotulo: 'Data de término', tipo: 'date', obrigatorio: true },
      ...(hasFeature('costCenter')
        ? [{ nome: 'centroCustoId', rotulo: 'Centro de custo', obrigatorio: true, opcoesDe: { endpoint: '/centros-custo', rotulo: (c) => c.nome } }]
        : []),
      { nome: 'justificativa', rotulo: 'Justificativa', tipo: 'textarea', largo: true },
    ],
    colunas: [
      { campo: 'usuarioNome', rotulo: 'Solicitante' },
      { campo: 'equipamentoNome', rotulo: 'Equipamento' },
      { campo: 'dataInicio', rotulo: 'Período', formato: periodo },
      { campo: 'centroCustoNome', rotulo: 'Centro de custo', formato: (v) => v || '—' },
      { campo: 'status', rotulo: 'Status', badge: true },
    ],
    podeEditarItem: (r) => ['Agendada', 'Aguardando aprovação'].includes(r.status),
    podeExcluirItem: (r) => ['Agendada', 'Aguardando aprovação'].includes(r.status),
  },

  // ---------------- Módulos exclusivos (VARIABILIDADE) ----------------
  centrosCusto: {
    titulo: 'Centros de custo',
    subtitulo: 'Exclusivo de clientes com o recurso "costCenter" (Empresa Corporativa).',
    singular: 'Centro de custo',
    endpoint: '/centros-custo',
    aviso: 'Módulo variável: só aparece no menu e só responde no backend quando o cliente tem "Vincular reservas a centro de custo" ligado na Personalização.',
    campos: [
      { nome: 'codigo', rotulo: 'Código', placeholder: 'Ex.: CC-ENG' },
      { nome: 'nome', rotulo: 'Nome', obrigatorio: true },
    ],
    colunas: [
      { campo: 'codigo', rotulo: 'Código' },
      { campo: 'nome', rotulo: 'Nome' },
    ],
  },

  multas: {
    titulo: 'Multas por atraso',
    subtitulo: 'Exclusivo de clientes com o recurso "lateFee" (Escola Técnica).',
    singular: 'Multa',
    feminino: true,
    endpoint: '/multas',
    aviso: 'Personalização deste cliente: a multa é gerada automaticamente na devolução em atraso, pela estratégia MultaPorDiaDeAtraso (padrão Strategy). Clientes sem este recurso não veem este módulo.',
    podeCriar: false,
    podeEditar: false,
    podeExcluir: false,
    campos: [],
    colunas: [
      { campo: 'usuarioNome', rotulo: 'Aluno' },
      { campo: 'equipamentoNome', rotulo: 'Equipamento' },
      { campo: 'diasAtraso', rotulo: 'Dias de atraso' },
      { campo: 'valor', rotulo: 'Valor', formato: (v) => formatMoney(v) },
      { campo: 'status', rotulo: 'Status', formato: (v) => <StatusBadge status={v} /> },
    ],
    acoesExtras: (multa, { recarregar, setMensagem, setErro }) =>
      multa.status === 'Em aberto' && (
        <button
          type="button"
          className="btn btn-link btn-sm"
          onClick={async () => {
            try {
              await api.post(`/multas/${multa.id}/pagar`);
              setMensagem('Pagamento registrado.');
              recarregar();
            } catch (e) {
              setErro(e.message);
            }
          }}
        >
          Marcar como paga
        </button>
      ),
  },
};
