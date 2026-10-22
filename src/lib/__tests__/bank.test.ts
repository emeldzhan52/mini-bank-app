import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  bankReducer,
  BankError,
  groupByDay,
  spendingByCategory,
  totalBalance,
  type BankState,
} from '../bank';

const date = '2026-10-21T10:00:00.000Z';

const state = (): BankState => ({
  accounts: [
    { id: 'a', title: 'Карта', kind: 'card', number: '40817810000000000001', balance: 10_000 },
    { id: 'b', title: 'Копилка', kind: 'savings', number: '40817810000000000002', balance: 0 },
  ],
  transactions: [],
});

test('перевод между счетами', () => {
  const s = bankReducer(state(), { type: 'transfer', fromId: 'a', toId: 'b', amount: 2_500, date });
  assert.equal(s.accounts[0].balance, 7_500);
  assert.equal(s.accounts[1].balance, 2_500);
  assert.equal(s.transactions.length, 2);
  assert.equal(totalBalance(s), 10_000); // деньги не появились и не исчезли
});

test('исходное состояние не мутируется', () => {
  const s0 = state();
  bankReducer(s0, { type: 'transfer', fromId: 'a', toId: 'b', amount: 100, date });
  assert.equal(s0.accounts[0].balance, 10_000);
  assert.equal(s0.transactions.length, 0);
});

test('ошибки перевода', () => {
  const s = state();
  const t = (amount: number, fromId = 'a', toId = 'b') =>
    bankReducer(s, { type: 'transfer', fromId, toId, amount, date });
  assert.throws(() => t(20_000), /Недостаточно средств/);
  assert.throws(() => t(0), BankError);
  assert.throws(() => t(10.5), BankError);
  assert.throws(() => t(100, 'a', 'a'), /разные счета/);
  assert.throws(() => t(100, 'a', 'zzz'), /не найден/);
});

test('оплата и пополнение', () => {
  let s = bankReducer(state(), {
    type: 'pay', fromId: 'a', amount: 3_000, title: 'Кофе', category: 'food', date,
  });
  s = bankReducer(s, { type: 'topUp', toId: 'b', amount: 500, date });
  assert.equal(s.accounts[0].balance, 7_000);
  assert.equal(s.accounts[1].balance, 500);
  assert.deepEqual(s.transactions.map((t) => t.amount), [500, -3_000]);
});

test('группировка по дням, новые сверху', () => {
  const txs = [
    { id: '1', accountId: 'a', amount: -1, title: '', category: 'food' as const, date: '2026-10-20T09:00:00Z' },
    { id: '2', accountId: 'a', amount: -1, title: '', category: 'food' as const, date: '2026-10-21T09:00:00Z' },
    { id: '3', accountId: 'a', amount: -1, title: '', category: 'food' as const, date: '2026-10-21T12:00:00Z' },
  ];
  const g = groupByDay(txs);
  assert.deepEqual(g.map((x) => x.day), ['2026-10-21', '2026-10-20']);
  assert.deepEqual(g[0].items.map((t) => t.id), ['3', '2']);
});

test('расходы по категориям без переводов и доходов', () => {
  const txs = [
    { id: '1', accountId: 'a', amount: -100, title: '', category: 'food' as const, date },
    { id: '2', accountId: 'a', amount: -50, title: '', category: 'food' as const, date },
    { id: '3', accountId: 'a', amount: -999, title: '', category: 'transfer' as const, date },
    { id: '4', accountId: 'a', amount: 500, title: '', category: 'income' as const, date },
    { id: '5', accountId: 'a', amount: -70, title: '', category: 'food' as const, date: '2020-01-01T00:00:00Z' },
  ];
  assert.deepEqual(spendingByCategory(txs, '2026-01-01'), { food: 150 });
});
