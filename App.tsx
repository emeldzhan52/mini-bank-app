import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BankProvider } from './src/state/BankContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { TransferScreen } from './src/screens/TransferScreen';
import { QrScreen } from './src/screens/QrScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { colors } from './src/theme';

export type TabParams = {
  Home: undefined;
  Transfer: undefined;
  QR: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<TabParams>();

const icons: Record<keyof TabParams, React.ComponentProps<typeof Ionicons>['name']> = {
  Home: 'home',
  Transfer: 'swap-horizontal',
  QR: 'qr-code',
  History: 'time',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <BankProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: colors.accent,
              tabBarInactiveTintColor: colors.textMuted,
              tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Главная' }} />
            <Tab.Screen name="Transfer" component={TransferScreen} options={{ title: 'Перевод' }} />
            <Tab.Screen name="QR" component={QrScreen} options={{ title: 'QR' }} />
            <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'История' }} />
          </Tab.Navigator>
        </NavigationContainer>
      </BankProvider>
    </SafeAreaProvider>
  );
}
