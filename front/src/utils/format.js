/** Funções de formatação reaproveitadas por várias telas. */

export function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = String(dateStr).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export function formatDateTimeBR(value) {
  if (!value) return '';
  const [data, hora = ''] = String(value).split('T');
  return `${formatDateBR(data)} ${hora.slice(0, 5)}`.trim();
}

export function daysBetween(start, end) {
  if (!start || !end) return 0;
  const diff = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
  return Math.max(diff, 0);
}

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

export const PERFIS = {
  aluno: 'Aluno',
  professor: 'Professor',
  tecnico: 'Técnico',
  manutencao: 'Manutenção',
  gestor: 'Gestor',
  admin: 'Administrador',
};

/** Tela inicial de cada perfil depois do login. */
export function rotaInicial(perfil) {
  switch (perfil) {
    case 'tecnico': return '/tecnico/painel';
    case 'manutencao': return '/manutencao/painel';
    case 'admin': return '/admin/dashboard';
    case 'gestor': return '/gestor/painel';
    default: return '/home';
  }
}

export const SOLICITANTES = ['aluno', 'professor'];
