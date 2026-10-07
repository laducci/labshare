/*
 * ============================================================
 *  relatorioConfigs.jsx  |  Camada: Front-end (configuração dos relatórios)
 *  Responsável na apresentação: Laura, João e Camilla  |  Disciplina: Medição (Saídas Externas - SE)
 * ------------------------------------------------------------
 *  O que faz: cada objeto descreve UM relatório (SE): endpoint da API, colunas da tabela e os
 *  totais do rodapé. A tela RelatorioView lê esta descrição e monta o relatório inteiro
 *  (mesma ideia do CrudPage + crudConfigs: reuso por configuração).
 *  Por que são SE (e não CE): o backend CALCULA dados derivados (taxa de ocupação, dias de atraso,
 *  multa estimada, % disponível, tempo médio de reparo, % pago) — não só lista o que está gravado.
 *  Quem chama: pages/Reports.jsx (cards) e pages/RelatorioView.jsx (tela do relatório).
 *  Chama: nada na carga; o RelatorioView faz GET /api{endpoint}?inicio=..&fim=.. (RelatorioController).
 * ============================================================
 */
import { formatDateBR, formatMoney } from '../utils/format';

// Formatadores reaproveitados nas colunas.
const pct = (v) => (v === null || v === undefined ? '—' : `${String(v).replace('.', ',')}%`);
const dias = (v) => (v === null || v === undefined ? '—' : `${String(v).replace('.', ',')} d`);
const dinheiro = (v) => formatMoney(v);

// Barrinha horizontal para percentuais (só visual).
const barra = (v) => (
  <div className="bar-cell">
    <div className="bar-cell__track"><div className="bar-cell__fill" style={{ width: `${Math.min(Number(v) || 0, 100)}%` }} /></div>
    <span>{pct(v)}</span>
  </div>
);

// Chave = parte final da URL (/admin/relatorios/utilizacao) e do endpoint (/relatorios/utilizacao).
export const RELATORIOS = {
  // ---------------- Laura ----------------
  utilizacao: {
    titulo: 'Utilização por equipamento',
    autora: 'Laura',
    descricao: 'Reservas, retiradas e taxa de ocupação de cada equipamento no período.',
    endpoint: '/relatorios/utilizacao',
    perfis: ['admin', 'tecnico'], // quem vê este relatório no menu (RNF05)
    periodo: true,
    colunas: [
      { campo: 'equipamento', rotulo: 'Equipamento' },
      { campo: 'patrimonio', rotulo: 'Patrimônio' },
      { campo: 'categoria', rotulo: 'Categoria' },
      { campo: 'reservas', rotulo: 'Reservas' },
      { campo: 'retiradas', rotulo: 'Retiradas' },
      { campo: 'diasOcupados', rotulo: 'Dias ocupados' },
      { campo: 'taxaOcupacao', rotulo: 'Taxa de ocupação', formato: barra },
      { campo: 'classificacao', rotulo: 'Uso' },
    ],
    totais: [
      { campo: 'equipamentos', rotulo: 'Equipamentos' },
      { campo: 'diasNoPeriodo', rotulo: 'Dias no período' },
      { campo: 'reservas', rotulo: 'Reservas' },
      { campo: 'retiradas', rotulo: 'Retiradas' },
      { campo: 'ocupacaoMedia', rotulo: 'Ocupação média', formato: pct },
    ],
  },
  atrasos: {
    titulo: 'Reservas em atraso',
    autora: 'Laura',
    descricao: 'Empréstimos não devolvidos no prazo, com dias de atraso e multa estimada pela regra do cliente.',
    endpoint: '/relatorios/atrasos',
    perfis: ['admin', 'tecnico'], // quem vê este relatório no menu (RNF05)
    periodo: false, // sempre "hoje": atraso é calculado contra a data atual
    colunas: [
      { campo: 'usuario', rotulo: 'Usuário' },
      { campo: 'equipamento', rotulo: 'Equipamento' },
      { campo: 'local', rotulo: 'Local' },
      { campo: 'devolucaoPrevista', rotulo: 'Devolução prevista', formato: formatDateBR },
      { campo: 'diasAtraso', rotulo: 'Dias de atraso' },
      { campo: 'multaEstimada', rotulo: 'Multa estimada', formato: dinheiro },
    ],
    totais: [
      { campo: 'reservasAtrasadas', rotulo: 'Reservas atrasadas' },
      { campo: 'diasDeAtraso', rotulo: 'Dias de atraso (soma)' },
      { campo: 'multaEstimadaTotal', rotulo: 'Multa estimada', formato: dinheiro },
      { campo: 'regraDeMulta', rotulo: 'Regra de multa', largo: true },
    ],
  },

  // ---------------- João ----------------
  categorias: {
    titulo: 'Equipamentos por categoria',
    autora: 'João',
    descricao: 'Acervo por categoria e grupo patrimonial, com situação dos equipamentos e % disponível.',
    endpoint: '/relatorios/categorias',
    perfis: ['admin'], // quem vê este relatório no menu (RNF05)
    periodo: false,
    colunas: [
      { campo: 'categoria', rotulo: 'Categoria' },
      { campo: 'grupoPatrimonial', rotulo: 'Grupo patrimonial' },
      { campo: 'total', rotulo: 'Total' },
      { campo: 'disponiveis', rotulo: 'Disponíveis' },
      { campo: 'emprestados', rotulo: 'Reservados/em uso' },
      { campo: 'emManutencao', rotulo: 'Em manutenção' },
      { campo: 'indisponiveis', rotulo: 'Indisponíveis' },
      { campo: 'percentualDisponivel', rotulo: '% disponível', formato: barra },
    ],
    totais: [
      { campo: 'categorias', rotulo: 'Categorias' },
      { campo: 'equipamentos', rotulo: 'Equipamentos' },
      { campo: 'disponiveis', rotulo: 'Disponíveis' },
      { campo: 'percentualDisponivelGeral', rotulo: '% disponível geral', formato: pct },
    ],
  },
  locais: {
    titulo: 'Inventário por local',
    autora: 'João',
    descricao: 'Quantidade e situação dos equipamentos em cada laboratório, com a sala do ensalamento.',
    endpoint: '/relatorios/locais',
    perfis: ['admin', 'tecnico'], // quem vê este relatório no menu (RNF05)
    periodo: false,
    colunas: [
      { campo: 'local', rotulo: 'Local' },
      { campo: 'sala', rotulo: 'Sala (ensalamento)' },
      { campo: 'capacidade', rotulo: 'Capacidade' },
      { campo: 'total', rotulo: 'Equipamentos' },
      { campo: 'disponiveis', rotulo: 'Disponíveis' },
      { campo: 'emprestados', rotulo: 'Emprestados' },
      { campo: 'emManutencao', rotulo: 'Em manutenção' },
      { campo: 'percentualDisponivel', rotulo: '% disponível', formato: barra },
    ],
    totais: [
      { campo: 'locais', rotulo: 'Locais' },
      { campo: 'equipamentos', rotulo: 'Equipamentos' },
      { campo: 'disponiveis', rotulo: 'Disponíveis' },
      { campo: 'percentualDisponivelGeral', rotulo: '% disponível geral', formato: pct },
    ],
  },

  // ---------------- Camilla ----------------
  manutencoes: {
    titulo: 'Indicadores de manutenção',
    autora: 'Camilla',
    descricao: 'Manutenções por equipamento no período, uso de assistência externa e tempo médio de reparo.',
    endpoint: '/relatorios/manutencoes',
    perfis: ['admin', 'manutencao'], // quem vê este relatório no menu (RNF05)
    periodo: true,
    colunas: [
      { campo: 'equipamento', rotulo: 'Equipamento' },
      { campo: 'patrimonio', rotulo: 'Patrimônio' },
      { campo: 'manutencoes', rotulo: 'Manutenções' },
      { campo: 'concluidas', rotulo: 'Concluídas' },
      { campo: 'emAndamento', rotulo: 'Em andamento' },
      { campo: 'comAssistenciaExterna', rotulo: 'Assistência externa' },
      { campo: 'tempoMedioReparoDias', rotulo: 'Tempo médio de reparo', formato: dias },
    ],
    totais: [
      { campo: 'manutencoes', rotulo: 'Manutenções' },
      { campo: 'concluidas', rotulo: 'Concluídas' },
      { campo: 'percentualConcluido', rotulo: '% concluído', formato: pct },
      { campo: 'comAssistenciaExterna', rotulo: 'Com assistência externa' },
      { campo: 'tempoMedioReparoGeralDias', rotulo: 'Tempo médio de reparo', formato: dias },
    ],
  },
  multas: {
    titulo: 'Multas por período',
    autora: 'Camilla',
    descricao: 'Multas por atraso agrupadas por usuário, com valores pagos e em aberto.',
    endpoint: '/relatorios/multas',
    perfis: ['admin'], // quem vê este relatório no menu (RNF05)
    periodo: true,
    feature: 'lateFee', // VARIABILIDADE: só para clientes com multa (Escola Técnica)
    colunas: [
      { campo: 'usuario', rotulo: 'Usuário' },
      { campo: 'email', rotulo: 'E-mail' },
      { campo: 'multas', rotulo: 'Multas' },
      { campo: 'diasAtraso', rotulo: 'Dias de atraso' },
      { campo: 'total', rotulo: 'Total', formato: dinheiro },
      { campo: 'pago', rotulo: 'Pago', formato: dinheiro },
      { campo: 'emAberto', rotulo: 'Em aberto', formato: dinheiro },
      { campo: 'percentualPago', rotulo: '% pago', formato: barra },
    ],
    totais: [
      { campo: 'usuarios', rotulo: 'Usuários' },
      { campo: 'multas', rotulo: 'Multas' },
      { campo: 'valorTotal', rotulo: 'Valor total', formato: dinheiro },
      { campo: 'valorPago', rotulo: 'Pago', formato: dinheiro },
      { campo: 'valorEmAberto', rotulo: 'Em aberto', formato: dinheiro },
      { campo: 'percentualPago', rotulo: '% pago', formato: pct },
    ],
  },
};
