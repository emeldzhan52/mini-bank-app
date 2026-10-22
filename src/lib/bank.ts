/**
 * Состояние банка и операции над ним — чистые функции (reducer).
 * UI только отправляет действия, вся логика и проверки здесь,
 * поэтому её легко покрыть тестами.
 */

import type { Kopecks } from './money';

export type AccountKind = 'card' | 'savings';

export interface Account {
  id: string;
  title: string;
  kind: AccountKind;
  number: string; // 20 цифр
  balance: Kopecks;
}

export type TxCategory = 'transfer' | 'shopping' | 'food' | 'transport' | 'income' | 'qr';

export interface Transaction {
  id: string;
  accountId: string;
  amount: Kopecks; // < 0 — списание, > 0 — зачисление
  title: string;
  category: TxCategory;
  date: string; // ISO
}

export interface BankState {
  accounts: Account[];
  transactions: Transaction[];
}

export type BankAction =
  | { type: 'transfer'; fromId: string; toId: string; amount: Kopecks; date: string }
  | {
      type: 'pay';
      fromId: string;
      amount: Kopecks;
      title: string;
      category: TxCategory;
      date: string;
    }
  | { type: 'topUp'; toId: string; amount: Kopecks; date: string };

export class BankError extends Error {}

let counter = 0;
const newId = () => `tx_${Date.now().toString(36)}_${(counter++).toString(36)}`;

function findAccount(state: BankState, id: string): Account {
  const acc = state.accounts.find((a) => a.id === id);
  if (!acc) throw new BankError('Счёт не найден');
  return acc;
}

function checkAmount(amount: Kopecks) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new BankError('Сумма должна быть больше нуля');
  }
}

function withBalance(state: BankState, id: string, delta: Kopecks): Account[] {
  return state.accounts.map((a) => (a.id === id ? { ...a, balance: a.balance + delta } : a));
}

/** Бросает BankError при некорректной операции. Не мутирует state. */
export function bankReducer(state: BankState, action: BankAction): BankState {
  switch (action.type) {
    case 'transfer': {
      checkAmount(action.amount);
      if (action.fromId === action.toId) throw new BankError('Выберите разные счета');
      const from = findAccount(state, action.fromId);
      const to = findAccount(state, action.toId);
      if (from.balance < action.amount) throw new BankError('Недостаточно средств');

      let accounts = withBalance(state, from.id, -action.amount);
      accounts = withBalance({ ...state, accounts }, to.id, action.amount);
      const txs: Transaction[] = [
        {
          id: newId(), accountId: from.id, amount: -action.amount,
          title: `Перевод на «${to.title}»`, category: 'transfer', date: action.date,
        },
        {
          id: newId(), accountId: to.id, amount: action.amount,
          title: `Перевод с «${from.title}»`, category: 'transfer', date: action.date,
        },
      ];
      return { accounts, transactions: [...txs, ...state.transactions] };
    }

    case 'pay': {
      checkAmount(action.amount);
      const from = findAccount(state, action.fromId);
      if (from.balance < action.amount) throw new BankError('Недостаточно средств');
      return {
        accounts: withBalance(state, from.id, -action.amount),
        transactions: [
          {
            id: newId(), accountId: from.id, amount: -action.amount,
            title: action.title, category: action.category, date: action.date,
          },
          ...state.transactions,
        ],
      };
    }

    case 'topUp': {
      checkAmount(action.amount);
      const to = findAccount(state, action.toId);
      return {
        accounts: withBalance(state, to.id, action.amount),
        transactions: [
          {
            id: newId(), accountId: to.id, amount: action.amount,
            title: 'Пополнение', category: 'income', date: action.date,
          },
          ...state.transactions,
        ],
      };
    }
  }
}

export function totalBalance(state: BankState): Kopecks {
  return state.accounts.reduce((sum, a) => sum + a.balance, 0);
}

/** Группировка операций по дням для экрана истории. */
export function groupByDay(txs: Transaction[]): { day: string; items: Transaction[] }[] {
  const groups = new Map<string, Transaction[]>();
  for (const tx of [...txs].sort((a, b) => b.date.localeCompare(a.date))) {
    const day = tx.date.slice(0, 10);
    groups.set(day, [...(groups.get(day) ?? []), tx]);
  }
  return [...groups.entries()].map(([day, items]) => ({ day, items }));
}

/** Сумма расходов по категориям за период (для мини-аналитики). */
export function spendingByCategory(txs: Transaction[], sinceIso: string) {
  const result: Partial<Record<TxCategory, Kopecks>> = {};
  for (const tx of txs) {
    if (tx.amount >= 0 || tx.date < sinceIso || tx.category === 'transfer') continue;
    result[tx.category] = (result[tx.category] ?? 0) - tx.amount;
  }
  return result;
}
