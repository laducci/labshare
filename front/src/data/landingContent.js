export const NAV_LINKS = [
  { href: '#inicio', label: 'Início' },
  { href: '#problema', label: 'Problema' },
  { href: '#publico', label: 'Público-alvo' },
  { href: '#personas', label: 'Personas' },
  { href: '#empatia', label: 'Mapa de Empatia' },
  { href: '#solucao', label: 'Solução' },
];

export const HERO_HIGHLIGHTS = [
  { icon: 'calendar', label: 'Reserva de equipamentos' },
  { icon: 'clipboard', label: 'Controle de empréstimos' },
  { icon: 'rotate', label: 'Rastreamento de devoluções' },
  { icon: 'wrench', label: 'Gestão de manutenção' },
];

export const PROBLEM_ITEMS = [
  'Falta de informação sobre disponibilidade',
  'Conflitos de reserva',
  'Atrasos nas devoluções',
  'Equipamentos com defeito sendo utilizados',
  'Falta de histórico de manutenção',
  'Dificuldade para identificar responsáveis',
  'Perda de tempo no atendimento',
  'Falta de rastreabilidade',
];

export const FLOW_STEPS = [
  'Pesquisar equipamento',
  'Consultar disponibilidade',
  'Reservar',
  'Retirar',
  'Utilizar',
  'Devolver',
  'Inspecionar',
  'Manutenção, se necessário',
  'Disponibilizar novamente',
];

export const BENEFITS = [
  'Mais organização',
  'Menos conflitos de reserva',
  'Maior previsibilidade',
  'Controle do estado dos equipamentos',
  'Histórico de utilização',
  'Melhor comunicação entre alunos e laboratório',
];

export const AUDIENCE = [
  {
    id: 'alunos',
    icon: 'graduation',
    title: 'Alunos',
    description:
      'Usuários que precisam localizar, reservar, retirar e devolver equipamentos utilizados em aulas, projetos e atividades acadêmicas.',
    needs: ['Ver disponibilidade', 'Fazer reservas', 'Receber lembretes', 'Consultar histórico'],
  },
  {
    id: 'professores',
    icon: 'book',
    title: 'Professores',
    description:
      'Profissionais que utilizam equipamentos em aulas práticas, projetos acadêmicos e atividades de pesquisa.',
    needs: ['Reservar com antecedência', 'Solicitar múltiplos itens', 'Consultar disponibilidade', 'Organizar atividades práticas'],
  },
  {
    id: 'tecnicos',
    icon: 'clipboard-check',
    title: 'Técnicos de laboratório',
    description:
      'Responsáveis pelo controle operacional dos equipamentos e pelo atendimento dos usuários.',
    needs: ['Registrar retiradas', 'Registrar devoluções', 'Fazer checklists', 'Registrar ocorrências', 'Controlar disponibilidade'],
  },
  {
    id: 'gestao',
    icon: 'bar-chart',
    title: 'Coordenação e gestão',
    description:
      'Responsáveis pelo acompanhamento do uso dos recursos do laboratório.',
    needs: ['Acompanhar utilização', 'Identificar atrasos', 'Consultar histórico', 'Apoiar decisões sobre compra e manutenção'],
  },
];

export const PERSONAS = [
  {
    name: 'Lucas Almeida',
    age: 21,
    profile: 'Aluno de Engenharia',
    objective: 'Reservar kits Arduino e outros equipamentos eletrônicos para trabalhos e projetos.',
    needs: ['Ver disponibilidade', 'Reservar rapidamente', 'Receber lembretes', 'Acompanhar devolução'],
    pains: 'Não saber se o equipamento está disponível e perder tempo indo até o laboratório sem necessidade.',
    behavior: 'Usa bastante o celular e prefere processos simples e rápidos.',
    quote: 'Se eu conseguir reservar antes, consigo me organizar melhor.',
    initials: 'LA',
  },
  {
    name: 'Mariana Costa',
    age: 22,
    profile: 'Aluna de Design',
    objective: 'Reservar câmeras e equipamentos audiovisuais para produções e projetos.',
    needs: ['Ver fotos', 'Consultar especificações', 'Ver disponibilidade', 'Escolher datas'],
    pains: 'Chegar ao laboratório e descobrir que o equipamento que precisava já está sendo utilizado.',
    behavior: 'Planeja com antecedência e compara opções antes de escolher um equipamento.',
    quote: 'Eu preciso ter certeza de que o equipamento estará disponível no dia da gravação.',
    initials: 'MC',
  },
  {
    name: 'Ricardo Nunes',
    age: 42,
    profile: 'Professor',
    objective: 'Reservar vários equipamentos para aulas práticas.',
    needs: ['Agendamento antecipado', 'Múltiplos itens', 'Histórico', 'Cancelamento fácil'],
    pains: 'Depender de controles manuais e ter pouca previsibilidade sobre a disponibilidade.',
    behavior: 'Organiza as aulas antecipadamente e valoriza processos confiáveis.',
    quote: 'Quando o agendamento é claro, consigo preparar melhor minhas aulas.',
    initials: 'RN',
  },
  {
    name: 'Carlos Ferreira',
    age: 35,
    profile: 'Técnico de laboratório',
    objective: 'Controlar retiradas, devoluções e o estado dos equipamentos.',
    needs: ['Painel rápido', 'Checklist', 'Registro de ocorrências', 'Rastreabilidade'],
    pains: 'Controlar tudo manualmente e perder tempo procurando informações espalhadas.',
    behavior: 'Confere os itens com atenção e precisa de agilidade no atendimento.',
    quote: 'Se o processo estiver organizado, consigo atender mais rápido e com menos erro.',
    initials: 'CF',
  },
  {
    name: 'Fernanda Rocha',
    age: 30,
    profile: 'Responsável pela manutenção',
    objective: 'Receber equipamentos defeituosos, acompanhar reparos e liberar os itens novamente.',
    needs: ['Histórico do problema', 'Prioridade de manutenção', 'Status atualizado', 'Registro da conclusão'],
    pains: 'Receber equipamentos sem uma descrição clara do defeito ou sem histórico.',
    behavior: 'Trabalha por ordem de prioridade e registra as informações das manutenções.',
    quote: 'Com as informações certas, consigo resolver o problema mais rápido.',
    initials: 'FR',
  },
  {
    name: 'Roberto Lima',
    age: 48,
    profile: 'Coordenador',
    objective: 'Acompanhar utilização, disponibilidade e manutenção dos equipamentos.',
    needs: ['Visão geral', 'Indicadores operacionais', 'Histórico', 'Apoio à tomada de decisão'],
    pains: 'Falta de informações confiáveis para planejar compras, reposições e manutenção.',
    behavior: 'Toma decisões com base em dados e valoriza rastreabilidade.',
    quote: 'Quando tenho dados confiáveis, consigo planejar melhor os recursos do laboratório.',
    initials: 'RL',
  },
];

export const EMPATHY_MAP = [
  {
    title: 'Pensa e sente',
    icon: 'heart',
    items: [
      'Preciso do equipamento para concluir meu trabalho.',
      'Será que ele vai estar disponível quando eu precisar?',
      'Quero conseguir fazer a devolução no prazo.',
      'Quero evitar problemas com o laboratório.',
    ],
  },
  {
    title: 'Vê',
    icon: 'eye',
    items: [
      'Colegas procurando equipamentos na última hora.',
      'Falta de organização nas reservas.',
      'Equipamentos parados enquanto outros estudantes precisam.',
      'Pessoas indo ao laboratório apenas para perguntar sobre disponibilidade.',
    ],
  },
  {
    title: 'Escuta',
    icon: 'ear',
    items: [
      '“O equipamento que eu preciso nunca está disponível.”',
      '“Esqueci de devolver e tive problema.”',
      'Orientações dos técnicos sobre retirada e devolução.',
      'Professores solicitando equipamentos para trabalhos.',
    ],
  },
  {
    title: 'Fala e faz',
    icon: 'message',
    items: [
      'Pesquisa a disponibilidade.',
      'Compara equipamentos.',
      'Faz a reserva.',
      'Retira o item.',
      'Utiliza com cuidado.',
      'Devolve dentro do prazo.',
    ],
  },
  {
    title: 'Dores',
    icon: 'alert',
    items: [
      'Atrasar um projeto por falta de equipamento.',
      'Ir ao laboratório e descobrir que o item não está disponível.',
      'Ter conflitos de reserva.',
      'Receber equipamentos com defeito.',
      'Esquecer a data de devolução.',
    ],
  },
  {
    title: 'Ganhos',
    icon: 'sparkles',
    items: [
      'Encontrar equipamentos facilmente.',
      'Visualizar disponibilidade em tempo real.',
      'Fazer reservas antecipadas.',
      'Receber lembretes.',
      'Ter mais previsibilidade para organizar os trabalhos.',
      'Passar por um processo simples e organizado.',
    ],
  },
];

export const CONCLUSION_FLOW = [
  'Busca',
  'Reserva',
  'Retirada',
  'Uso',
  'Devolução',
  'Inspeção',
  'Manutenção',
  'Nova disponibilização',
];
