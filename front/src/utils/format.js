/*
 * ============================================================
 *  format.js  |  Camada: Front-end (funções utilitárias)
 *  Responsável na apresentação: Todos  |  Atividade: Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: funções puras (sem React, sem chamada à API) de formatação de datas e dinheiro,
 *  nomes dos perfis e a tela inicial de cada perfil. Ficam num só arquivo para não repetir
 *  a mesma lógica em várias telas.
 *  Quem chama: App.jsx, Sidebar, ProtectedRoute, CrudPage, crudConfigs e várias páginas.
 *  Chama: nada (só APIs nativas do JavaScript: Date, toLocaleString).
 * ============================================================
 */
/** Funções de formatação reaproveitadas por várias telas. */

// "2026-10-05" (formato do banco/JSON) -> "05/10/2026" (formato brasileiro). Vazio -> ''.
// Faz por texto (split) em vez de new Date() para não sofrer com fuso horário (o dia poderia "voltar" 1).
export function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = String(dateStr).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

// "2026-10-05T14:30:00" (LocalDateTime do Java) -> "05/10/2026 14:30".
export function formatDateTimeBR(value) {
  if (!value) return '';
  const [data, hora = ''] = String(value).split('T');
  return `${formatDateBR(data)} ${hora.slice(0, 5)}`.trim();
}

// Quantidade de dias de um período, contando o primeiro e o último dia (por isso o +1).
// 86400000 = milissegundos em um dia. Nunca devolve negativo.
export function daysBetween(start, end) {
  if (!start || !end) return 0;
  const diff = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
  return Math.max(diff, 0);
}

// 12.5 -> "R$ 12,50". Usado nas multas.
export function formatMoney(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Data de hoje + N dias no formato do <input type="date"> (AAAA-MM-DD). */
export function isoDate(diasAPartirDeHoje = 0) {
  const d = new Date();
  d.setDate(d.getDate() + diasAPartirDeHoje);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Tradução do código do perfil (como vem do backend, enum Perfil) para o texto mostrado na tela.
export const PERFIS = {
  aluno: 'Aluno',
  professor: 'Professor',
  tecnico: 'Técnico',
  manutencao: 'Manutenção',
  gestor: 'Gestor',
  admin: 'Administrador',
};

/**
 * Nome do perfil que aparece na tela, levando em conta o cliente (VARIABILIDADE).
 * Em clientes corporativos quem pede equipamento é funcionário, então o perfil "aluno"
 * aparece como "Colaborador". O banco continua guardando "aluno": só o texto muda.
 * Ex.: rotuloPerfil('aluno', { segmento: 'Corporativo' }) -> 'Colaborador'.
 */
export function rotuloPerfil(perfil, tenant) {
  if (perfil === 'aluno' && tenant?.segmento === 'Corporativo') return 'Colaborador';
  return PERFIS[perfil] || perfil;
}

/** Tela inicial de cada perfil depois do login. */
// Usada no login (App.jsx) e pelo ProtectedRoute quando o usuário tenta abrir uma tela sem permissão (RNF05).
export function rotaInicial(perfil) {
  switch (perfil) {
    case 'tecnico': return '/tecnico/painel';
    case 'manutencao': return '/manutencao/painel';
    case 'admin': return '/admin/dashboard';
    case 'gestor': return '/gestor/painel';
    default: return '/home';
  }
}

// Perfis que podem PEDIR reserva de equipamento (usado nas rotas do App.jsx).
export const SOLICITANTES = ['aluno', 'professor'];
