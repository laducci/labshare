export const USERS = {
  lucas: {
    id: 'lucas',
    name: 'Lucas Almeida',
    firstName: 'Lucas',
    email: 'lucas@email.com',
    role: 'aluno',
    tenantId: 'universidade',
  },
  carlos: {
    id: 'carlos',
    name: 'Carlos Ferreira',
    firstName: 'Carlos',
    email: 'carlos@email.com',
    role: 'tecnico',
    tenantId: 'universidade',
  },
  fernanda: {
    id: 'fernanda',
    name: 'Fernanda Rocha',
    firstName: 'Fernanda',
    email: 'fernanda@email.com',
    role: 'manutencao',
    tenantId: 'universidade',
  },
  admin: {
    id: 'admin',
    name: 'Coordenador Admin',
    firstName: 'Admin',
    email: 'admin@email.com',
    role: 'admin',
    tenantId: 'universidade',
  },
  patricia: {
    id: 'patricia',
    name: 'Patrícia Souza',
    firstName: 'Patrícia',
    email: 'patricia@empresa.com',
    role: 'gestor',
    tenantId: 'empresa',
  },
  bruno: {
    id: 'bruno',
    name: 'Bruno Tavares',
    firstName: 'Bruno',
    email: 'bruno@empresa.com',
    role: 'aluno',
    tenantId: 'empresa',
  },
  vera: {
    id: 'vera',
    name: 'Vera Machado',
    firstName: 'Vera',
    email: 'vera@escolatecnica.com',
    role: 'admin',
    tenantId: 'escola_tecnica',
  },
};

export const TENANTS = {
  universidade: {
    id: 'universidade',
    name: 'Universidade Padrão',
    segment: 'Educação',
    features: {
      approvalRequired: false,
      lateFee: false,
      costCenter: false,
    },
  },
  empresa: {
    id: 'empresa',
    name: 'Empresa Corporativa',
    segment: 'Corporativo',
    features: {
      approvalRequired: true,
      lateFee: false,
      costCenter: true,
    },
  },
  escola_tecnica: {
    id: 'escola_tecnica',
    name: 'Escola Técnica',
    segment: 'Educação Profissionalizante',
    features: {
      approvalRequired: false,
      lateFee: true,
      costCenter: false,
    },
  },
};

export const COST_CENTERS = [
  { id: 'cc-eng', name: 'Engenharia de Produto' },
  { id: 'cc-mkt', name: 'Marketing' },
  { id: 'cc-ti', name: 'TI Interna' },
];

export const CATEGORIES = [
  { id: 'eletronica', name: 'Eletrônica', icon: 'cpu' },
  { id: 'audio-video', name: 'Áudio e Vídeo', icon: 'camera' },
  { id: 'informatica', name: 'Informática', icon: 'monitor' },
  { id: 'ferramentas', name: 'Ferramentas', icon: 'wrench' },
];

export const EQUIPMENTS = [
  {
    id: 'arduino-uno',
    name: 'Kit Arduino Uno',
    category: 'Eletrônica',
    categoryId: 'eletronica',
    status: 'Disponível',
    patrimonio: 'PAT-2024-001',
    local: 'Lab. Eletrônica – Sala 12',
    image: 'https://images.unsplash.com/photo-1629654297299-c8500471aae0?w=400&h=300&fit=crop',
    description:
      'Kit completo para desenvolvimento com Arduino Uno. Ideal para projetos de eletrônica e prototipagem.',
    includedItems: [
      '1x Placa Arduino Uno R3',
      '1x Cabo USB',
      'Jumpers',
      'Protoboard',
      'LEDs',
      'Resistores',
      'Sensores',
    ],
    checklistItems: [
      'Placa Arduino Uno',
      'Cabo USB',
      'Protoboard',
      'Sensores',
      'Jumpers',
    ],
  },
  {
    id: 'arduino-mega',
    name: 'Kit Arduino Mega',
    category: 'Eletrônica',
    categoryId: 'eletronica',
    status: 'Disponível',
    patrimonio: 'PAT-2024-002',
    local: 'Lab. Eletrônica – Sala 12',
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&h=300&fit=crop',
    description: 'Kit Arduino Mega 2560 para projetos avançados com mais pinos e memória.',
    includedItems: ['1x Placa Arduino Mega', '1x Cabo USB', 'Jumpers', 'Protoboard'],
    checklistItems: ['Placa Arduino Mega', 'Cabo USB', 'Protoboard', 'Jumpers'],
  },
  {
    id: 'arduino-shield',
    name: 'Shield Arduino Sensor',
    category: 'Eletrônica',
    categoryId: 'eletronica',
    status: 'Indisponível',
    patrimonio: 'PAT-2024-003',
    local: 'Lab. Eletrônica – Sala 12',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    description: 'Shield com múltiplos sensores integrados para Arduino.',
    includedItems: ['1x Shield Sensor', 'Cabos de conexão'],
    checklistItems: ['Shield Sensor', 'Cabos'],
  },
  {
    id: 'osciloscopio',
    name: 'Osciloscópio Digital',
    category: 'Eletrônica',
    categoryId: 'eletronica',
    status: 'Disponível',
    patrimonio: 'PAT-2024-010',
    local: 'Lab. Eletrônica – Sala 10',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
    description: 'Osciloscópio digital de bancada 100MHz.',
    includedItems: ['1x Osciloscópio', '2x Sondas', '1x Cabo USB'],
    checklistItems: ['Osciloscópio', 'Sondas', 'Cabo USB'],
  },
  {
    id: 'camera-hd',
    name: 'Câmera HD',
    category: 'Áudio e Vídeo',
    categoryId: 'audio-video',
    status: 'Em uso',
    patrimonio: 'PAT-2024-020',
    local: 'Lab. Multimídia – Sala 5',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244ccaf?w=400&h=300&fit=crop',
    description: 'Câmera profissional HD para gravações em laboratório.',
    includedItems: ['1x Câmera', '1x Tripé', '1x Cartão SD'],
    checklistItems: ['Câmera', 'Tripé', 'Cartão SD'],
  },
];

export const LOAN_RULES = [
  'O empréstimo é pessoal e intransferível.',
  'A devolução deve ocorrer até às 18:00 do último dia.',
  'Danos ou perdas devem ser reportados imediatamente.',
  'Renovações dependem de disponibilidade do equipamento.',
];

export const STATUS_OPTIONS = [
  'Disponível',
  'Reservado',
  'Em uso',
  'Em manutenção',
  'Indisponível',
];

export const RETURN_CHECKLIST_DEFAULT = [
  { item: 'Placa Arduino Uno', status: 'OK' },
  { item: 'Cabo USB', status: 'OK' },
  { item: 'Protoboard', status: 'OK' },
  { item: 'Sensores', status: 'Com defeito' },
  { item: 'Jumpers', status: 'OK' },
];

export const APPROVAL_REQUESTS = [
  {
    id: 'apr-001',
    requester: 'Bruno Tavares',
    equipmentName: 'Notebook Dell Precision',
    costCenter: 'cc-eng',
    startDate: '2026-09-05',
    endDate: '2026-09-08',
    status: 'Pendente',
    justification: 'Uso em apresentação para cliente externo.',
  },
  {
    id: 'apr-002',
    requester: 'Juliana Prado',
    equipmentName: 'Câmera HD',
    costCenter: 'cc-mkt',
    startDate: '2026-09-06',
    endDate: '2026-09-07',
    status: 'Pendente',
    justification: 'Gravação de vídeo institucional.',
  },
  {
    id: 'apr-003',
    requester: 'Marcos Vinícius',
    equipmentName: 'Osciloscópio Digital',
    costCenter: 'cc-ti',
    startDate: '2026-09-02',
    endDate: '2026-09-03',
    status: 'Aprovada',
    justification: 'Diagnóstico de rede interna.',
  },
];

export const LATE_FEES = [
  {
    id: 'multa-001',
    student: 'Igor Salles',
    equipmentName: 'Kit Arduino Mega',
    daysLate: 3,
    amount: 15.0,
    status: 'Em aberto',
  },
  {
    id: 'multa-002',
    student: 'Beatriz Nogueira',
    equipmentName: 'Shield Arduino Sensor',
    daysLate: 1,
    amount: 5.0,
    status: 'Paga',
  },
];
