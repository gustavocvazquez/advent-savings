import { describe, expect, it } from 'vitest';
import {
  TOTAL_DAYS,
  adventYearFor,
  currentAdventDay,
  dayStatus,
  daysUntilStart,
  generateAmounts,
  summarize,
  validateMaxAmount,
} from './calendar.js';
import { isValidState } from './storage.js';

// Generador pseudoaleatorio con semilla para tests reproducibles
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('validateMaxAmount', () => {
  it('exige un valor', () => {
    expect(validateMaxAmount('').ok).toBe(false);
    expect(validateMaxAmount('   ').ok).toBe(false);
    expect(validateMaxAmount(undefined).ok).toBe(false);
  });
  it('rechaza texto, cero y negativos', () => {
    expect(validateMaxAmount('abc').ok).toBe(false);
    expect(validateMaxAmount('0').error).toMatch(/mayor que 0/);
    expect(validateMaxAmount('-5').error).toMatch(/mayor que 0/);
  });
  it('rechaza decimales y menos de 24 €', () => {
    expect(validateMaxAmount('30,5').ok).toBe(false);
    expect(validateMaxAmount('23').error).toMatch(/al menos 24/);
  });
  it('acepta 24 o más', () => {
    expect(validateMaxAmount('24')).toEqual({ ok: true, value: 24 });
    expect(validateMaxAmount(' 100 ')).toEqual({ ok: true, value: 100 });
    expect(validateMaxAmount('50.0')).toEqual({ ok: true, value: 50 });
  });
  it('rechaza cantidades desorbitadas', () => {
    expect(validateMaxAmount('1000000').ok).toBe(false);
  });
});

describe('generateAmounts', () => {
  it('con 24 € usa exactamente 1..24 mezclados', () => {
    const amounts = generateAmounts(24, mulberry32(1));
    expect([...amounts].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 24 }, (_, i) => i + 1),
    );
    expect(amounts).not.toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
  });

  it.each([25, 30, 50, 100, 1000, 100000])(
    'con %i € genera 24 valores únicos entre 1 y el máximo',
    (max) => {
      for (let seed = 1; seed <= 50; seed += 1) {
        const amounts = generateAmounts(max, mulberry32(seed));
        expect(amounts).toHaveLength(TOTAL_DAYS);
        expect(new Set(amounts).size).toBe(TOTAL_DAYS);
        expect(Math.min(...amounts)).toBeGreaterThanOrEqual(1);
        expect(Math.max(...amounts)).toBeLessThanOrEqual(max);
        expect(amounts.every(Number.isInteger)).toBe(true);
      }
    },
  );

  it('soporta un rng que devuelva valores extremos', () => {
    expect(new Set(generateAmounts(30, () => 0)).size).toBe(24);
    expect(new Set(generateAmounts(30, () => 0.9999999)).size).toBe(24);
    expect(new Set(generateAmounts(30, () => 1)).size).toBe(24);
  });

  it('lanza error con máximos inválidos', () => {
    expect(() => generateAmounts(23)).toThrow(RangeError);
    expect(() => generateAmounts(30.5)).toThrow(RangeError);
  });
});

describe('fechas del calendario', () => {
  const year = 2026;

  it('calcula el año del calendario', () => {
    expect(adventYearFor(new Date(2026, 10, 3))).toBe(2026);
    expect(adventYearFor(new Date(2026, 11, 10))).toBe(2026);
    expect(adventYearFor(new Date(2026, 11, 28))).toBe(2027);
  });

  it('calcula el día actual', () => {
    expect(currentAdventDay(new Date(2026, 10, 30, 23, 59), year)).toBe(0);
    expect(currentAdventDay(new Date(2026, 11, 1, 0, 0), year)).toBe(1);
    expect(currentAdventDay(new Date(2026, 11, 15, 12), year)).toBe(15);
    expect(currentAdventDay(new Date(2026, 11, 24, 23, 59), year)).toBe(24);
    expect(currentAdventDay(new Date(2026, 11, 25, 0, 0), year)).toBe(25);
    expect(currentAdventDay(new Date(2027, 0, 3), year)).toBe(25);
  });

  it('cuenta los días hasta el 1 de diciembre', () => {
    expect(daysUntilStart(new Date(2026, 10, 3, 20, 49), year)).toBe(28);
    expect(daysUntilStart(new Date(2026, 10, 30, 23, 0), year)).toBe(1);
    expect(daysUntilStart(new Date(2026, 11, 5), year)).toBe(0);
  });
});

describe('dayStatus y summarize', () => {
  const completed = { 1: 'x', 2: 'x' };

  it('clasifica las puertas', () => {
    expect(dayStatus(1, 4, completed)).toBe('done');
    expect(dayStatus(3, 4, completed)).toBe('pending');
    expect(dayStatus(4, 4, completed)).toBe('available');
    expect(dayStatus(5, 4, completed)).toBe('locked');
    expect(dayStatus(1, 0, {})).toBe('locked');
  });

  it('suma los totales', () => {
    const amounts = Array.from({ length: 24 }, (_, i) => i + 1);
    expect(summarize(amounts, completed, 4)).toEqual({
      totalPlanned: 300,
      totalSaved: 3,
      doneCount: 2,
      pendingCount: 1,
      remaining: 297,
    });
  });
});

describe('isValidState', () => {
  const valid = () => ({
    year: 2026,
    maxAmount: 30,
    amounts: generateAmounts(30, mulberry32(7)),
    completed: { 3: '2026-12-03T10:00:00.000Z' },
  });

  it('acepta un estado correcto', () => {
    expect(isValidState(valid())).toBe(true);
  });
  it('rechaza estados corruptos', () => {
    expect(isValidState(null)).toBe(false);
    expect(isValidState({ ...valid(), amounts: [1, 2, 3] })).toBe(false);
    expect(isValidState({ ...valid(), amounts: Array(24).fill(5) })).toBe(false);
    expect(isValidState({ ...valid(), maxAmount: 10 })).toBe(false);
    expect(isValidState({ ...valid(), completed: { 99: 'x' } })).toBe(false);
    expect(isValidState({ ...valid(), completed: [] })).toBe(false);
  });
});
