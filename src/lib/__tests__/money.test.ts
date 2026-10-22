import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatRub, maskAccount, parseRubInput } from '../money';

const nbsp = ' ';

test('formatRub: целые рубли без копеек', () => {
  assert.equal(formatRub(150_000), `1${nbsp}500${nbsp}₽`);
});

test('formatRub: копейки и знак', () => {
  assert.equal(formatRub(123_456), `1${nbsp}234,56${nbsp}₽`);
  assert.equal(formatRub(-505), `−5,05${nbsp}₽`);
  assert.equal(formatRub(100, true), `+1${nbsp}₽`);
  assert.equal(formatRub(0), `0${nbsp}₽`);
});

test('parseRubInput: разные форматы ввода', () => {
  assert.equal(parseRubInput('1500'), 150_000);
  assert.equal(parseRubInput('1 500'), 150_000);
  assert.equal(parseRubInput('99,9'), 9_990);
  assert.equal(parseRubInput('99.99 ₽'), 9_999);
});

test('parseRubInput: мусор -> null', () => {
  for (const bad of ['', 'abc', '1.234', '-5', '1,2,3']) {
    assert.equal(parseRubInput(bad), null, bad);
  }
});

test('maskAccount', () => {
  assert.equal(maskAccount('40817810000000000001'), '•• 0001');
});
