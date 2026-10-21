import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, themed } from '../theme';
import { useStore } from '../store';
import { Card, FormScreen } from '../ui';

export default function CategoriesScreen() {
  const { allCategories, addCategory, removeCategory } = useStore();
  const [name, setName] = useState('');

  const add = () => {
    const n = name.trim();
    if (!n) return;
    addCategory(n);
    setName('');
  };

  const remove = (c) =>
    Alert.alert(
      `Apagar "${c}"?`,
      'A categoria sai da lista. As contas que já usam esse nome continuam como estão.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => removeCategory(c) },
      ]
    );

  return (
    <FormScreen>
      <View style={st.addRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nova categoria"
          placeholderTextColor={colors.muted}
          maxLength={24}
          returnKeyType="done"
          onSubmitEditing={add}
          style={st.input}
          accessibilityLabel="Nome da nova categoria"
        />
        <Pressable onPress={add} style={st.addBtn}>
          <Text style={st.addText}>Adicionar</Text>
        </Pressable>
      </View>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {allCategories.length === 0 ? (
          <Text style={st.empty}>Nenhuma categoria. Adicione uma acima.</Text>
        ) : (
          allCategories.map((c, i) => (
            <View key={c} style={[st.row, i < allCategories.length - 1 && st.border]}>
              <Text style={st.name}>{c}</Text>
              <Pressable onPress={() => remove(c)} accessibilityLabel={`Apagar ${c}`} style={st.del}>
                <Feather name="trash-2" size={20} color={colors.red} />
              </Pressable>
            </View>
          ))
        )}
      </Card>
    </FormScreen>
  );
}

const st = themed(() => ({
  addRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
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
  addBtn: { minHeight: 52, paddingHorizontal: 16, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addText: { fontSize: 14.5, fontWeight: '800', color: '#fff' },
  row: { minHeight: 56, paddingLeft: 16, paddingRight: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  border: { borderBottomWidth: 1, borderBottomColor: colors.line },
  name: { fontSize: 15, fontWeight: '600', color: colors.ink },
  del: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: 16, fontSize: 14, color: colors.muted },
}));
