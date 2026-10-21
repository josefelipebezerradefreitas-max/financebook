import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, themed } from '../theme';
import { useStore } from '../store';
import { confirmToggle } from '../confirm';
import { Card, FabMenu, MonthNav, Pill, Screen, Segmented } from '../ui';
import { useMonthResetTick } from '../monthReset';
import { addMonths, billStatus, daysUntil, fmtShort, money, monthLabel, sameMonth } from '../format';

// Para a busca ignorar maiúsculas e acentos.
const norm = (t) => {
  const s = String(t).toLowerCase();
  return typeof s.normalize === 'function' ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s;
};

export default function BillsScreen({ navigation, route }) {
  const { bills, togglePaid } = useStore();
  const [kind, setKind] = useState('pay');
  const [month, setMonth] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  // Trocar de aba volta para o mês atual.
  const resetTick = useMonthResetTick();
  const firstRun = React.useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setMonth(new Date());
  }, [resetTick]);

  // "Ver contas" no Início abre aqui já no mês (e na aba) dos próximos vencimentos.
  useEffect(() => {
    const p = route?.params;
    if (!p?.stamp) return;
    if (p.month) setMonth(new Date(p.month));
    if (p.kind) setKind(p.kind);
  }, [route?.params?.stamp]);

  const list = bills
    .filter((b) => b.kind === kind && sameMonth(new Date(b.dueDate), month))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const pending = list.filter((b) => !b.paid);
  const overdue = pending.filter((b) => daysUntil(new Date(b.dueDate)) < 0);
  const open = pending.filter((b) => daysUntil(new Date(b.dueDate)) >= 0);
  const done = list.filter((b) => b.paid);

  const total = (l) => l.reduce((t, b) => t + b.amount, 0);
  const pendingTotal = total(pending);
  const doneTotal = total(done);
  const progress = pendingTotal + doneTotal > 0 ? doneTotal / (pendingTotal + doneTotal) : 0;

  // Busca em todos os meses, por nome, categoria ou valor.
  const q = norm(query.trim());
  const results = q
    ? bills
        .filter((b) =>
          norm(`${b.description} ${b.category} ${b.amount.toFixed(2).replace('.', ',')}`).includes(q)
        )
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    : [];

  const closeSearch = () => {
    setSearching(false);
    setQuery('');
  };

  const actions = [
    {
      icon: 'file-plus',
      label: 'Nova conta',
      primary: true,
      onPress: () => {
        setMenuOpen(false);
        navigation.navigate('NovaConta', { kind });
      },
    },
    {
      icon: 'edit-2',
      label: 'Editar',
      onPress: () => {
        setMenuOpen(false);
        setEditing(true);
      },
    },
    {
      icon: 'search',
      label: 'Pesquisar',
      onPress: () => {
        setMenuOpen(false);
        setSearching(true);
      },
    },
  ];

  const tappable = editing || searching;

  const renderRow = (b, last) => {
    const status = billStatus(b);
    const due = new Date(b.dueDate);
    return (
      <Pressable
        key={b.id}
        disabled={!tappable}
        onPress={() => navigation.navigate('EditarConta', { id: b.id })}
        style={[st.row, !last && st.rowBorder]}
      >
        <Pressable
          onPress={() => confirmToggle(b, togglePaid)}
          accessibilityLabel={`Marcar ${b.description} como ${b.kind === 'pay' ? 'paga' : 'recebida'}`}
          style={st.checkHit}
        >
          {b.paid ? (
            <View style={[st.circle, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              <Feather name="check" size={16} color="#fff" />
            </View>
          ) : (
            <View style={[st.circle, status.tone === 'red' && { borderColor: colors.red }]} />
          )}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[st.name, b.paid && st.paidText]}>{b.description}</Text>
          <Text style={st.sub}>
            {b.category} · {fmtShort(due)}
            {searching ? ` ${due.getFullYear()}` : ''}
            {b.repeat === 'monthly' ? ' · todo mês' : ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 3 }}>
          <Text style={[st.amount, b.paid && st.paidText]}>{money(b.amount)}</Text>
          <Pill label={status.label} tone={status.tone} />
        </View>
        {tappable && <Feather name="chevron-right" size={20} color={colors.muted} style={{ marginLeft: 6 }} />}
      </Pressable>
    );
  };

  return (
    <Screen
      title="Contas"
      fab={
        searching ? null : (
          <FabMenu open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} actions={actions} />
        )
      }
    >
      {searching ? (
        <>
          <View style={st.searchRow}>
            <View style={st.searchBox}>
              <Feather name="search" size={20} color={colors.muted} />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder="Pesquisar conta"
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                style={st.searchInput}
                accessibilityLabel="Pesquisar conta"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} accessibilityLabel="Limpar busca" style={st.clear}>
                  <Feather name="x" size={18} color={colors.muted} />
                </Pressable>
              ) : null}
            </View>
            <Pressable onPress={closeSearch} style={st.cancel}>
              <Text style={st.cancelText}>Cancelar</Text>
            </Pressable>
          </View>

          {!q ? (
            <Card><Text style={st.empty}>Digite o nome, a categoria ou o valor da conta.</Text></Card>
          ) : results.length === 0 ? (
            <Card><Text style={st.empty}>Nenhuma conta encontrada.</Text></Card>
          ) : (
            <>
              <Text style={st.resultTitle}>
                {results.length} {results.length === 1 ? 'conta encontrada' : 'contas encontradas'}
              </Text>
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                {results.map((b, i) => renderRow(b, i === results.length - 1))}
              </Card>
            </>
          )}
        </>
      ) : (
        <>
          <MonthNav
            label={monthLabel(month)}
            onPrev={() => setMonth(addMonths(month, -1))}
            onNext={() => setMonth(addMonths(month, 1))}
          />
          <Segmented
            value={kind}
            onChange={setKind}
            options={[
              { value: 'pay', label: 'A pagar' },
              { value: 'receive', label: 'A receber' },
            ]}
          />
          <Card>
            <View style={st.totals}>
              <View>
                <Text style={st.totalLabel}>Pendente</Text>
                <Text style={st.totalValue}>{money(pendingTotal)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={st.totalLabel}>{kind === 'pay' ? 'Pago' : 'Recebido'}</Text>
                <Text style={[st.totalValue, { color: colors.primary }]}>{money(doneTotal)}</Text>
              </View>
            </View>
            <View style={st.track}>
              <View style={[st.fill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          </Card>

          {editing && (
            <Card style={st.editBanner}>
              <Feather name="edit-2" size={18} color={colors.primaryDark} />
              <Text style={st.editText}>Toque na conta que quer editar ou apagar</Text>
              <Pressable onPress={() => setEditing(false)} style={st.doneBtn}>
                <Text style={st.doneText}>Concluir</Text>
              </Pressable>
            </Card>
          )}

          {list.length === 0 ? (
            <Card><Text style={st.empty}>Nenhuma conta neste mês. Toque no menu para adicionar.</Text></Card>
          ) : (
            <>
              {overdue.length > 0 && (
                <>
                  <Text style={st.overdueTitle}>Atrasados · {overdue.length}</Text>
                  <Card style={{ padding: 0, overflow: 'hidden' }}>
                    {overdue.map((b, i) => renderRow(b, i === overdue.length - 1))}
                  </Card>
                </>
              )}
              {open.length > 0 && (
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {open.map((b, i) => renderRow(b, i === open.length - 1))}
                </Card>
              )}
              {done.length > 0 && (
                <>
                  <Text style={st.doneTitle}>
                    {kind === 'pay' ? 'Pagas' : 'Recebidas'} · {done.length}
                  </Text>
                  <Card style={{ padding: 0, overflow: 'hidden' }}>
                    {done.map((b, i) => renderRow(b, i === done.length - 1))}
                  </Card>
                </>
              )}
              <Text style={st.hint}>Toque no menu para adicionar, editar ou pesquisar contas.</Text>
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const st = themed(() => ({
  totals: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 12, fontWeight: '700', color: colors.muted },
  totalValue: { fontSize: 22, fontWeight: '800', color: colors.ink, marginTop: 2 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.track, marginTop: 12, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary },
  row: { minHeight: 66, paddingLeft: 4, paddingRight: 14, flexDirection: 'row', alignItems: 'center' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  checkHit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#B9C5BF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 15, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700', color: colors.ink },
  paidText: { color: colors.muted, textDecorationLine: 'line-through' },
  doneTitle: { fontSize: 14, fontWeight: '800', color: colors.grayText },
  overdueTitle: { fontSize: 14, fontWeight: '800', color: colors.red },
  resultTitle: { fontSize: 14, fontWeight: '800', color: colors.grayText },
  empty: { fontSize: 14, color: colors.muted },
  hint: { fontSize: 12.5, color: colors.muted, textAlign: 'center' },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primaryTint,
    paddingVertical: 4,
  },
  editText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.primaryDark },
  doneBtn: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
  doneText: { fontSize: 14, fontWeight: '800', color: colors.primary },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingLeft: 14,
    paddingRight: 6,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.ink },
  clear: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  cancel: { minWidth: 44, height: 48, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 14.5, fontWeight: '800', color: colors.primary },
}));
