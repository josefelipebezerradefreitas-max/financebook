import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelAlert, scheduleAt } from './notifications';
import { addMonths } from './format';

// Todos os dados ficam neste único objeto JSON. Mais para frente, é este mesmo
// objeto que será sincronizado com o arquivo na pasta oculta do Google Drive.
const KEY = 'financebook:v1';
// O celular limita quantos alertas podem ficar agendados ao mesmo tempo (no iPhone, 64).
// Por isso só agendamos os alertas dos próximos 60 dias; o resto é agendado ao abrir o app.
const ALERT_WINDOW_DAYS = 60;
const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function billAlertDate(dueDate, daysBefore) {
  const d = new Date(dueDate);
  d.setDate(d.getDate() - daysBefore);
  d.setHours(9, 0, 0, 0);
  return d;
}

export function StoreProvider({ children }) {
  const [data, setData] = useState({ notes: [], bills: [], salary: null, vales: [], customCategories: [] });
  const [ready, setReady] = useState(false);
  const ref = useRef(data);
  ref.current = data;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setData((d) => ({ ...d, ...JSON.parse(raw) })))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(data));
  }, [data, ready]);

  // Ao abrir o app, agenda os alertas das contas dos próximos 60 dias que ainda não têm alerta.
  useEffect(() => {
    if (!ready) return;
    (async () => {
      const updates = {};
      for (const b of ref.current.bills) {
        if (b.paid || b.notifId || b.alertDaysBefore === null || b.alertDaysBefore === undefined) continue;
        const when = billAlertDate(b.dueDate, b.alertDaysBefore);
        const ms = when.getTime() - Date.now();
        if (ms <= 0 || ms > ALERT_WINDOW_DAYS * 86400000) continue;
        const verb = b.kind === 'receive' ? 'Receber' : 'Pagar';
        const id = await scheduleAt(when, `${verb}: ${b.description}`, 'Vencimento da conta');
        if (id) updates[b.id] = id;
      }
      if (Object.keys(updates).length) {
        setData((d) => ({
          ...d,
          bills: d.bills.map((b) => (updates[b.id] ? { ...b, notifId: updates[b.id] } : b)),
        }));
      }
    })();
  }, [ready]);

  const saveNote = useCallback(async ({ id, title, text, alertAt }) => {
    const existing = id ? ref.current.notes.find((n) => n.id === id) : null;
    if (existing) await cancelAlert(existing.notifId);
    const noteId = id || uid();
    const notifId = alertAt ? await scheduleAt(new Date(alertAt), title, text || 'Lembrete') : null;
    const note = { id: noteId, title, text, alertAt: alertAt || null, notifId };
    setData((d) => ({
      ...d,
      notes: existing ? d.notes.map((n) => (n.id === noteId ? note : n)) : [note, ...d.notes],
    }));
  }, []);

  const deleteNote = useCallback(async (id) => {
    const existing = ref.current.notes.find((n) => n.id === id);
    if (existing) await cancelAlert(existing.notifId);
    setData((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));
  }, []);

  const withAlert = useCallback(async (bill) => {
    let notifId = null;
    if (!bill.paid && bill.alertDaysBefore !== null && bill.alertDaysBefore !== undefined) {
      const when = billAlertDate(bill.dueDate, bill.alertDaysBefore);
      if (when.getTime() - Date.now() <= ALERT_WINDOW_DAYS * 86400000) {
        const verb = bill.kind === 'receive' ? 'Receber' : 'Pagar';
        notifId = await scheduleAt(when, `${verb}: ${bill.description}`, 'Vencimento da conta');
      }
    }
    return { ...bill, id: uid(), notifId };
  }, []);

  const addBill = useCallback(
    async (bill) => {
      const full = await withAlert(bill);
      setData((d) => ({ ...d, bills: [...d.bills, full] }));
    },
    [withAlert]
  );

  // Cria várias contas de uma vez (as parcelas de uma conta parcelada).
  const addBills = useCallback(
    async (list) => {
      const full = [];
      for (const b of list) full.push(await withAlert(b));
      setData((d) => ({ ...d, bills: [...d.bills, ...full] }));
    },
    [withAlert]
  );

  // Salva as alterações de uma conta: cancela o alerta antigo e agenda de novo com os dados novos.
  const updateBill = useCallback(
    async (id, patch) => {
      const existing = ref.current.bills.find((b) => b.id === id);
      if (!existing) return;
      await cancelAlert(existing.notifId);
      const full = await withAlert({ ...existing, ...patch, notifId: null });
      setData((d) => ({ ...d, bills: d.bills.map((b) => (b.id === id ? { ...full, id } : b)) }));
    },
    [withAlert]
  );

  const deleteBill = useCallback(async (id) => {
    const existing = ref.current.bills.find((b) => b.id === id);
    if (existing) await cancelAlert(existing.notifId);
    setData((d) => ({ ...d, bills: d.bills.filter((b) => b.id !== id) }));
  }, []);

  const addVale = useCallback((vale) => {
    setData((d) => ({ ...d, vales: [{ ...vale, id: uid() }, ...(d.vales || [])] }));
  }, []);

  const deleteVale = useCallback((id) => {
    setData((d) => ({ ...d, vales: (d.vales || []).filter((v) => v.id !== id) }));
  }, []);

  // Categorias criadas por você (além das que já vêm no app).
  const addCategory = useCallback((name) => {
    setData((d) => ({ ...d, customCategories: [...(d.customCategories || []), name] }));
  }, []);

  const saveSalary = useCallback((salary) => {
    setData((d) => ({ ...d, salary }));
  }, []);

  // Marca como paga/recebida (ou desfaz). Se a conta se repete todo mês,
  // cria a conta do mês seguinte ao marcar como paga.
  const togglePaid = useCallback(
    async (id) => {
      const bill = ref.current.bills.find((b) => b.id === id);
      if (!bill) return;
      const paid = !bill.paid;
      if (paid) await cancelAlert(bill.notifId);
      setData((d) => ({
        ...d,
        bills: d.bills.map((b) => (b.id === id ? { ...b, paid, notifId: paid ? null : b.notifId } : b)),
      }));
      if (paid && bill.repeat === 'monthly') {
        const nextDue = addMonths(new Date(bill.dueDate), 1).toISOString();
        const exists = ref.current.bills.some(
          (b) => b.description === bill.description && b.dueDate === nextDue && b.kind === bill.kind
        );
        if (!exists) {
          await addBill({
            kind: bill.kind,
            description: bill.description,
            amount: bill.amount,
            category: bill.category,
            dueDate: nextDue,
            repeat: 'monthly',
            alertDaysBefore: bill.alertDaysBefore,
            paid: false,
          });
        }
      }
    },
    [addBill]
  );

  // Troca todos os dados do celular pelos de um backup. Cancela os alertas antigos e
  // agenda de novo os que ainda estão no futuro.
  const importBackup = useCallback(async (backup) => {
    for (const n of ref.current.notes) await cancelAlert(n.notifId);
    for (const b of ref.current.bills) await cancelAlert(b.notifId);
    const notes = [];
    for (const n of backup.notes) {
      let notifId = null;
      if (n.alertAt && new Date(n.alertAt).getTime() > Date.now()) {
        notifId = await scheduleAt(new Date(n.alertAt), n.title, n.text || 'Lembrete');
      }
      notes.push({ ...n, notifId });
    }
    const bills = [];
    for (const b of backup.bills) {
      let notifId = null;
      if (!b.paid && b.alertDaysBefore !== null && b.alertDaysBefore !== undefined) {
        const when = billAlertDate(b.dueDate, b.alertDaysBefore);
        const ms = when.getTime() - Date.now();
        if (ms > 0 && ms <= ALERT_WINDOW_DAYS * 86400000) {
          const verb = b.kind === 'receive' ? 'Receber' : 'Pagar';
          notifId = await scheduleAt(when, `${verb}: ${b.description}`, 'Vencimento da conta');
        }
      }
      bills.push({ ...b, notifId });
    }
    setData({ notes, bills, vales: backup.vales, salary: backup.salary, customCategories: backup.customCategories });
  }, []);

  // Apaga de uma vez as contas, anotações e vales escolhidos (veja purge.js).
  const purge = useCallback(async ({ billIds, noteIds, valeIds }) => {
    const bills = new Set(billIds);
    const notes = new Set(noteIds);
    const vales = new Set(valeIds);
    for (const b of ref.current.bills) if (bills.has(b.id)) await cancelAlert(b.notifId);
    for (const n of ref.current.notes) if (notes.has(n.id)) await cancelAlert(n.notifId);
    setData((d) => ({
      ...d,
      bills: d.bills.filter((b) => !bills.has(b.id)),
      notes: d.notes.filter((n) => !notes.has(n.id)),
      vales: (d.vales || []).filter((v) => !vales.has(v.id)),
    }));
  }, []);

  const value = { purge, importBackup, addCategory, customCategories: data.customCategories || [], data, notes: data.notes, bills: data.bills, salary: data.salary, saveSalary, vales: data.vales || [], addVale, deleteVale, ready, saveNote, deleteNote, addBill, addBills, updateBill, deleteBill, togglePaid };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
