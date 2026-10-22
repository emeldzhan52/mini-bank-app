import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPaymentQr, parsePaymentQr, PaymentQrError, type PaymentRequisites } from '../paymentQr';

const base: PaymentRequisites = {
  name: 'Иван Иванов',
  personalAcc: '40817810000000000001',
  bankName: 'Мини Банк',
  bic: '044525000',
  correspAcc: '30101810400000000225',
};

test('строка в формате ГОСТ', () => {
  const s = buildPaymentQr({ ...base, sum: 150_000, purpose: 'Перевод' });
  assert.equal(
    s,
    'ST00012|Name=Иван Иванов|PersonalAcc=40817810000000000001|BankName=Мини Банк|' +
      'BIC=044525000|CorrespAcc=30101810400000000225|Sum=150000|Purpose=Перевод',
  );
});

test('без суммы и назначения поля не добавляются', () => {
  const s = buildPaymentQr(base);
  assert.ok(!s.includes('Sum='));
  assert.ok(!s.includes('Purpose='));
});

test('разделитель | внутри значения экранируется', () => {
  const s = buildPaymentQr({ ...base, purpose: 'за обед | ужин' });
  assert.ok(s.endsWith('Purpose=за обед / ужин'));
  assert.equal(s.split('|').length, 7);
});

test('неверные реквизиты -> ошибка', () => {
  assert.throws(() => buildPaymentQr({ ...base, bic: '123' }), PaymentQrError);
  assert.throws(() => buildPaymentQr({ ...base, personalAcc: '4081' }), PaymentQrError);
  assert.throws(() => buildPaymentQr({ ...base, sum: -1 }), PaymentQrError);
  assert.throws(() => buildPaymentQr({ ...base, name: '  ' }), PaymentQrError);
});

test('build -> parse даёт исходные данные', () => {
  const r = { ...base, sum: 9_999, purpose: 'Тест' };
  assert.deepEqual(parsePaymentQr(buildPaymentQr(r)), r);
});

test('parse: не платёжная строка', () => {
  assert.equal(parsePaymentQr('https://example.com'), null);
  assert.equal(parsePaymentQr('ST00012|Name=Иван'), null);
});
