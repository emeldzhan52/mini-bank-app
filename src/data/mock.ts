/** Демо-данные. Все счета, реквизиты и имена выдуманы. */

import type { BankState } from '../lib/bank';

export const USER = {
  name: 'Иван Иванов',
  phone: '+7 900 000-00-00',
};

export const BANK = {
  name: 'Мини Банк',
  bic: '044525000',
  correspAcc: '30101810400000000225',
};

const day = (daysAgo: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
};

export const initialState: BankState = {
  accounts: [
    { id: 'card', title: 'Дебетовая карта', kind: 'card', number: '40817810000000000001', balance: 4_825_050 },
    { id: 'savings', title: 'Накопительный', kind: 'savings', number: '40817810000000000002', balance: 15_000_000 },
  ],
  transactions: [
    { id: 't1', accountId: 'card', amount: -34_900, title: 'Кофейня «Зерно»', category: 'food', date: day(0, 9) },
    { id: 't2', accountId: 'card', amount: -6_200, title: 'Метро', category: 'transport', date: day(0, 8) },
    { id: 't3', accountId: 'card', amount: -215_000, title: 'Продукты', category: 'shopping', date: day(1, 19) },
    { id: 't4', accountId: 'card', amount: 3_500_000, title: 'Стипендия', category: 'income', date: day(2, 12) },
    { id: 't5', accountId: 'card', amount: -129_900, title: 'Книжный магазин', category: 'shopping', date: day(3, 17) },
    { id: 't6', accountId: 'card', amount: -48_000, title: 'Столовая', category: 'food', date: day(4, 13) },
    { id: 't7', accountId: 'savings', amount: 62_500, title: 'Проценты на остаток', category: 'income', date: day(6, 0) },
  ],
};
