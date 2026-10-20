import { StyleSheet } from 'react-native';

const light = {
  bg: '#F4F7F5',
  card: '#FFFFFF',
  ink: '#12201B',
  onInk: '#FFFFFF',
  muted: '#5B6B64',
  line: '#E1E8E4',
  border: '#D3DCD7',
  track: '#E3EAE6',
  primary: '#0E6B57',
  primaryDark: '#0A5242',
  primaryTint: '#DDF0E9',
  amber: '#8A5A00',
  amberTint: '#FCEFD2',
  red: '#A8321F',
  redTint: '#FBE3DE',
  gray: '#EAEFEC',
  grayText: '#3E4C46',
  onRed: '#7A2414',
  onAmber: '#5E3D00',
  onAmberSub: '#6B4A0A',
};

const dark = {
  bg: '#0E1512',
  card: '#18221E',
  ink: '#E8F0EC',
  onInk: '#0E1512',
  muted: '#9AAAA2',
  line: '#26332D',
  border: '#33443C',
  track: '#26332D',
  primary: '#25967B',
  primaryDark: '#9FE0CD',
  primaryTint: '#1C3A32',
  amber: '#F0B84A',
  amberTint: '#3A2F14',
  red: '#F08A78',
  redTint: '#3D1F1A',
  gray: '#26332D',
  grayText: '#B9C7C0',
  onRed: '#F6C3B9',
  onAmber: '#F3D48A',
  onAmberSub: '#E3C27A',
};

// `colors` é um objeto único e mutável: ao trocar o tema, os valores são trocados
// aqui dentro e a tela é desenhada de novo.
export const colors = { ...light };
let mode = 'light';

export const getMode = () => mode;

export function applyTheme(next) {
  mode = next === 'dark' ? 'dark' : 'light';
  Object.assign(colors, mode === 'dark' ? dark : light);
}

// Igual ao StyleSheet.create, mas os estilos são montados na hora de usar,
// com as cores do tema atual (um conjunto guardado por tema).
export function themed(build) {
  const cache = {};
  return new Proxy(
    {},
    {
      get(_, key) {
        if (!cache[mode]) cache[mode] = StyleSheet.create(build());
        return cache[mode][key];
      },
    }
  );
}

export const categories = ['Moradia', 'Mercado', 'Transporte', 'Saúde', 'Lazer', 'Imposto', 'Investimento', 'Estudos'];
