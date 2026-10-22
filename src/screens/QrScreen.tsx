import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

import { Button, Card, Field, Segmented, SectionTitle } from '../components/ui';
import { BANK, USER } from '../data/mock';
import { formatRub, parseRubInput } from '../lib/money';
import { buildPaymentQr, parsePaymentQr } from '../lib/paymentQr';
import { useBank } from '../state/BankContext';
import { colors, radius, space } from '../theme';

type Mode = 'receive' | 'pay';

export function QrScreen() {
  const [mode, setMode] = useState<Mode>('receive');
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: space(4) }} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>QR-платежи</Text>
        <Segmented<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'receive', label: 'Получить' },
            { value: 'pay', label: 'Оплатить' },
          ]}
        />
        {mode === 'receive' ? <ReceiveQr /> : <PayByQr />}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Сгенерировать QR со своими реквизитами — его можно отсканировать для перевода. */
function ReceiveQr() {
  const { state } = useBank();
  const [accountId, setAccountId] = useState(state.accounts[0].id);
  const [amountText, setAmountText] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  const account = state.accounts.find((a) => a.id === accountId)!;
  const amount = amountText.trim() ? parseRubInput(amountText) : undefined;
  const amountError =
    amount === null ? 'Введите сумму, например 1500 или 99,90' : amount === 0 ? 'Сумма должна быть больше нуля' : null;

  // QR пересчитывается только когда меняются данные, а не на каждый рендер.
  const payload = useMemo(() => {
    if (amount === null || amount === 0) return null;
    return buildPaymentQr({
      name: USER.name,
      personalAcc: account.number,
      bankName: BANK.name,
      bic: BANK.bic,
      correspAcc: BANK.correspAcc,
      sum: amount,
      purpose: purpose || undefined,
    });
  }, [account.number, amount, purpose]);

  return (
    <>
      <Segmented
        value={accountId}
        onChange={setAccountId}
        options={state.accounts.map((a) => ({ value: a.id, label: a.title }))}
      />
      <Field
        label="Сумма (необязательно)"
        placeholder="0 ₽"
        keyboardType="decimal-pad"
        value={amountText}
        onChangeText={setAmountText}
        error={amountError}
      />
      <Field label="Назначение (необязательно)" placeholder="За обед" value={purpose} onChangeText={setPurpose} maxLength={60} />

      <Card style={styles.qrCard}>
        {payload ? (
          <>
            <View style={styles.qrFrame}>
              <QRCode value={payload} size={220} ecl="M" color={colors.ink} />
            </View>
            <Text style={styles.qrName}>{USER.name}</Text>
            <Text style={styles.qrSub}>
              {BANK.name} · {account.title}
            </Text>
            {amount ? <Text style={styles.qrAmount}>{formatRub(amount)}</Text> : null}
          </>
        ) : (
          <Text style={styles.qrSub}>Исправьте сумму, чтобы получить QR-код</Text>
        )}
      </Card>

      {payload ? (
        <>
          <Button variant="secondary" title={showRaw ? 'Скрыть данные' : 'Что внутри QR-кода?'} onPress={() => setShowRaw(!showRaw)} />
          {showRaw ? (
            <Text selectable style={styles.raw}>
              {payload}
            </Text>
          ) : null}
        </>
      ) : null}
    </>
  );
}

/** Оплата по строке из QR-кода (в реальном приложении её дала бы камера). */
function PayByQr() {
  const { state, run } = useBank();
  const [text, setText] = useState('');
  const req = useMemo(() => (text.trim() ? parsePaymentQr(text.trim()) : null), [text]);
  const card = state.accounts.find((a) => a.kind === 'card')!;

  const pay = () => {
    if (!req?.sum) return;
    const error = run({
      type: 'pay',
      fromId: card.id,
      amount: req.sum,
      title: `QR: ${req.name}`,
      category: 'qr',
      date: new Date().toISOString(),
    });
    if (error) {
      Alert.alert('Не получилось', error);
    } else {
      Alert.alert('Оплачено', `${formatRub(req.sum)} → ${req.name}`);
      setText('');
    }
  };

  return (
    <>
      <Text style={styles.hint}>
        Вставьте содержимое платёжного QR-кода (строка вида ST00012|Name=…). Распознать код с фото можно
        проектом qr-scanner-opencv.
      </Text>
      <Field
        label="Данные QR-кода"
        placeholder="ST00012|Name=…"
        value={text}
        onChangeText={setText}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        error={text.trim() && !req ? 'Это не платёжный QR-код' : null}
        style={{ height: 110, textAlignVertical: 'top', paddingTop: space(3) }}
      />

      {req ? (
        <>
          <SectionTitle>Получатель</SectionTitle>
          <Card style={{ gap: space(2) }}>
            <Row label="Имя" value={req.name} />
            <Row label="Банк" value={`${req.bankName}, БИК ${req.bic}`} />
            <Row label="Счёт" value={req.personalAcc} />
            {req.purpose ? <Row label="Назначение" value={req.purpose} /> : null}
            <Row label="Сумма" value={req.sum ? formatRub(req.sum) : 'не указана в QR'} />
          </Card>
          <View style={{ height: space(4) }} />
          <Button title={`Оплатить с карты ${req.sum ? formatRub(req.sum) : ''}`} onPress={pay} disabled={!req.sum} />
        </>
      ) : null}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space(3) }}>
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500', flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: space(4) },
  qrCard: { alignItems: 'center', paddingVertical: space(6), marginBottom: space(4) },
  qrFrame: { padding: space(3), backgroundColor: '#fff', borderRadius: radius.sm },
  qrName: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: space(4) },
  qrSub: { fontSize: 14, color: colors.textMuted, marginTop: space(1), textAlign: 'center' },
  qrAmount: { fontSize: 24, fontWeight: '700', color: colors.accent, marginTop: space(2) },
  raw: {
    marginTop: space(3),
    padding: space(3),
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.textMuted,
  },
  hint: { fontSize: 14, color: colors.textMuted, marginBottom: space(4), lineHeight: 20 },
});
