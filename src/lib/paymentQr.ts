/**
 * Платёжный QR-код по ГОСТ Р 56042-2014.
 *
 * Формат: служебный заголовок "ST00012" (ST0001 + кодировка 2 = UTF-8),
 * затем пары Ключ=Значение через "|":
 *
 *   ST00012|Name=Иван Иванов|PersonalAcc=40817810000000000001|BankName=Мини Банк|
 *   BIC=044525000|CorrespAcc=30101810400000000225|Sum=150000|Purpose=Перевод
 *
 * Sum — в копейках. Такие коды распознаёт мой проект qr-scanner-opencv.
 */

import type { Kopecks } from './money';

export interface PaymentRequisites {
  name: string;
  personalAcc: string; // расчётный счёт, 20 цифр
  bankName: string;
  bic: string; // БИК, 9 цифр
  correspAcc: string; // корреспондентский счёт, 20 цифр
  sum?: Kopecks;
  purpose?: string;
}

export class PaymentQrError extends Error {}

const HEADER = 'ST00012';

/** Символ "|" — разделитель полей, внутри значений его быть не должно. */
function clean(value: string): string {
  return value.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
}

export function validateRequisites(r: PaymentRequisites): string[] {
  const errors: string[] = [];
  if (!clean(r.name)) errors.push('Не указан получатель');
  if (!/^\d{20}$/.test(r.personalAcc)) errors.push('Счёт должен состоять из 20 цифр');
  if (!/^\d{9}$/.test(r.bic)) errors.push('БИК должен состоять из 9 цифр');
  if (!/^\d{20}$/.test(r.correspAcc)) errors.push('Корр. счёт должен состоять из 20 цифр');
  if (r.sum !== undefined && (!Number.isInteger(r.sum) || r.sum <= 0)) {
    errors.push('Сумма должна быть положительной');
  }
  return errors;
}

export function buildPaymentQr(r: PaymentRequisites): string {
  const errors = validateRequisites(r);
  if (errors.length) throw new PaymentQrError(errors.join('; '));

  const fields: [string, string][] = [
    ['Name', clean(r.name)],
    ['PersonalAcc', r.personalAcc],
    ['BankName', clean(r.bankName)],
    ['BIC', r.bic],
    ['CorrespAcc', r.correspAcc],
  ];
  if (r.sum !== undefined) fields.push(['Sum', String(r.sum)]);
  if (r.purpose && clean(r.purpose)) fields.push(['Purpose', clean(r.purpose)]);

  return [HEADER, ...fields.map(([k, v]) => `${k}=${v}`)].join('|');
}

export function parsePaymentQr(text: string): PaymentRequisites | null {
  if (!text.startsWith('ST0001')) return null;
  const map = new Map<string, string>();
  for (const part of text.split('|').slice(1)) {
    const eq = part.indexOf('=');
    if (eq > 0) map.set(part.slice(0, eq), part.slice(eq + 1));
  }
  const get = (k: string) => map.get(k);
  const name = get('Name');
  const personalAcc = get('PersonalAcc');
  const bankName = get('BankName');
  const bic = get('BIC');
  const correspAcc = get('CorrespAcc');
  if (!name || !personalAcc || !bankName || !bic || !correspAcc) return null;

  const sumStr = get('Sum');
  const sum = sumStr !== undefined && /^\d+$/.test(sumStr) ? Number(sumStr) : undefined;
  return { name, personalAcc, bankName, bic, correspAcc, sum, purpose: get('Purpose') };
}
