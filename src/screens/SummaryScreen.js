import React, { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { useStore } from '../store';
import { Card, MonthNav, PrimaryButton, Screen } from '../ui';
import { addMonths, money, monthLabel, sameMonth } from '../format';
import { monthWork } from '../salary';

export default function SummaryScreen() {
  const { bills, data, salary, vales } = useStore();
  const [month, setMonth] = useState(new Date());

  const inMonth = bills.filter((b) => sameMonth(new Date(b.dueDate), month));
  const pay = inMonth.filter((b) => b.kind === 'pay');
  const income = inMonth.filter((b) => b.kind === 'receive').reduce((t, b) => t + b.amount, 0) + monthWork(salary, vales, month).total;
  const expense = pay.reduce((t, b) => t + b.amount, 0);

  const byCategory = {};
  pay.forEach((b) => {
    byCategory[b.category] = (byCategory[b.category] || 0) + b.amount;
  });
  const rows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  // Backup simples: abre a folha de compartilhar do celular com todos os dados em JSON.
  const exportBackup = () =>
    Share.share({ title: 'Backup FinanceBook', message: JSON.stringify(data, null, 2) });

  return (
    <Screen title="Resumo">
      <MonthNav
        label={monthLabel(month)}
        onPrev={() => setMonth(addMonths(month, -1))}
        onNext={() => setMonth(addMonths(month, 1))}
      />
      <View style={st.balance}>
        <Text style={st.balanceLabel}>Saldo do mês</Text>
        <Text style={st.balanceValue}>{money(income - expense)}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <Text style={st.smallLabel}>Receitas</Text>
          <Text style={[st.smallValue, { color: colors.primary }]}>{money(income)}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={st.smallLabel}>Despesas</Text>
          <Text style={[st.smallValue, { color: colors.red }]}>{money(expense)}</Text>
        </Card>
      </View>

      <Card style={{ padding: 16 }}>
        <Text style={st.h2}>Despesas por categoria</Text>
        {rows.length === 0 ? (
          <Text style={st.empty}>Sem despesas neste mês.</Text>
        ) : (
          rows.map(([name, value]) => {
            const pct = expense > 0 ? (value / expense) * 100 : 0;
            return (
              <View key={name} style={{ marginTop: 12 }}>
                <View style={st.catRow}>
                  <Text style={st.catName}>{name}</Text>
                  <Text style={st.catValue}>
                    {money(value)} · {Math.round(pct)}%
                  </Text>
                </View>
                <View style={st.track}>
                  <View style={[st.fill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })
        )}
      </Card>

      <PrimaryButton variant="outline" icon="download" label="Exportar backup" onPress={exportBackup} />
    </Screen>
  );
}

const st = StyleSheet.create({
  balance: { backgroundColor: colors.primary, borderRadius: 22, paddingVertical: 18, paddingHorizontal: 20 },
  balanceLabel: { fontSize: 13, color: '#CFEBE2', fontWeight: '600' },
  balanceValue: { fontSize: 34, fontWeight: '800', color: '#fff', marginTop: 2, letterSpacing: -0.5 },
  smallLabel: { fontSize: 12, fontWeight: '700', color: colors.muted },
  smallValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  h2: { fontSize: 15, fontWeight: '800', color: colors.ink },
  empty: { fontSize: 14, color: colors.muted, marginTop: 8 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 13.5, fontWeight: '600', color: colors.ink },
  catValue: { fontSize: 13.5, fontWeight: '700', color: colors.ink },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.track, marginTop: 6, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary },
});
