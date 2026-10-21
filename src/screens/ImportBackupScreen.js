import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, themed } from '../theme';
import { useStore } from '../store';
import { Card, FormScreen, Label, PrimaryButton } from '../ui';
import { parseBackup } from '../backup';
import { pickBackupFile } from '../backupFile';

export default function ImportBackupScreen({ navigation }) {
  const { importBackup, notes, bills } = useStore();
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const choose = async () => {
    try {
      const raw = await pickBackupFile();
      if (raw === null) return;
      setText(raw);
      run(raw);
    } catch (e) {
      setError('Não consegui abrir esse arquivo.');
    }
  };

  const run = (raw = text) => {
    const res = parseBackup(raw);
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
    <FormScreen footer={<PrimaryButton icon="file" label="Escolher arquivo de backup" onPress={choose} />}>
      <Card style={{ backgroundColor: colors.primaryTint }}>
        <Text style={st.help}>
          Toque em "Escolher arquivo de backup" e selecione o arquivo .json que você salvou com "Exportar backup".
        </Text>
      </Card>
      <View>
        <Label>Ou cole o texto do backup</Label>
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
        {text.trim() ? <PrimaryButton variant="outline" icon="upload" label="Importar texto colado" onPress={() => run()} style={{ marginTop: 10 }} /> : null}
      </View>
    </FormScreen>
  );
}

const st = themed(() => ({
  help: { fontSize: 14, fontWeight: '600', color: colors.primaryDark, lineHeight: 20 },
  input: {
    minHeight: 140,
    maxHeight: 260,
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
