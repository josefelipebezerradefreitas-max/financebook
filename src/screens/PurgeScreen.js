import React, { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { colors, themed } from '../theme';
import { useStore } from '../store';
import { Card, FormScreen, Label, MonthNav, PrimaryButton, Segmented } from '../ui';
import { addMonths, monthLabel } from '../format';
import { lastAllowedMonth, selectPurge } from '../purge';

export default function PurgeScreen({ navigation }) {
  const { data, purge } = useStore();
  const max = lastAllowedMonth();
  const [month, setMonth] = useState(addMonths(max, -11));
  const [scope, setScope] = useState('until');

  const sel = useMemo(() => selectPurge(data, month, scope), [data, month, scope]);
  const total = sel.billIds.length + sel.noteIds.length + sel.valeIds.length;
  const label = monthLabel(month);

  const next = () => {
    const n = addMonths(month, 1);
    if (n <= max) setMonth(n);
  };

  const run = () =>
    Alert.alert(
      'Apagar estes dados?',
      `${sel.billIds.length} conta(s), ${sel.noteIds.length} anotação(ões) e ${sel.valeIds.length} vale(s) serão apagados do celular. Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await purge(sel);
            Alert.alert('Pronto', 'Os dados antigos foram apagados.');
            navigation.goBack();
          },
        },
      ]
    );

  return (
    <FormScreen footer={<PrimaryButton variant="danger" icon="trash-2" label={total > 0 ? `Apagar ${total} item(ns)` : 'Nada para apagar'} onPress={total > 0 ? run : () => {}} />}>
      <Text style={st.intro}>
        Apagar o que é antigo deixa o app mais leve e gasta menos memória. Escolha o mês e o ano.
      </Text>

      <View>
        <Label>Período</Label>
        <Segmented
          value={scope}
          onChange={setScope}
          options={[
            { value: 'month', label: 'Só este mês' },
            { value: 'until', label: 'Tudo até este mês' },
          ]}
        />
      </View>

      <Card>
        <MonthNav label={label} onPrev={() => setMonth(addMonths(month, -1))} onNext={next} />
      </Card>

      <Card style={{ gap: 6 }}>
        <Text style={st.h}>O que será apagado</Text>
        <Text style={st.line}>{sel.billIds.length} conta(s) já paga(s) ou recebida(s)</Text>
        <Text style={st.line}>{sel.noteIds.length} anotação(ões) com alerta que já passou</Text>
        <Text style={st.line}>{sel.valeIds.length} vale(s)</Text>
      </Card>

      <Text style={st.help}>
        Contas em aberto nunca são apagadas{sel.keptOpen > 0 ? ` (${sel.keptOpen} ficam neste período)` : ''}, nem anotações sem alerta.
        O mês atual também fica de fora. Os vales apagados deixam de contar nos saldos dos meses antigos.
        Dica: exporte um backup em Config. antes de apagar.
      </Text>
    </FormScreen>
  );
}

const st = themed(() => ({
  intro: { fontSize: 14.5, lineHeight: 21, color: colors.grayText },
  h: { fontSize: 15, fontWeight: '800', color: colors.ink },
  line: { fontSize: 14, color: colors.ink },
  help: { fontSize: 12.5, lineHeight: 18, color: colors.muted },
}));
