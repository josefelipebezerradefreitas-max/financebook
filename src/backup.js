// Lê o texto de um backup (o mesmo que o botão "Exportar backup" compartilha)
// e confere se ele parece mesmo um backup do FinanceBook.
export function parseBackup(raw) {
  const text = String(raw || '');
  // Aceita texto colado com sobras antes ou depois (ex.: "Backup FinanceBook").
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return { ok: false, error: 'Não encontrei um backup nesse texto.' };
  let obj;
  try {
    obj = JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    return { ok: false, error: 'O texto está incompleto ou foi alterado. Copie o backup inteiro de novo.' };
  }
  const notes = obj.notes ?? [];
  const bills = obj.bills ?? [];
  const vales = obj.vales ?? [];
  if (!Array.isArray(notes) || !Array.isArray(bills) || !Array.isArray(vales)) {
    return { ok: false, error: 'Esse texto não é um backup do FinanceBook.' };
  }
  if (!('notes' in obj) && !('bills' in obj)) {
    return { ok: false, error: 'Esse texto não é um backup do FinanceBook.' };
  }
  const badBill = bills.some(
    (b) => !b || typeof b.amount !== 'number' || Number.isNaN(new Date(b.dueDate).getTime()) || !b.id
  );
  if (badBill) return { ok: false, error: 'Algumas contas do backup estão com dados inválidos.' };
  const customCategories = Array.isArray(obj.customCategories)
    ? obj.customCategories.filter((c) => typeof c === 'string')
    : [];
  return { ok: true, data: { notes, bills, vales, salary: obj.salary ?? null, customCategories } };
}
