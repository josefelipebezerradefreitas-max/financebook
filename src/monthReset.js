import { useEffect, useState } from 'react';

// Quando você troca de aba (Início, Contas, Resumo...), Contas e Resumo voltam para o mês atual.
// Abrir ou salvar uma conta (telas por cima da aba) não passa por aqui, então o mês fica como estava.
let tick = 0;
const listeners = new Set();

export function resetMonths() {
  tick += 1;
  listeners.forEach((fn) => fn(tick));
}

export function useMonthResetTick() {
  const [t, setT] = useState(tick);
  useEffect(() => {
    listeners.add(setT);
    return () => listeners.delete(setT);
  }, []);
  return t;
}
