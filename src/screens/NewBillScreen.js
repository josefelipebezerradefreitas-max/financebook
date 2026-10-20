import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, themed, categories } from '../theme';
import { useStore } from '../store';
import { Card, Chip, DateField, FormScreen, Label, PrimaryButton, Segmented, CategoryPicker } from '../ui';
import { addMonths, fmtDate, money, parseMoney } from '../format';

const ALERT_OPTIONS = [
  { label: 'Sem aviso', value: null },
  { label: 'No dia', value: 0 },
  { label: '1 dia antes', value: 1 },
  { label: '2 dias antes', value: 2 },
  { label: '3 dias antes', value: 3 },
];

const REPEAT_OPTIONS = [
  { label: 'Não repete', value: 'none' },
  { label: 'Todo mês', value: 'monthly' },
  { label: 'Parcelada', value: 'installments' },
];

export default function NewBillScreen({ navigation, route }) {
  const { addBill, addBills } = useStore();
  const [kind, setKind] = useState(route.params?.kind || 'pay');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [due, setDue] = useState(new Date());
  const [repeat, setRepeat] = useState('none');
  const [count, setCount] = useState(2);
  const [alertDays, setAlertDays] = useState(1);

  const valueN = parseMoney(amount);
  const installments = repeat === 'installments';
  const firstDue = new Date(due.getFullYear(), due.getMonth(), due.getDate(), 12);
  const lastDue = addMonths(firstDue, count - 1);

  const save = async () => {
    if (valueN <= 0) return Alert.alert('Falta o valor', 'Informe o valor da conta.');
    const name = description.trim();
    if (!name) return Alert.alert('Falta a descrição', 'Dê um nome para a conta.');

    if (installments) {
      // Uma conta por parcela, cada uma no seu mês, com o mesmo valor.
      await addBills(
        Array.from({ length: count }, (_, i) => ({
          kind,
          description: `${name} (${i + 1}/${count})`,
          amount: valueN,
          category,
          dueDate: addMonths(firstDue, i).toISOString(),
          repeat: 'none',
          alertDaysBefore: alertDays,
          paid: false,
          installment: { n: i + 1, of: count },
        }))
      );
    } else {
      await addBill({
        kind,
        description: name,
        amount: valueN,
        category,
        dueDate: firstDue.toISOString(),
        repeat: repeat === 'monthly' ? 'monthly' : 'none',
        alertDaysBefore: alertDays,
        paid: false,
      });
    }
    navigation.goBack();
  };

  return (
    <FormScreen footer={<PrimaryButton label={installments ? `Salvar ${count} parcelas` : 'Salvar conta'} onPress={save} />}>
      <Segmented
        value={kind}
        onChange={setKind}
        options={[
          { value: 'pay', label: 'A pagar' },
          { value: 'receive', label: 'A receber' },
        ]}
      />

      <View>
        <Label>{installments ? 'Valor de cada parcela' : 'Valor'}</Label>
        <View style={st.amountBox}>
          <Text style={st.currency}>R$</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={st.amountInput}
          />
        </View>
      </View>

      <View>
        <Label>Descrição</Label>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Ex.: Seguro do carro"
          placeholderTextColor={colors.muted}
          style={st.input}
        />
      </View>

      <View>
        <Label>Categoria</Label>
        <CategoryPicker value={category} onChange={setCategory} />
      </View>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <DateField label={installments ? 'Vencimento da 1ª parcela' : 'Vencimento'} mode="date" value={due} onChange={setDue} last />
      </Card>

      <View>
        <Label>Repetição</Label>
        <View style={st.chips}>
          {REPEAT_OPTIONS.map((o) => (
            <Chip key={o.value} label={o.label} active={repeat === o.value} onPress={() => setRepeat(o.value)} />
          ))}
        </View>
      </View>

      {installments && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={st.stepRow}>
            <Text style={st.rowLabel}>Quantas vezes</Text>
            <View style={st.stepper}>
              <Pressable
                onPress={() => setCount((c) => Math.max(2, c - 1))}
                accessibilityLabel="Menos uma parcela"
                style={st.stepBtn}
              >
                <Feather name="minus" size={20} color={colors.ink} />
              </Pressable>
              <Text style={st.stepValue}>{count}x</Text>
              <Pressable
                onPress={() => setCount((c) => Math.min(60, c + 1))}
                accessibilityLabel="Mais uma parcela"
                style={[st.stepBtn, { backgroundColor: colors.primaryTint }]}
              >
                <Feather name="plus" size={20} color={colors.primaryDark} />
              </Pressable>
            </View>
          </View>
          <Text style={st.stepHint}>
            {count}x de {money(valueN)} = {money(valueN * count)}. Última parcela em {fmtDate(lastDue)}.
          </Text>
        </Card>
      )}

      <View>
        <Label>Avisar às 09:00</Label>
        <View style={st.chips}>
          {ALERT_OPTIONS.map((o) => (
            <Chip key={o.label} label={o.label} active={alertDays === o.value} onPress={() => setAlertDays(o.value)} />
          ))}
        </View>
      </View>
    </FormScreen>
  );
}

const st = themed(() => ({
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 64,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  currency: { fontSize: 20, fontWeight: '700', color: colors.muted },
  amountInput: { flex: 1, fontSize: 32, fontWeight: '800', color: colors.ink },
  input: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  stepRow: {
    minHeight: 56,
    paddingLeft: 14,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { minWidth: 48, textAlign: 'center', fontSize: 18, fontWeight: '800', color: colors.ink },
  stepHint: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.bg,
    fontSize: 13,
    lineHeight: 19,
    color: colors.grayText,
  },
}));
