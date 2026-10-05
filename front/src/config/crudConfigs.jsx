/*
 * ============================================================
 *  crudConfigs.jsx  |  Camada: Front-end (configuração das telas de CRUD)
 *  Responsável na apresentação: João  |  Atividade: Q3 (compactação/reuso), Q2 (telas CRUD + variabilidade)
 * ------------------------------------------------------------
 *  O que faz: cada objeto dentro de CRUDS descreve UMA tela de cadastro (título, endpoint da API,
 *  campos do formulário, colunas da tabela, permissões de botões). O CrudPage lê essa descrição
 *  e monta a tela inteira. Criar um cadastro novo = escrever só um objeto aqui.
 *  Quem chama: App.jsx (<Crud nome="..."> -> CRUDS[nome]) e pages/LateFeePanel.jsx (CRUDS.multas).
 *  Chama: nada diretamente na carga; em tempo de uso o CrudPage chama GET/POST/PUT/DELETE em "endpoint",
 *  e a ação extra de multas chama POST /api/multas/{id}/pagar.
 * ============================================================
 */
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

// Opções fixas do select de ícone da categoria (valor salvo no banco -> texto mostrado). Ver CategoryIcon.jsx.
const ICONES = [
  { valor: 'cpu', rotulo: 'Eletrônica (chip)' },
  { valor: 'camera', rotulo: 'Áudio e vídeo (câmera)' },
  { valor: 'monitor', rotulo: 'Informática (monitor)' },
  { valor: 'wrench', rotulo: 'Ferramentas (chave)' },
];

// Formatador da coluna "Período" das reservas: ignora o valor (_) e usa a linha inteira (r) -> "01/10/2026 a 05/10/2026".
const periodo = (_, r) => `${formatDateBR(r.dataInicio)} a ${formatDateBR(r.dataFim)}`;

// Chave do objeto = nome usado em App.jsx (ex.: <Crud nome="categorias" />).
export const CRUDS = {
  // ---------------- João ----------------
  categorias: {
    titulo: 'Categorias',
    subtitulo: 'Agrupamentos usados no catálogo de equipamentos.',
    singular: 'Categoria',
    feminino: true, // concordância nos textos: "Nova categoria", "cadastrada com sucesso"
    // endpoint -> GET/POST /api/categorias e PUT/DELETE /api/categorias/{id} (CategoriaController)
    endpoint: '/categorias',
    valoresIniciais: { icone: 'cpu' }, // valores já preenchidos ao abrir "Nova categoria"
    // campos = formulário (nome = propriedade do JSON enviado ao backend; obrigatorio vira "required" no HTML)
    campos: [
      { nome: 'nome', rotulo: 'Nome', obrigatorio: true, placeholder: 'Ex.: Robótica' },
      { nome: 'icone', rotulo: 'Ícone', tipo: 'select', opcoes: ICONES },
    ],
    // colunas = tabela; "formato" permite desenhar algo diferente do texto puro (aqui, o ícone)
    colunas: [
      { campo: 'icone', rotulo: 'Ícone', formato: (v) => <CategoryIcon name={v} size={18} /> },
      { campo: 'nome', rotulo: 'Nome' },
    ],
  },

  locais: {
    titulo: 'Locais',
    subtitulo: 'Laboratórios e salas onde os equipamentos ficam guardados.',
    singular: 'Local',
    // -> /api/locais (LocalController). Mesma estrutura de categorias: só muda a config.
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
    // -> /api/usuarios (UsuarioController). A senha é transformada em hash BCrypt no UsuarioService (RNF04).
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
      // Campo senha: tipo password esconde o texto; o backend nunca devolve a senha no JSON.
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
    // Tela só de consulta: as manutenções são abertas/concluídas pelo MaintenancePanel e EquipmentMaintenance.
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
    // -> /api/ocorrencias (OcorrenciaController). Criar ocorrência manda o equipamento para "Em manutenção" (RN09).
    endpoint: '/ocorrencias',
    rotuloExcluir: 'Excluir',
    valoresIniciais: { prioridade: 'Média' },
    campos: [
      {
        // opcoesDe: o CrudPage faz GET /api/equipamentos para preencher o select (valor = id, texto = rotulo(e)).
        // somenteCriacao: na edição o equipamento não pode ser trocado, então o campo some.
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
    // Regras por linha: só exclui ocorrência que ainda não entrou em manutenção (o backend confere de novo);
    // ocorrência concluída não pode ser editada.
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
    // "Excluir" de reserva = cancelar: o DELETE /api/reservas/{id} chama ReservaService.cancelar (fica no histórico, RN11).
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
      // RN03: reserva precisa de data inicial e final (validado também no backend, Reserva.validarPeriodo).
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
    // Só reservas que ainda não começaram podem ser editadas/canceladas (em uso ou finalizadas, não).
    podeEditarItem: (r) => ['Agendada', 'Aguardando aprovação'].includes(r.status),
    podeExcluirItem: (r) => ['Agendada', 'Aguardando aprovação'].includes(r.status),
  },

  // ---------------- Módulos exclusivos (VARIABILIDADE) ----------------
  centrosCusto: {
    titulo: 'Centros de custo',
    subtitulo: 'Exclusivo de clientes com o recurso "costCenter" (Empresa Corporativa).',
    singular: 'Centro de custo',
    // -> /api/centros-custo. Sem o recurso costCenter o backend responde 403 e o menu esconde a tela.
    endpoint: '/centros-custo',
    // aviso = caixa de informação mostrada no topo da tela
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
    // -> /api/multas (MultaController). Sem o recurso lateFee: rota protegida no front e 403 no backend.
    endpoint: '/multas',
    aviso: 'Personalização deste cliente: a multa é gerada automaticamente na devolução em atraso, pela estratégia MultaPorDiaDeAtraso (padrão Strategy). Clientes sem este recurso não veem este módulo.',
    // Ninguém cria/edita multa à mão: o valor é sempre calculado pela estratégia (CalculoMulta) do cliente.
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
    // acoesExtras: botão a mais na coluna Ações, só para multas "Em aberto".
    // Clique -> POST /api/multas/{id}/pagar -> MultaService.registrarPagamento (UPDATE status) -> recarrega a lista.
    // recarregar/setMensagem/setErro são funções do próprio CrudPage, recebidas como parâmetro.
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
