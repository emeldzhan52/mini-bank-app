/**
 * Деньги храним в копейках (целые числа), чтобы не было ошибок
 * округления: 0.1 + 0.2 !== 0.3 в JavaScript.
 */

export type Kopecks = number;

/** 123456 -> "1 234,56 ₽" */
export function formatRub(kopecks: Kopecks, withSign = false): string {
  const sign = kopecks < 0 ? '−' : withSign && kopecks > 0 ? '+' : '';
  const abs = Math.abs(kopecks);
  const rub = Math.floor(abs / 100);
  const kop = abs % 100;
  const rubStr = rub.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const kopStr = kop === 0 ? '' : ',' + kop.toString().padStart(2, '0');
  return `${sign}${rubStr}${kopStr} ₽`;
}

/**
 * Разбор суммы, введённой пользователем: "1 500", "1500,5", "99.99".
 * Возвращает копейки или null, если строка некорректна.
 */
export function parseRubInput(input: string): Kopecks | null {
  const cleaned = input.replace(/[\s ₽]/g, '').replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const [rub, kop = ''] = cleaned.split('.');
  const value = Number(rub) * 100 + Number(kop.padEnd(2, '0'));
  return Number.isSafeInteger(value) ? value : null;
}

/** Маска счёта: 40817810000000000001 -> "•• 0001" */
export function maskAccount(account: string): string {
  return `•• ${account.slice(-4)}`;
}
