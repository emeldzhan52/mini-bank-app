import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

import { BankError, bankReducer, type BankAction, type BankState } from '../lib/bank';
import { initialState } from '../data/mock';

interface BankContextValue {
  state: BankState;
  /** Выполнить операцию. Возвращает текст ошибки или null при успехе. */
  run: (action: BankAction) => string | null;
}

const BankContext = createContext<BankContextValue | null>(null);

export function BankProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BankState>(initialState);
  const stateRef = useRef(state); // актуальное состояние для синхронной проверки
  stateRef.current = state;

  const run = useCallback((action: BankAction) => {
    try {
      const next = bankReducer(stateRef.current, action);
      stateRef.current = next;
      setState(next);
      return null;
    } catch (e) {
      if (e instanceof BankError) return e.message;
      throw e;
    }
  }, []);

  return <BankContext.Provider value={{ state, run }}>{children}</BankContext.Provider>;
}

export function useBank(): BankContextValue {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error('useBank нужно вызывать внутри BankProvider');
  return ctx;
}
