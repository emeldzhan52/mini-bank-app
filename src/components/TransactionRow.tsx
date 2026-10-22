import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Transaction } from '../lib/bank';
import { formatRub } from '../lib/money';
import { categoryMeta, colors, space } from '../theme';

export function TransactionRow({ tx }: { tx: Transaction }) {
  const meta = categoryMeta[tx.category];
  const time = new Date(tx.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const income = tx.amount > 0;

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: meta.color + '1F' }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {tx.title}
        </Text>
        <Text style={styles.sub}>
          {meta.label} · {time}
        </Text>
      </View>
      <Text style={[styles.amount, income && { color: colors.accent }]}>
        {formatRub(tx.amount, true)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space(3), gap: space(3) },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, color: colors.text, fontWeight: '500' },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '600', color: colors.text },
});
