import { addMonths } from './format';

// Escolhe o que pode ser apagado para deixar o app mais leve. Só entra o que já acabou:
// contas já pagas/recebidas, anotações cujo alerta já passou e vales. Contas em aberto ficam.
// `month` é um dia dentro do mês escolhido; `scope` é 'month' (só esse mês) ou 'until' (tudo até o fim dele).
export function periodRange(month, scope) {
  const start = scope === 'month' ? new Date(month.getFullYear(), month.getMonth(), 1) : new Date(1970, 0, 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 1); // 1º dia do mês seguinte (exclusivo)
  return { start, end };
}

export function selectPurge(data, month, scope, now = new Date()) {
  const { start, end } = periodRange(month, scope);
  const inRange = (iso) => {
    const d = new Date(iso);
    return d >= start && d < end;
  };
  return {
    billIds: (data.bills || []).filter((b) => b.paid && inRange(b.dueDate)).map((b) => b.id),
    noteIds: (data.notes || []).filter((n) => n.alertAt && new Date(n.alertAt) < now && inRange(n.alertAt)).map((n) => n.id),
    valeIds: (data.vales || []).filter((v) => inRange(v.date)).map((v) => v.id),
    keptOpen: (data.bills || []).filter((b) => !b.paid && inRange(b.dueDate)).length,
  };
}

// Último mês que pode ser escolhido: o mês passado (o mês atual nunca é apagado por aqui).
export const lastAllowedMonth = (now = new Date()) => addMonths(new Date(now.getFullYear(), now.getMonth(), 1), -1);
