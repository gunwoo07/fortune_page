import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseDigit, ddayLabel } from './ui-model.ts';

test('only a single ASCII digit is accepted, including zero', () => {
  for (let digit = 0; digit <= 9; digit++) assert.equal(parseDigit(String(digit)), digit);
  for (const input of ['', ' ', '10', '-1', '1.5', 'a', '８', ' 8', '8 ']) assert.equal(parseDigit(input), null);
});

test('D-day display covers upcoming, exam day and closed states', () => {
  assert.equal(ddayLabel(40), 'D-40');
  assert.equal(ddayLabel(1), 'D-1');
  assert.equal(ddayLabel(0), 'D-day');
  assert.equal(ddayLabel(-1), '운영 종료');
});
