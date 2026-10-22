import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionRow } from '../components/TransactionRow';
import { Card } from '../components/ui';
import { groupByDay, spendingByCategory, type TxCategory } from '../lib/bank';
import { formatRub } from '../lib/money';
import { useBank } from '../state/BankContext';
import { categoryMeta, colors, radius, space } from '../theme';

function dayLabel(isoDay: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (isoDay === today) return 'Сегодня';
  if (isoDay === yesterday) return 'Вчера';
  return new Date(isoDay).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export function HistoryScreen() {
  const { state } = useBank();

  const sections = useMemo(
    () => groupByDay(state.transactions).map((g) => ({ title: dayLabel(g.day), data: g.items })),
    [state.transactions],
  );

  const spending = useMemo(() => {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const byCat = spendingByCategory(state.transactions, since);
    const entries = (Object.entries(byCat) as [TxCategory, number][]).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    return { entries, total };
  }, [state.transactions]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <SectionList
        sections={sections}
        keyExtractor={(tx) => tx.id}
        contentContainerStyle={{ padding: space(4) }}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <>
            <Text style={styles.h1}>История</Text>
            <Card>
              <Text style={styles.muted}>Траты за 30 дней</Text>
              <Text style={styles.total}>{formatRub(spending.total)}</Text>
              {/* Полоска долей по категориям */}
              <View style={styles.bar}>
                {spending.entries.map(([cat, value]) => (
                  <View key={cat} style={{ flex: value, backgroundColor: categoryMeta[cat].color }} />
                ))}
              </View>
              {spending.entries.map(([cat, value]) => (
                <View key={cat} style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: categoryMeta[cat].color }]} />
                  <Text style={{ flex: 1, color: colors.text }}>{categoryMeta[cat].label}</Text>
                  <Text style={{ color: colors.text, fontWeight: '500' }}>{formatRub(value)}</Text>
                </View>
              ))}
            </Card>
          </>
        }
        renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
        renderItem={({ item }) => <TransactionRow tx={item} />}
        ListEmptyComponent={<Text style={styles.muted}>Операций пока нет</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: space(4) },
  muted: { color: colors.textMuted, fontSize: 13 },
  total: { fontSize: 26, fontWeight: '700', color: colors.text, marginVertical: space(2) },
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: space(3),
    backgroundColor: colors.border,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space(1), gap: space(2) },
  dot: { width: 10, height: 10, borderRadius: 5 },
  section: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: space(6), marginBottom: space(1) },
});
