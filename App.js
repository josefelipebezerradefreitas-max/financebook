import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { colors } from './src/theme';
import { StoreProvider } from './src/store';
import HomeScreen from './src/screens/HomeScreen';
import NotesScreen from './src/screens/NotesScreen';
import BillsScreen from './src/screens/BillsScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NewNoteScreen from './src/screens/NewNoteScreen';
import NewBillScreen from './src/screens/NewBillScreen';
import SalaryScreen from './src/screens/SalaryScreen';
import ValesScreen from './src/screens/ValesScreen';
import EditBillScreen from './src/screens/EditBillScreen';
import ImportBackupScreen from './src/screens/ImportBackupScreen';
import OverdueScreen from './src/screens/OverdueScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const icons = { Início: 'home', Notas: 'file-text', Contas: 'credit-card', Resumo: 'bar-chart-2', Config: 'settings' };

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11.5, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => <Feather name={icons[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Notas" component={NotesScreen} />
      <Tab.Screen name="Contas" component={BillsScreen} />
      <Tab.Screen name="Resumo" component={SummaryScreen} />
      <Tab.Screen name="Config" component={SettingsScreen} options={{ title: 'Config.' }} />
    </Tab.Navigator>
  );
}

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg } };

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              headerTintColor: colors.ink,
              headerTitleStyle: { fontWeight: '800' },
              headerShadowVisible: false,
              headerStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="NovaNota"
              component={NewNoteScreen}
              options={({ route }) => ({ title: route.params?.id ? 'Editar anotação' : 'Nova anotação' })}
            />
            <Stack.Screen name="NovaConta" component={NewBillScreen} options={{ title: 'Nova conta' }} />
            <Stack.Screen name="Salario" component={SalaryScreen} options={{ title: 'Salário' }} />
            <Stack.Screen name="Vales" component={ValesScreen} options={{ title: 'Vales' }} />
            <Stack.Screen name="EditarConta" component={EditBillScreen} options={{ title: 'Editar conta' }} />
            <Stack.Screen name="Atrasados" component={OverdueScreen} options={{ title: 'Atrasados' }} />
            <Stack.Screen name="ImportarBackup" component={ImportBackupScreen} options={{ title: 'Importar backup' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
