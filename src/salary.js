import { addMonths, sameMonth } from './format';

// Salário e descontos. Cada desconto é um valor fixo (mode 'value') ou uma
// porcentagem do salário bruto (mode 'percent').

export const SUGGESTIONS = ['INSS', 'Imposto de renda', 'Vale-transporte', 'Plano de saúde', 'Vale-refeição'];

export function deductionValue(d, gross) {
  return d.mode === 'percent' ? (gross * d.amount) / 100 : d.amount;
}

export function totalDeductions(salary) {
  if (!salary) return 0;
  return salary.deductions.reduce((t, d) => t + deductionValue(d, salary.gross), 0);
}

export function netSalary(salary) {
  if (!salary) return 0;
  return Math.max(0, salary.gross - totalDeductions(salary));
}

// Soma dos vales pegos em um mês.
export function valesTotal(vales, month) {
  return (vales || [])
    .filter((v) => sameMonth(new Date(v.date), month))
    .reduce((t, v) => t + v.amount, 0);
}

// Os vales pegos no mês anterior são descontados do salário deste mês.
// Os vales pegos neste mês entram como dinheiro recebido agora.
export function monthWork(salary, vales, month) {
  const base = netSalary(salary);
  const deducted = salary ? valesTotal(vales, addMonths(month, -1)) : 0;
  const received = valesTotal(vales, month);
  return { base, deducted, toReceive: base - deducted, received, total: base - deducted + received };
}
