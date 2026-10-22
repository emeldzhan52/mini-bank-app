import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import type { TabParams } from '../../App';
import { TransactionRow } from '../components/TransactionRow';
import { Card, SectionTitle } from '../components/ui';
import { USER } from '../data/mock';
import { totalBalance } from '../lib/bank';
import { formatRub, maskAccount } from '../lib/money';
import { useBank } from '../state/BankContext';
import { colors, radius, space } from '../theme';

export function HomeScreen() {
  const { state, run } = useBank();
  const nav = useNavigation<BottomTabNavigationProp<TabParams>>();

  const topUp = () => {
    const error = run({ type: 'topUp', toId: 'card', amount: 100_000, date: new Date().toISOString() });
    Alert.alert(error ? 'Ошибка' : 'Готово', error ?? 'Карта пополнена на 1 000 ₽ (демо)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space(8) }}>
        <View style={styles.header}>
          <SafeAreaView edges={['top']}>
            <Text style={styles.hello}>Добрый день, {USER.name.split(' ')[0]}</Text>
            <Text style={styles.totalLabel}>Всего на счетах</Text>
            <Text style={styles.total}>{formatRub(totalBalance(state))}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space(3) }}>
              {state.accounts.map((a) => (
                <View key={a.id} style={[styles.account, a.kind === 'card' && styles.accountCard]}>
                  <Ionicons
                    name={a.kind === 'card' ? 'card' : 'wallet'}
                    size={22}
                    color={a.kind === 'card' ? colors.ink : colors.onInk}
                  />
                  <Text style={[styles.accTitle, a.kind === 'card' && { color: colors.ink }]}>{a.title}</Text>
                  <Text style={[styles.accBalance, a.kind === 'card' && { color: colors.ink }]}>
                    {formatRub(a.balance)}
                  </Text>
                  <Text style={[styles.accNumber, a.kind === 'card' && { color: colors.inkSoft }]}>
                    {maskAccount(a.number)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>

        <View style={styles.actions}>
          <Action icon="swap-horizontal" label="Перевести" onPress={() => nav.navigate('Transfer')} />
          <Action icon="qr-code" label="QR-код" onPress={() => nav.navigate('QR')} />
          <Action icon="add" label="Пополнить" onPress={topUp} />
          <Action icon="time" label="История" onPress={() => nav.navigate('History')} />
        </View>

        <View style={{ paddingHorizontal: space(4) }}>
          <SectionTitle>Последние операции</SectionTitle>
          <Card style={{ paddingVertical: space(1) }}>
            {state.transactions.slice(0, 5).map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function Action({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.ink,
    paddingHorizontal: space(4),
    paddingBottom: space(6),
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  hello: { color: colors.onInkMuted, fontSize: 15, marginTop: space(3) },
  totalLabel: { color: colors.onInkMuted, fontSize: 13, marginTop: space(5) },
  total: { color: colors.onInk, fontSize: 34, fontWeight: '700', marginBottom: space(5), letterSpacing: -0.5 },
  account: {
    width: 190,
    padding: space(4),
    borderRadius: radius.md,
    backgroundColor: colors.inkSoft,
    gap: space(1),
  },
  accountCard: { backgroundColor: '#B8F0D6' },
  accTitle: { color: colors.onInkMuted, fontSize: 13, marginTop: space(3) },
  accBalance: { color: colors.onInk, fontSize: 20, fontWeight: '700' },
  accNumber: { color: colors.onInkMuted, fontSize: 12 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space(4),
    marginTop: space(5),
  },
  action: { alignItems: 'center', width: 76, gap: space(1.5) },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, color: colors.text },
});
