import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, themed } from '../theme';
import { useStore } from '../store';
import { Card, FormScreen, Label, PrimaryButton } from '../ui';
import { parseBackup } from '../backup';

export default function ImportBackupScreen({ navigation }) {
  const { importBackup, notes, bills } = useStore();
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const run = () => {
    const res = parseBackup(text);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError('');
    const { data } = res;
    Alert.alert(
      'Trocar os dados deste celular?',
      `O backup tem ${data.bills.length} conta(s), ${data.notes.length} anotação(ões) e ${data.vales.length} vale(s).\n\nOs dados que estão agora no app (${bills.length} conta(s) e ${notes.length} anotação(ões)) serão substituídos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: async () => {
            await importBackup(data);
            Alert.alert('Backup importado', 'Seus dados foram colocados no app.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <FormScreen footer={<PrimaryButton icon="upload" label="Importar backup" onPress={run} />}>
      <Card style={{ backgroundColor: colors.primaryTint }}>
        <Text style={st.help}>
          Cole aqui o texto que você guardou com "Exportar backup". Segure o dedo no campo e toque em Colar.
        </Text>
      </Card>
      <View>
        <Label>Texto do backup</Label>
        <TextInput
          value={text}
          onChangeText={(v) => {
            setText(v);
            setError('');
          }}
          placeholder="Cole o backup aqui"
          placeholderTextColor={colors.muted}
          multiline
          autoCorrect={false}
          autoCapitalize="none"
          style={st.input}
          accessibilityLabel="Texto do backup"
        />
        {error ? <Text style={st.error}>{error}</Text> : null}
      </View>
    </FormScreen>
  );
}

const st = themed(() => ({
  help: { fontSize: 14, fontWeight: '600', color: colors.primaryDark, lineHeight: 20 },
  input: {
    minHeight: 220,
    maxHeight: 360,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    fontSize: 13,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  error: { marginTop: 8, fontSize: 13.5, fontWeight: '700', color: colors.red },
}));
