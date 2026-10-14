const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MONTHS_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function money(n) {
  const neg = n < 0;
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  const dotted = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${neg ? '-' : ''}R$ ${dotted},${dec}`;
}

export function parseMoney(s) {
  const n = parseFloat(String(s).replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(n) ? 0 : n;
}

export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const sameMonth = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export function addMonths(d, n) {
  const x = new Date(d);
  const day = x.getDate();
  x.setDate(1);
  x.setMonth(x.getMonth() + n);
  const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
  x.setDate(Math.min(day, last));
  return x;
}

export const daysUntil = (d) => Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000);

export const fmtDate = (d) => `${WD[d.getDay()]}, ${d.getDate()} ${MO[d.getMonth()]} ${d.getFullYear()}`;
export const fmtShort = (d) => `${d.getDate()} ${MO[d.getMonth()]}`;
export const fmtTime = (d) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
export const monthLabel = (d) => `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
export const monthName = (d) => MONTHS_FULL[d.getMonth()].toLowerCase();
export const fmtLongToday = (d) => {
  const names = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  return `${names[d.getDay()]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()].toLowerCase()}`;
};

// Texto e cor da etiqueta de status de uma conta.
export function billStatus(bill) {
  if (bill.paid) return { label: bill.kind === 'receive' ? 'Recebida' : 'Paga', tone: 'green' };
  const n = daysUntil(new Date(bill.dueDate));
  if (n < 0) return { label: 'Vencida', tone: 'red' };
  if (n === 0) return { label: bill.kind === 'receive' ? 'Hoje' : 'Vence hoje', tone: 'red' };
  if (n === 1) return { label: 'Amanhã', tone: 'amber' };
  if (n <= 3) return { label: `Em ${n} dias`, tone: 'amber' };
  return { label: `Em ${n} dias`, tone: 'gray' };
}
