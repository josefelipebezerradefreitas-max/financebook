import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';
import { useStore } from '../store';
import { Card, Chip, FormScreen, Label, PrimaryButton } from '../ui';
import { money, parseMoney } from '../format';
import { SUGGESTIONS, deductionValue } from '../salary';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const toText = (n) => (n ? String(n).replace('.', ',') : '');

export default function SalaryScreen({ navigation }) {
  const { salary, saveSalary } = useStore();
  const [gross, setGross] = useState(toText(salary?.gross));
  const [payDay, setPayDay] = useState(salary ? String(salary.payDay) : '5');
  const [items, setItems] = useState(
    (salary?.deductions || []).map((d) => ({ ...d, amount: toText(d.amount) }))
  );

  const grossN = parseMoney(gross);
  const numeric = items.map((d) => ({ ...d, amount: parseMoney(d.amount) }));
  const total = numeric.reduce((t, d) => t + deductionValue(d, grossN), 0);
  const net = grossN - total;

  const update = (id, patch) => setItems((l) => l.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const add = (name = '') => setItems((l) => [...l, { id: uid(), name, mode: 'value', amount: '' }]);
  const remove = (id) => setItems((l) => l.filter((d) => d.id !== id));
  const suggestions = SUGGESTIONS.filter((n) => !items.some((d) => d.name === n));

  const save = async () => {
    if (grossN <= 0) return Alert.alert('Falta o salário', 'Informe o salário bruto.');
    const day = Math.min(31, Math.max(1, parseInt(payDay, 10) || 5));
    await saveSalary({
      gross: grossN,
      payDay: day,
      deductions: numeric
        .filter((d) => d.name.trim() && d.amount > 0)
        .map((d) => ({ ...d, name: d.name.trim() })),
    });
    navigation.goBack();
  };

  const clear = () =>
    Alert.alert('Remover salário', 'Isso remove o salário e todos os descontos.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await saveSalary(null);
          navigation.goBack();
        },
      },
    ]);

  return (
    <FormScreen footer={<PrimaryButton label="Salvar salário" onPress={save} />}>
      <View>
        <Label>Salário bruto</Label>
        <View style={st.amountBox}>
          <Text style={st.currency}>R$</Text>
          <TextInput
            value={gross}
            onChangeText={setGross}
            placeholder="0,00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={st.amountInput}
          />
        </View>
      </View>

      <Card style={{ padding: 0 }}>
        <View style={st.dayRow}>
          <Text style={st.rowLabel}>Dia do pagamento</Text>
          <TextInput
            value={payDay}
            onChangeText={setPayDay}
            keyboardType="number-pad"
            maxLength={2}
            style={st.dayInput}
            accessibilityLabel="Dia do pagamento"
          />
        </View>
      </Card>

      <View>
        <Label>Descontos</Label>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {items.length === 0 ? (
            <Text style={st.empty}>Nenhum desconto ainda. Escolha abaixo ou toque em adicionar.</Text>
          ) : (
            items.map((d, i) => (
              <View key={d.id} style={[st.dRow, i < items.length - 1 && st.border]}>
                <TextInput
                  value={d.name}
                  onChangeText={(t) => update(d.id, { name: t })}
                  placeholder="Nome do desconto"
                  placeholderTextColor={colors.muted}
                  style={st.dName}
                />
                <TextInput
                  value={d.amount}
                  onChangeText={(t) => update(d.id, { amount: t })}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={st.dAmount}
                  accessibilityLabel={`Valor de ${d.name || 'desconto'}`}
                />
                <Pressable
                  onPress={() => update(d.id, { mode: d.mode === 'percent' ? 'value' : 'percent' })}
                  accessibilityLabel="Alternar entre reais e porcentagem"
                  style={st.mode}
                >
                  <Text style={st.modeText}>{d.mode === 'percent' ? '%' : 'R$'}</Text>
                </Pressable>
                <Pressable onPress={() => remove(d.id)} accessibilityLabel={`Remover ${d.name || 'desconto'}`} style={st.trash}>
                  <Feather name="x" size={20} color={colors.muted} />
                </Pressable>
              </View>
            ))
          )}
        </Card>
      </View>

      {suggestions.length > 0 && (
        <View style={st.chips}>
          {suggestions.map((n) => (
            <Chip key={n} label={`+ ${n}`} onPress={() => add(n)} />
          ))}
        </View>
      )}

      <Pressable onPress={() => add()} style={st.add}>
        <Text style={st.addText}>+ Adicionar desconto</Text>
      </Pressable>

      <Card style={{ gap: 8, padding: 16 }}>
        <View style={st.sumRow}>
          <Text style={st.sumLabel}>Salário bruto</Text>
          <Text style={st.sumValue}>{money(grossN)}</Text>
        </View>
        <View style={st.sumRow}>
          <Text style={st.sumLabel}>Descontos</Text>
          <Text style={[st.sumValue, { color: colors.red }]}>- {money(total)}</Text>
        </View>
        <View style={st.divider} />
        <View style={[st.sumRow, { alignItems: 'baseline' }]}>
          <Text style={st.netLabel}>Salário líquido</Text>
          <Text style={[st.netValue, net < 0 && { color: colors.red }]}>{money(net)}</Text>
        </View>
      </Card>

      {salary && <PrimaryButton variant="outline" icon="trash-2" label="Remover salário" onPress={clear} />}
    </FormScreen>
  );
}

const st = StyleSheet.create({
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 64,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  currency: { fontSize: 20, fontWeight: '700', color: colors.muted },
  amountInput: { flex: 1, fontSize: 32, fontWeight: '800', color: colors.ink },
  dayRow: { minHeight: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  dayInput: {
    width: 60,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  dRow: { minHeight: 56, paddingLeft: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.line },
  dName: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.ink, paddingVertical: 12 },
  dAmount: {
    width: 84,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  mode: { width: 44, height: 40, borderRadius: 10, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  modeText: { fontSize: 14, fontWeight: '800', color: colors.primaryDark },
  trash: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: 14, fontSize: 14, color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  add: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontSize: 14.5, fontWeight: '700', color: colors.grayText },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sumLabel: { fontSize: 14, fontWeight: '600', color: colors.grayText },
  sumValue: { fontSize: 14, fontWeight: '700', color: colors.ink },
  divider: { height: 1, backgroundColor: colors.line },
  netLabel: { fontSize: 15, fontWeight: '800', color: colors.ink },
  netValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
});
