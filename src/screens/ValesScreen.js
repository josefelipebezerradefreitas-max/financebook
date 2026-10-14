import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';
import { useStore } from '../store';
import { Card, DateField, FormScreen, Label, MonthNav, PrimaryButton } from '../ui';
import { addMonths, fmtShort, money, monthLabel, monthName, parseMoney, sameMonth } from '../format';
import { monthWork } from '../salary';

export default function ValesScreen() {
  const { salary, vales, addVale, deleteVale } = useStore();
  const [month, setMonth] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());

  const work = monthWork(salary, vales, month);
  const prev = monthName(addMonths(month, -1));
  const next = monthName(addMonths(month, 1));
  const list = vales
    .filter((v) => sameMonth(new Date(v.date), month))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const add = () => {
    const value = parseMoney(amount);
    if (value <= 0) return Alert.alert('Falta o valor', 'Informe o valor do vale.');
    addVale({
      amount: value,
      note: note.trim(),
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).toISOString(),
    });
    setMonth(date);
    setAmount('');
    setNote('');
  };

  const confirmDelete = (v) =>
    Alert.alert('Excluir vale', `Excluir o vale de ${money(v.amount)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteVale(v.id) },
    ]);

  return (
    <FormScreen>
      <MonthNav
        label={monthLabel(month)}
        onPrev={() => setMonth(addMonths(month, -1))}
        onNext={() => setMonth(addMonths(month, 1))}
      />

      <Card style={{ gap: 8, padding: 16 }}>
        {salary ? (
          <>
            <View style={st.sumRow}>
              <Text style={st.sumLabel}>Salário líquido</Text>
              <Text style={st.sumValue}>{money(work.base)}</Text>
            </View>
            <View style={st.sumRow}>
              <Text style={st.sumLabel}>Vales de {prev}</Text>
              <Text style={[st.sumValue, { color: colors.red }]}>- {money(work.deducted)}</Text>
            </View>
            <View style={st.divider} />
            <View style={[st.sumRow, { alignItems: 'baseline' }]}>
              <Text style={st.netLabel}>Salário a receber</Text>
              <Text style={[st.netValue, work.toReceive < 0 && { color: colors.red }]}>{money(work.toReceive)}</Text>
            </View>
          </>
        ) : (
          <Text style={st.empty}>Cadastre seu salário na tela Início para ver o desconto dos vales.</Text>
        )}
      </Card>

      <Card style={st.amberCard}>
        <View style={{ flex: 1 }}>
          <Text style={st.amberTitle}>Vales de {monthName(month)}</Text>
          <Text style={st.amberSub}>Serão descontados do salário de {next}</Text>
        </View>
        <Text style={st.amberValue}>{money(work.received)}</Text>
      </Card>

      <View>
        <Label>Novo vale</Label>
        <View style={{ gap: 8 }}>
          <View style={st.amountBox}>
            <Text style={st.currency}>R$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0,00"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              style={st.amountInput}
              accessibilityLabel="Valor do vale"
            />
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Observação (opcional)"
            placeholderTextColor={colors.muted}
            style={st.input}
          />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <DateField label="Data" mode="date" value={date} onChange={setDate} last />
          </Card>
          <PrimaryButton label="Adicionar vale" onPress={add} />
        </View>
      </View>

      <View>
        <Label>Vales de {monthName(month)}</Label>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {list.length === 0 ? (
            <Text style={[st.empty, { padding: 14 }]}>Nenhum vale neste mês.</Text>
          ) : (
            list.map((v, i) => (
              <View key={v.id} style={[st.row, i < list.length - 1 && st.border]}>
                <View style={{ flex: 1 }}>
                  <Text style={st.rowTitle}>{v.note || 'Vale'}</Text>
                  <Text style={st.rowSub}>{fmtShort(new Date(v.date))}</Text>
                </View>
                <Text style={st.rowTitle}>{money(v.amount)}</Text>
                <Pressable onPress={() => confirmDelete(v)} accessibilityLabel="Excluir vale" style={st.trash}>
                  <Feather name="x" size={20} color={colors.muted} />
                </Pressable>
              </View>
            ))
          )}
        </Card>
      </View>
    </FormScreen>
  );
}

const st = StyleSheet.create({
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sumLabel: { fontSize: 14, fontWeight: '600', color: colors.grayText },
  sumValue: { fontSize: 14, fontWeight: '700', color: colors.ink },
  divider: { height: 1, backgroundColor: colors.line },
  netLabel: { fontSize: 15, fontWeight: '800', color: colors.ink },
  netValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  empty: { fontSize: 14, color: colors.muted },
  amberCard: { backgroundColor: colors.amberTint, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  amberTitle: { fontSize: 15, fontWeight: '800', color: '#5E3D00' },
  amberSub: { fontSize: 13, color: '#6B4A0A', marginTop: 2 },
  amberValue: { fontSize: 20, fontWeight: '800', color: '#5E3D00' },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  currency: { fontSize: 18, fontWeight: '700', color: colors.muted },
  amountInput: { flex: 1, fontSize: 26, fontWeight: '800', color: colors.ink },
  input: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    fontSize: 15,
    color: colors.ink,
  },
  row: { minHeight: 56, paddingLeft: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  rowSub: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  trash: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
