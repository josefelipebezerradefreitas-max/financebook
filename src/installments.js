// Parcelas de uma mesma conta: as novas têm um código de grupo; as antigas são achadas
// pelo nome (sem o "(1/3)"), pela quantidade de parcelas e pelo tipo.
const base = (d) => String(d || '').replace(/\s*\(\d+\/\d+\)\s*$/, '').trim();

export function installmentGroup(bills, bill) {
  if (!bill || !bill.installment) return [];
  const g = bill.installment.group;
  return bills.filter((b) => {
    if (!b.installment) return false;
    if (g) return b.installment.group === g;
    return !b.installment.group && b.installment.of === bill.installment.of && b.kind === bill.kind && base(b.description) === base(bill.description);
  });
}
