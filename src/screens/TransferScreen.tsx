import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, Field, Segmented } from '../components/ui';
import { formatRub, parseRubInput } from '../lib/money';
import { useBank } from '../state/BankContext';
import { colors, space } from '../theme';

export function TransferScreen() {
  const { state, run } = useBank();
  const [fromId, setFromId] = useState(state.accounts[0].id);
  const [toId, setToId] = useState(state.accounts[1]?.id ?? state.accounts[0].id);
  const [amountText, setAmountText] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const options = state.accounts.map((a) => ({ value: a.id, label: a.title }));
  const from = state.accounts.find((a) => a.id === fromId)!;
  const amount = parseRubInput(amountText);

  const submit = () => {
    if (amount === null) return;
    const error = run({ type: 'transfer', fromId, toId, amount, date: new Date().toISOString() });
    setMessage(error ? { ok: false, text: error } : { ok: true, text: `Переведено ${formatRub(amount)}` });
    if (!error) setAmountText('');
  };

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space(4) }} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>Перевод между счетами</Text>

          <Text style={styles.label}>Откуда</Text>
          <Segmented value={fromId} onChange={setFromId} options={options} />
          <View style={{ alignItems: 'center', marginTop: -space(2), marginBottom: space(2) }}>
            <Ionicons name="swap-vertical" size={22} color={colors.accent} onPress={swap} accessibilityLabel="Поменять местами" />
          </View>
          <Text style={styles.label}>Куда</Text>
          <Segmented value={toId} onChange={setToId} options={options} />

          <Card style={{ marginBottom: space(4) }}>
            <Text style={styles.label}>Доступно</Text>
            <Text style={styles.available}>{formatRub(from.balance)}</Text>
          </Card>

          <Field
            label="Сумма"
            placeholder="0 ₽"
            keyboardType="decimal-pad"
            value={amountText}
            onChangeText={(t) => {
              setAmountText(t);
              setMessage(null);
            }}
            error={amountText && amount === null ? 'Некорректная сумма' : null}
          />

          <Button title="Перевести" onPress={submit} disabled={!amount || fromId === toId} />
          {fromId === toId ? <Text style={styles.hint}>Выберите разные счета</Text> : null}
          {message ? (
            <Text style={[styles.message, { color: message.ok ? colors.accent : colors.danger }]}>{message.text}</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: space(5) },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: space(1.5) },
  available: { fontSize: 22, fontWeight: '700', color: colors.text },
  hint: { textAlign: 'center', color: colors.textMuted, marginTop: space(3) },
  message: { textAlign: 'center', fontSize: 15, fontWeight: '600', marginTop: space(4) },
});
