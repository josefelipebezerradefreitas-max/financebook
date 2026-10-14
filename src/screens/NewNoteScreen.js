import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';
import { useStore } from '../store';
import { Card, DateField, FormScreen, Label, PrimaryButton } from '../ui';
import { fmtDate, fmtTime } from '../format';
import { shareEmail, shareWhatsApp } from '../share';

function defaultAlert() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}

export default function NewNoteScreen({ navigation, route }) {
  const { notes, saveNote, deleteNote } = useStore();
  const editing = route.params?.id ? notes.find((n) => n.id === route.params.id) : null;

  const [title, setTitle] = useState(editing?.title || '');
  const [text, setText] = useState(editing?.text || '');
  const [alertOn, setAlertOn] = useState(editing ? !!editing.alertAt : true);
  const [when, setWhen] = useState(editing?.alertAt ? new Date(editing.alertAt) : defaultAlert());

  const setDatePart = (d) => {
    const x = new Date(when);
    x.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
    setWhen(x);
  };
  const setTimePart = (d) => {
    const x = new Date(when);
    x.setHours(d.getHours(), d.getMinutes(), 0, 0);
    setWhen(x);
  };

  const message = () =>
    [title, text, alertOn ? `Lembrete: ${fmtDate(when)} às ${fmtTime(when)}` : '']
      .filter(Boolean)
      .join('\n');

  const save = async () => {
    if (!title.trim()) return Alert.alert('Falta o título', 'Dê um título para a anotação.');
    await saveNote({
      id: editing?.id,
      title: title.trim(),
      text: text.trim(),
      alertAt: alertOn ? when.toISOString() : null,
    });
    navigation.goBack();
  };

  const remove = () =>
    Alert.alert('Excluir anotação', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(editing.id);
          navigation.goBack();
        },
      },
    ]);

  return (
    <FormScreen footer={<PrimaryButton label="Salvar anotação" onPress={save} />}>
      <View>
        <Label>Título</Label>
        <TextInput value={title} onChangeText={setTitle} placeholder="Ex.: Consulta com dermatologista" placeholderTextColor={colors.muted} style={st.input} />
      </View>
      <View>
        <Label>Anotação</Label>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escreva os detalhes"
          placeholderTextColor={colors.muted}
          multiline
          style={[st.input, { height: 100, paddingTop: 12, textAlignVertical: 'top', fontSize: 15 }]}
        />
      </View>

      <View>
        <Label>Alerta</Label>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={[st.switchRow, alertOn && st.border]}>
            <View style={st.switchLabel}>
              <Feather name="bell" size={20} color={colors.amber} />
              <Text style={st.rowLabel}>Avisar no dia</Text>
            </View>
            <Switch value={alertOn} onValueChange={setAlertOn} trackColor={{ true: colors.primary }} />
          </View>
          {alertOn && (
            <>
              <DateField label="Data" mode="date" value={when} onChange={setDatePart} />
              <DateField label="Hora" mode="time" value={when} onChange={setTimePart} last />
            </>
          )}
        </Card>
      </View>

      <View>
        <Label>Enviar este lembrete</Label>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PrimaryButton
            variant="outline"
            icon="message-circle"
            label="WhatsApp"
            style={{ flex: 1 }}
            onPress={() => shareWhatsApp(message())}
          />
          <PrimaryButton
            variant="outline"
            icon="mail"
            label="E-mail"
            style={{ flex: 1 }}
            onPress={() => shareEmail(title || 'Lembrete', message())}
          />
        </View>
        <Text style={st.help}>
          Ao tocar, o app abre o WhatsApp ou o e-mail com a mensagem pronta. Você só confirma o envio.
        </Text>
      </View>

      {editing && <PrimaryButton variant="outline" icon="trash-2" label="Excluir anotação" onPress={remove} />}
    </FormScreen>
  );
}

const st = StyleSheet.create({
  input: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  switchRow: { minHeight: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  help: { fontSize: 12.5, lineHeight: 18, color: colors.muted, marginTop: 8 },
});
