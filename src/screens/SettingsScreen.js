import React from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';
import { useStore } from '../store';
import { Card, Screen } from '../ui';

function Row({ icon, title, sub, right, onPress, last }) {
  const body = (
    <View style={[st.row, !last && st.border]}>
      <View style={st.iconBox}>
        <Feather name={icon} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={st.title}>{title}</Text>
        <Text style={st.sub}>{sub}</Text>
      </View>
      {right}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

export default function SettingsScreen({ navigation }) {
  const { data } = useStore();

  // Backup simples: abre a folha de compartilhar do celular com todos os dados em JSON.
  const exportBackup = () =>
    Share.share({ title: 'Backup FinanceBook', message: JSON.stringify(data, null, 2) });

  const chevron = <Feather name="chevron-right" size={20} color={colors.muted} />;

  return (
    <Screen title="Configurações">
      <View>
        <Text style={st.group}>Alertas</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Row
            icon="bell"
            title="Notificações"
            sub="Avisos na barra de notificações do celular"
            right={<Text style={st.on}>Ativas</Text>}
          />
          <Row icon="clock" title="Hora do aviso das contas" sub="Todo aviso de conta toca às 09:00" last />
        </Card>
      </View>

      <View>
        <Text style={st.group}>Seus dados</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Row icon="download" title="Exportar backup" sub="Enviar uma cópia dos dados para outro app" right={chevron} onPress={exportBackup} />
          <Row
            icon="upload"
            title="Importar backup"
            sub="Colar uma cópia e trazer os dados para cá"
            right={chevron}
            onPress={() => navigation.navigate('ImportarBackup')}
          />
          <Row icon="lock" title="Onde ficam os dados" sub="Só neste celular, sem internet" last />
        </Card>
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  group: { fontSize: 12.5, fontWeight: '700', color: colors.muted, marginBottom: 6 },
  row: { minHeight: 64, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.line },
  iconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  on: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
