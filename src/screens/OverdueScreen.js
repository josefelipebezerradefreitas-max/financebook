import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, themed } from '../theme';
import { useStore } from '../store';
import { confirmToggle } from '../confirm';
import { Card, FormScreen, Pill } from '../ui';
import { billStatus, daysUntil, fmtShort, money } from '../format';

// Lista das contas a pagar atrasadas, da mais antiga para a mais recente.
export default function OverdueScreen({ navigation }) {
  const { bills, togglePaid } = useStore();
  const list = bills
    .filter((b) => !b.paid && b.kind === 'pay' && daysUntil(new Date(b.dueDate)) < 0)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const total = list.reduce((t, b) => t + b.amount, 0);

  return (
    <FormScreen>
      {list.length === 0 ? (
        <Card>
          <Text style={st.empty}>Nenhuma conta atrasada.</Text>
        </Card>
      ) : (
        <>
          <View style={st.bar}>
            <Text style={st.barText}>
              {list.length} {list.length === 1 ? 'conta' : 'contas'}
            </Text>
            <Text style={st.barText}>Total {money(total)}</Text>
          </View>
          <Text style={st.sort}>Da mais antiga para a mais recente</Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {list.map((b, i) => {
              const status = billStatus(b);
              const due = new Date(b.dueDate);
              return (
                <Pressable
                  key={b.id}
                  onPress={() => navigation.navigate('EditarConta', { id: b.id })}
                  style={[st.row, i < list.length - 1 && st.rowBorder]}
                >
                  <Pressable
                    onPress={() => confirmToggle(b, togglePaid)}
                    accessibilityLabel={`Marcar ${b.description} como paga`}
                    style={st.checkHit}
                  >
                    <View style={[st.circle, { borderColor: colors.red }]} />
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text style={st.name}>{b.description}</Text>
                    <Text style={st.sub}>
                      {b.category} · {fmtShort(due)} {due.getFullYear()}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 3 }}>
                    <Text style={st.amount}>{money(b.amount)}</Text>
                    <Pill label={status.label} tone={status.tone} />
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.muted} style={{ marginLeft: 6 }} />
                </Pressable>
              );
            })}
          </Card>
          <Text style={st.hint}>Toque no círculo para marcar como paga ou na conta para editar.</Text>
        </>
      )}
    </FormScreen>
  );
}

const st = themed(() => ({
  bar: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.redTint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barText: { fontSize: 14.5, fontWeight: '700', color: colors.onRed },
  sort: { fontSize: 13, fontWeight: '600', color: colors.muted },
  empty: { fontSize: 14, color: colors.muted },
  hint: { fontSize: 12.5, color: colors.muted, textAlign: 'center' },
  row: { minHeight: 66, paddingLeft: 4, paddingRight: 14, flexDirection: 'row', alignItems: 'center' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  checkHit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  circle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2 },
  name: { fontSize: 15, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700', color: colors.ink },
}));
