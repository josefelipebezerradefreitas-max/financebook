import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { colors, themed, getMode, categories as defaultCategories } from './theme';
import { useStore } from './store';
import { fmtDate, fmtTime } from './format';

// Tela com título grande, rolagem e botão flutuante opcional (abas sem cabeçalho).
export function Screen({ title, subtitle, right, fab, children }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 120, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.headRow}>
          <View style={{ flex: 1 }}>
            {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
            <Text style={s.h1}>{title}</Text>
          </View>
          {right}
        </View>
        {children}
      </ScrollView>
      {fab}
    </View>
  );
}

// Tela de formulário (usa o cabeçalho da pilha de navegação).
export function FormScreen({ children, footer }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      <View style={s.footer}>{footer}</View>
    </View>
  );
}

// Botão redondo flutuante. `light` é a versão menor e branca (ação secundária);
// `bottom` permite empilhar vários botões.
export function Fab({ onPress, label, icon = 'plus', bottom = 24, light = false }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={[s.fab, { bottom }, light && s.fabLight]}
    >
      <Feather name={icon} size={light ? 22 : 26} color={light ? colors.ink : '#fff'} />
    </Pressable>
  );
}

// Botão de menu (três linhas) que, ao tocar, abre as ações em arco ao redor dele,
// de cima até a esquerda. Cada ação: { icon, label, onPress, primary }.
export function FabMenu({ open, onToggle, actions }) {
  const R = 96;
  const n = actions.length;
  return (
    <>
      {open && <Pressable accessibilityLabel="Fechar menu" onPress={onToggle} style={s.scrim} />}
      {open &&
        actions.map((a, i) => {
          const angle = Math.PI / 2 + (n === 1 ? 0 : (i * (Math.PI / 2)) / (n - 1));
          const left = -Math.cos(angle) * R;
          const up = Math.sin(angle) * R;
          return (
            <View key={a.label} style={[s.opt, { right: 8 + left, bottom: 10 + up }]}>
              <Pressable
                onPress={a.onPress}
                accessibilityLabel={a.label}
                style={[s.optBtn, a.primary && s.optBtnPrimary]}
              >
                <Feather name={a.icon} size={22} color={a.primary ? colors.primaryDark : colors.ink} />
              </Pressable>
              <Text style={s.optLabel}>{a.label}</Text>
            </View>
          );
        })}
      <Fab
        icon={open ? 'x' : 'menu'}
        label={open ? 'Fechar menu' : 'Abrir menu'}
        onPress={onToggle}
      />
    </>
  );
}

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children, right }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.h2}>{children}</Text>
      {right}
    </View>
  );
}

export function Label({ children }) {
  return <Text style={s.label}>{children}</Text>;
}

export function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[s.chip, active && s.chipActive]}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

// Escolha de categoria: as que já vêm no app, as que você criou e o botão "+ Nova".
// `current` entra na lista mesmo se a categoria não existir mais (ex.: contas antigas).
export function CategoryPicker({ value, onChange, current }) {
  const { customCategories, addCategory } = useStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const all = [...defaultCategories, ...customCategories];
  if (current && !all.some((c) => c.toLowerCase() === current.toLowerCase())) all.push(current);

  const add = () => {
    const n = name.trim();
    if (!n) return;
    const same = all.find((c) => c.toLowerCase() === n.toLowerCase());
    if (!same) addCategory(n);
    onChange(same || n);
    setName('');
    setAdding(false);
  };

  return (
    <View style={{ gap: 10 }}>
      <View style={s.chipsRow}>
        {all.map((c) => (
          <Chip key={c} label={c} active={value === c} onPress={() => onChange(c)} />
        ))}
        <Pressable onPress={() => setAdding((a) => !a)} accessibilityLabel="Nova categoria" style={s.chipNew}>
          <Text style={s.chipText}>+ Nova</Text>
        </Pressable>
      </View>
      {adding && (
        <View style={s.addRow}>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="Nome da categoria"
            placeholderTextColor={colors.muted}
            maxLength={24}
            returnKeyType="done"
            onSubmitEditing={add}
            style={s.addInput}
            accessibilityLabel="Nome da nova categoria"
          />
          <Pressable onPress={add} style={s.addBtn}>
            <Text style={s.addBtnText}>Adicionar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const tones = () => ({
  red: { bg: colors.redTint, fg: colors.red },
  amber: { bg: colors.amberTint, fg: colors.amber },
  gray: { bg: colors.gray, fg: colors.grayText },
  green: { bg: colors.primaryTint, fg: colors.primaryDark },
});

export function Pill({ label, tone = 'gray', icon }) {
  const t = tones()[tone];
  return (
    <View style={[s.pill, { backgroundColor: t.bg }]}>
      {icon ? <Feather name={icon} size={13} color={t.fg} /> : null}
      <Text style={[s.pillText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={s.segment}>
      {options.map((o) => (
        <Pressable
          key={o.value}
          onPress={() => onChange(o.value)}
          style={[s.segItem, value === o.value && s.segItemActive]}
        >
          <Text style={[s.segText, value === o.value && { color: colors.onInk }]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function MonthNav({ label, onPrev, onNext }) {
  return (
    <View style={s.monthRow}>
      <Pressable onPress={onPrev} accessibilityLabel="Mês anterior" style={s.monthBtn}>
        <Feather name="chevron-left" size={22} color={colors.ink} />
      </Pressable>
      <Text style={s.monthText}>{label}</Text>
      <Pressable onPress={onNext} accessibilityLabel="Próximo mês" style={s.monthBtn}>
        <Feather name="chevron-right" size={22} color={colors.ink} />
      </Pressable>
    </View>
  );
}

export function PrimaryButton({ label, onPress, variant = 'solid', icon, style }) {
  const danger = variant === 'danger';
  const outline = variant === 'outline' || danger;
  const fg = danger ? colors.red : outline ? colors.ink : '#fff';
  return (
    <Pressable
      onPress={onPress}
      style={[s.btn, outline ? s.btnOutline : s.btnSolid, danger && { borderColor: colors.red }, style]}
    >
      {icon ? <Feather name={icon} size={20} color={fg} /> : null}
      <Text style={[s.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function RowButton({ label, value, onPress, last }) {
  return (
    <Pressable onPress={onPress} style={[s.rowBtn, !last && s.rowBorder]}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </Pressable>
  );
}

// Campo de data ou hora que abre o seletor nativo do celular.
export function DateField({ label, value, mode, onChange, last }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <RowButton
        label={label}
        value={mode === 'time' ? fmtTime(value) : fmtDate(value)}
        onPress={() => setShow(true)}
        last={last}
      />
      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour
          themeVariant={getMode()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, picked) => {
            setShow(Platform.OS === 'ios');
            if (picked) onChange(picked);
          }}
        />
      )}
    </>
  );
}

export const s = themed(() => ({
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subtitle: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  h1: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  h2: { fontSize: 17, fontWeight: '800', color: colors.ink },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  label: { fontSize: 12.5, fontWeight: '700', color: colors.muted, marginBottom: 6 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipNew: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.card,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  addBtn: { minHeight: 48, paddingHorizontal: 16, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 14.5, fontWeight: '800', color: '#fff' },
  chipActive: { backgroundColor: colors.primaryTint, borderColor: colors.primary, borderWidth: 1.5 },
  chipText: { fontSize: 13.5, fontWeight: '600', color: colors.ink },
  chipTextActive: { color: colors.primaryDark, fontWeight: '700' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: { fontSize: 12, fontWeight: '700' },
  segment: { flexDirection: 'row', padding: 4, backgroundColor: colors.track, borderRadius: 14 },
  segItem: { flex: 1, minHeight: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segItemActive: { backgroundColor: colors.ink },
  segText: { fontSize: 14.5, fontWeight: '700', color: colors.grayText },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  monthText: { fontSize: 16, fontWeight: '800', color: colors.ink },
  btn: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  btnSolid: { backgroundColor: colors.primary },
  btnOutline: { borderWidth: 1.5, borderColor: colors.ink, backgroundColor: colors.card },
  btnText: { fontSize: 15, fontWeight: '800' },
  rowBtn: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  rowValue: { fontSize: 15, fontWeight: '700', color: colors.primary },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#12201B',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  scrim: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(18,32,27,0.7)' },
  opt: { position: 'absolute', width: 80, alignItems: 'center' },
  optBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  optBtnPrimary: { backgroundColor: colors.primaryTint },
  optLabel: { marginTop: 4, fontSize: 11.5, lineHeight: 14, fontWeight: '700', color: '#fff' },
  fabLight: {
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: { position: 'absolute', left: 20, right: 20, bottom: 24 },
}));
