import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, themed } from '../theme';
import { useStore } from '../store';
import { Card, Chip, DateField, FormScreen, Label, PrimaryButton, Segmented, CategoryPicker } from '../ui';
import { parseMoney } from '../format';
import { installmentGroup } from '../installments';

const ALERT_OPTIONS = [
  { label: 'Sem aviso', value: null },
  { label: 'No dia', value: 0 },
  { label: '1 dia antes', value: 1 },
  { label: '2 dias antes', value: 2 },
  { label: '3 dias antes', value: 3 },
];

export default function EditBillScreen({ navigation, route }) {
  const { bills, updateBill, deleteBill, deleteBills, setBillsCategory, allCategories } = useStore();
  const bill = bills.find((b) => b.id === route.params?.id);

  const [kind, setKind] = useState(bill?.kind || 'pay');
  const [amount, setAmount] = useState(bill ? String(bill.amount).replace('.', ',') : '');
  const [description, setDescription] = useState(bill?.description || '');
  const [category, setCategory] = useState(bill?.category || allCategories[0] || '');
  const [due, setDue] = useState(bill ? new Date(bill.dueDate) : new Date());
  const [paid, setPaid] = useState(!!bill?.paid);
  const [alertDays, setAlertDays] = useState(bill ? bill.alertDaysBefore ?? null : 1);

  if (!bill) return null;

  const save = async () => {
    const value = parseMoney(amount);
    if (value <= 0) return Alert.alert('Falta o valor', 'Informe o valor da conta.');
    const name = description.trim();
    if (!name) return Alert.alert('Falta a descrição', 'Dê um nome para a conta.');
    await updateBill(bill.id, {
      kind,
      description: name,
      amount: value,
      category,
      dueDate: new Date(due.getFullYear(), due.getMonth(), due.getDate(), 12).toISOString(),
      paid,
      alertDaysBefore: alertDays,
    });
    // Conta parcelada com categoria nova: pergunta se vale para as outras parcelas.
    const others = installmentGroup(bills, bill).filter((b) => b.id !== bill.id && b.category !== category);
    if (category !== bill.category && others.length > 0) {
      Alert.alert(
        'Mudar nas outras parcelas?',
        `Esta conta tem mais ${others.length} parcela(s). Quer mudar a categoria delas para "${category}" também?`,
        [
          { text: 'Só esta', style: 'cancel', onPress: () => navigation.goBack() },
          {
            text: `Todas as parcelas`,
            onPress: async () => {
              await setBillsCategory(others.map((b) => b.id), category);
              navigation.goBack();
            },
          },
        ]
      );
      return;
    }
    navigation.goBack();
  };

  const remove = () => {
    const group = installmentGroup(bills, bill);
    const confirmOne = {
      text: group.length > 1 ? 'Só esta' : 'Apagar',
      style: 'destructive',
      onPress: async () => {
        await deleteBill(bill.id);
        navigation.goBack();
      },
    };
    if (group.length > 1) {
      // Conta parcelada: oferece apagar as outras parcelas junto.
      Alert.alert(
        'Apagar conta parcelada',
        `"${bill.description}" é uma das ${group.length} parcelas. O que você quer apagar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          confirmOne,
          {
            text: `Todas as ${group.length} parcelas`,
            style: 'destructive',
            onPress: async () => {
              await deleteBills(group.map((b) => b.id));
              navigation.goBack();
            },
          },
        ]
      );
      return;
    }
    Alert.alert('Apagar conta', `Apagar "${bill.description}"? Essa ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      confirmOne,
    ]);
  };

  return (
    <FormScreen footer={<PrimaryButton label="Salvar alterações" onPress={save} />}>
      <Segmented
        value={kind}
        onChange={setKind}
        options={[
          { value: 'pay', label: 'A pagar' },
          { value: 'receive', label: 'A receber' },
        ]}
      />

      <View>
        <Label>Valor</Label>
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
        <CategoryPicker value={category} onChange={setCategory} current={bill?.category} />
      </View>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <DateField label="Vencimento" mode="date" value={due} onChange={setDue} />
        <View style={st.switchRow}>
          <View style={st.switchLabel}>
            <Feather name="check-circle" size={20} color={colors.primary} />
            <Text style={st.rowLabel}>{kind === 'pay' ? 'Já foi paga' : 'Já foi recebida'}</Text>
          </View>
          <Switch value={paid} onValueChange={setPaid} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      <View>
        <Label>Avisar às 09:00</Label>
        <View style={st.chips}>
          {ALERT_OPTIONS.map((o) => (
            <Chip key={o.label} label={o.label} active={alertDays === o.value} onPress={() => setAlertDays(o.value)} />
          ))}
        </View>
      </View>

      <PrimaryButton variant="danger" icon="trash-2" label="Apagar conta" onPress={remove} />
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
  switchRow: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  switchLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
}));
