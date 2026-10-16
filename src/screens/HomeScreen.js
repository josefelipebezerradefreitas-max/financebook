import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';
import { useStore } from '../store';
import { Card, Pill, Screen, SectionTitle } from '../ui';
import { addMonths, daysUntil, fmtLongToday, fmtShort, fmtTime, money, monthName, sameDay, sameMonth } from '../format';
import { monthWork, netSalary, totalDeductions } from '../salary';

const sum = (list) => list.reduce((t, b) => t + b.amount, 0);

export default function HomeScreen({ navigation }) {
  const { notes, bills, salary, vales } = useStore();
  const now = new Date();

  const monthBills = bills.filter((b) => sameMonth(new Date(b.dueDate), now));
  const work = monthWork(salary, vales, now);
  const income = sum(monthBills.filter((b) => b.kind === 'receive')) + work.total;
  const valesNow = work.received;
  const nextMonth = monthName(addMonths(now, 1));
  const expense = sum(monthBills.filter((b) => b.kind === 'pay'));

  const today = [
    ...notes
      .filter((n) => n.alertAt && sameDay(new Date(n.alertAt), now))
      .map((n) => ({
        key: `n${n.id}`,
        icon: 'bell',
        tone: 'amber',
        title: n.title,
        sub: 'Anotação',
        time: fmtTime(new Date(n.alertAt)),
        onPress: () => navigation.navigate('NovaNota', { id: n.id }),
      })),
    ...bills
      .filter((b) => !b.paid && sameDay(new Date(b.dueDate), now))
      .map((b) => ({
        key: `b${b.id}`,
        icon: 'credit-card',
        tone: 'red',
        title: b.description,
        sub: `${b.kind === 'receive' ? 'A receber' : 'Conta'} · ${money(b.amount)}`,
        time: 'Hoje',
        onPress: () => navigation.navigate('Contas'),
      })),
  ];

  const upcoming = bills
    .filter((b) => !b.paid && b.kind === 'pay' && daysUntil(new Date(b.dueDate)) > 0 && daysUntil(new Date(b.dueDate)) <= 7)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  const overdue = bills.filter((b) => !b.paid && b.kind === 'pay' && daysUntil(new Date(b.dueDate)) < 0);

  return (
    <Screen
      title="Olá!"
      subtitle={fmtLongToday(now)}
    >
      <View style={st.balance}>
        <Text style={st.balanceLabel}>Saldo previsto do mês</Text>
        <Text style={st.balanceValue}>{money(income - expense)}</Text>
        <View style={st.balanceRow}>
          <View style={st.balanceBox}>
            <Text style={st.balanceBoxLabel}>Receitas</Text>
            <Text style={st.balanceBoxValue}>{money(income)}</Text>
          </View>
          <View style={st.balanceBox}>
            <Text style={st.balanceBoxLabel}>Despesas</Text>
            <Text style={st.balanceBoxValue}>{money(expense)}</Text>
          </View>
        </View>
      </View>

      <Pressable onPress={() => navigation.navigate('Salario')}>
        <Card style={st.itemRow}>
          <View style={[st.iconBox, { backgroundColor: colors.primaryTint }]}>
            <Feather name="dollar-sign" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.itemTitle}>{salary ? 'Salário líquido' : 'Adicionar salário'}</Text>
            <Text style={st.itemSub}>
              {salary
                ? `Bruto ${money(salary.gross)} · descontos ${money(totalDeductions(salary))}`
                : 'Informe o salário e os descontos'}
            </Text>
          </View>
          {salary ? (
            <Text style={st.itemTitle}>{money(netSalary(salary))}</Text>
          ) : (
            <Feather name="chevron-right" size={22} color={colors.muted} />
          )}
        </Card>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Vales')}>
        <Card style={st.itemRow}>
          <View style={[st.iconBox, { backgroundColor: colors.amberTint }]}>
            <Feather name="clock" size={22} color={colors.amber} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.itemTitle}>Vales do mês</Text>
            <Text style={st.itemSub}>
              {valesNow > 0 ? `Descontam do salário de ${nextMonth}` : 'Registre os vales que pegar'}
            </Text>
          </View>
          {valesNow > 0 ? (
            <Text style={st.itemTitle}>{money(valesNow)}</Text>
          ) : (
            <Feather name="chevron-right" size={22} color={colors.muted} />
          )}
        </Card>
      </Pressable>

      {overdue.length > 0 && (
        <Pressable onPress={() => navigation.navigate('Contas')} style={st.overdueBar}>
          <Feather name="alert-circle" size={20} color={colors.red} />
          <Text style={[st.overdueText, { flex: 1 }]}>
            Atrasados · {overdue.length} {overdue.length === 1 ? 'conta' : 'contas'}
          </Text>
          <Text style={st.overdueText}>{money(overdue.reduce((a, b) => a + b.amount, 0))}</Text>
        </Pressable>
      )}

      <SectionTitle right={<Text style={st.count}>{today.length} hoje</Text>}>Hoje</SectionTitle>
      {today.length === 0 ? (
        <Card><Text style={st.empty}>Nada para hoje.</Text></Card>
      ) : (
        today.map((item) => (
          <Pressable key={item.key} onPress={item.onPress}>
            <Card style={st.itemRow}>
              <View style={[st.iconBox, { backgroundColor: item.tone === 'red' ? colors.redTint : colors.amberTint }]}>
                <Feather name={item.icon} size={22} color={item.tone === 'red' ? colors.red : colors.amber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.itemTitle}>{item.title}</Text>
                <Text style={st.itemSub}>{item.sub}</Text>
              </View>
              <Text style={[st.time, { color: item.tone === 'red' ? colors.red : colors.amber }]}>{item.time}</Text>
            </Card>
          </Pressable>
        ))
      )}

      <SectionTitle
        right={
          <Pressable onPress={() => navigation.navigate('Contas')}>
            <Text style={st.link}>Ver contas</Text>
          </Pressable>
        }
      >
        Próximos vencimentos
      </SectionTitle>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {upcoming.length === 0 ? (
          <Text style={[st.empty, { padding: 14 }]}>Nenhum vencimento nos próximos 7 dias.</Text>
        ) : (
          upcoming.map((b, i) => (
            <View key={b.id} style={[st.upRow, i < upcoming.length - 1 && st.upBorder]}>
              <View>
                <Text style={st.itemTitle}>{b.description}</Text>
                <Text style={st.itemSub}>{fmtShort(new Date(b.dueDate))}</Text>
              </View>
              <Text style={st.itemTitle}>{money(b.amount)}</Text>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const st = StyleSheet.create({
  overdueBar: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.redTint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-between',
  },
  overdueText: { fontSize: 14.5, fontWeight: '700', color: '#7A2414' },
  balance: { backgroundColor: colors.primary, borderRadius: 24, padding: 20 },
  balanceLabel: { fontSize: 13, color: '#CFEBE2', fontWeight: '600' },
  balanceValue: { fontSize: 36, fontWeight: '800', color: '#fff', marginTop: 4, letterSpacing: -0.5 },
  balanceRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  balanceBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 14, padding: 12 },
  balanceBoxLabel: { fontSize: 12, color: '#CFEBE2', fontWeight: '600' },
  balanceBoxValue: { fontSize: 15, fontWeight: '700', color: '#fff', marginTop: 2 },
  count: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  link: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  empty: { fontSize: 14, color: colors.muted },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  itemSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  time: { fontSize: 13, fontWeight: '700' },
  upRow: { padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  upBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
});
