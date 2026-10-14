import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';
import { useStore } from '../store';
import { Card, Chip, Fab, Pill, Screen } from '../ui';
import { fmtShort, fmtTime, sameDay } from '../format';

export default function NotesScreen({ navigation }) {
  const { notes } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const now = new Date();

  const list = notes
    .filter((n) => {
      if (filter === 'today') return n.alertAt && sameDay(new Date(n.alertAt), now);
      if (filter === 'alert') return !!n.alertAt;
      return true;
    })
    .filter((n) => `${n.title} ${n.text}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Screen
      title="Anotações"
      fab={<Fab label="Nova anotação" onPress={() => navigation.navigate('NovaNota')} />}
    >
      <View style={st.search}>
        <Feather name="search" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar anotações"
          placeholderTextColor={colors.muted}
          style={st.input}
          accessibilityLabel="Buscar anotações"
        />
      </View>
      <View style={st.chips}>
        <Chip label="Todas" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Hoje" active={filter === 'today'} onPress={() => setFilter('today')} />
        <Chip label="Com alerta" active={filter === 'alert'} onPress={() => setFilter('alert')} />
      </View>

      {list.length === 0 ? (
        <Card><Text style={st.empty}>Nenhuma anotação por aqui. Toque no + para criar.</Text></Card>
      ) : (
        list.map((n) => {
          const when = n.alertAt ? new Date(n.alertAt) : null;
          const isToday = when && sameDay(when, now);
          return (
            <Pressable key={n.id} onPress={() => navigation.navigate('NovaNota', { id: n.id })}>
              <Card>
                <Text style={st.title}>{n.title}</Text>
                {n.text ? <Text numberOfLines={1} style={st.text}>{n.text}</Text> : null}
                <View style={{ marginTop: 8 }}>
                  {when ? (
                    <Pill
                      icon="bell"
                      tone={isToday ? 'red' : 'amber'}
                      label={`${isToday ? 'Hoje' : fmtShort(when)} · ${fmtTime(when)}`}
                    />
                  ) : (
                    <Pill label="Sem alerta" tone="gray" />
                  )}
                </View>
              </Card>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  input: { flex: 1, fontSize: 15, color: colors.ink },
  chips: { flexDirection: 'row', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: colors.ink },
  text: { fontSize: 13.5, color: colors.muted, marginTop: 2 },
  empty: { fontSize: 14, color: colors.muted },
});
