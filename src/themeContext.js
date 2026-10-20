import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyTheme } from './theme';

// Preferência de tema: 'auto' (segue o celular), 'light' (claro) ou 'dark' (noturno).
const KEY = 'financebook:theme';
const Ctx = createContext({ pref: 'auto', mode: 'light', setPref: () => {} });
export const useTheme = () => useContext(Ctx);

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState('auto');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => v && setPrefState(v))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const mode = pref === 'auto' ? (system === 'dark' ? 'dark' : 'light') : pref;
  // Troca as cores antes de desenhar a tela. A chave `mode` refaz a tela com o novo tema.
  applyTheme(mode);

  const setPref = (next) => {
    setPrefState(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  };

  if (!loaded) return null;
  return (
    <Ctx.Provider value={{ pref, mode, setPref }}>
      <React.Fragment key={mode}>{children}</React.Fragment>
    </Ctx.Provider>
  );
}
