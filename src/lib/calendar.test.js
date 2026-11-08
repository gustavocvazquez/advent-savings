import { describe, expect, it } from 'vitest';
import {
  TOTAL_DAYS,
  adventYearFor,
  currentAdventDay,
  dayStatus,
  daysUntilStart,
  generateAmounts,
  stepCentsFor,
  summarize,
  toCents,
  validateMaxAmount,
} from './calendar.js';
import { formatEuro } from './format.js';
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
  it('acepta cantidades menores de 24 € y con céntimos', () => {
    expect(validateMaxAmount('10')).toEqual({ ok: true, value: 10 });
    expect(validateMaxAmount('8,50')).toEqual({ ok: true, value: 8.5 });
    expect(validateMaxAmount('8.5')).toEqual({ ok: true, value: 8.5 });
    expect(validateMaxAmount('30,5')).toEqual({ ok: true, value: 30.5 });
    expect(validateMaxAmount('0,24')).toEqual({ ok: true, value: 0.24 });
    expect(validateMaxAmount(' 100 ')).toEqual({ ok: true, value: 100 });
  });
  it('rechaza más de dos decimales', () => {
    expect(validateMaxAmount('10,555').error).toMatch(/dos decimales/);
  });
  it('rechaza lo que no permite 24 importes distintos', () => {
    expect(validateMaxAmount('0,23').error).toMatch(/al menos 0,24/);
    expect(validateMaxAmount('0,01').ok).toBe(false);
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

  it.each([25, 30, 24.5, 50, 100, 1000, 100000])(
    'con %s € genera 24 euros enteros únicos entre 1 y el máximo',
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

  it.each([0.24, 0.5, 1, 2.5, 5, 10, 11.99, 12, 23.5, 23.99])(
    'con %s € (menos de 24 €) genera 24 importes únicos con céntimos, sin pasarse',
    (max) => {
      for (let seed = 1; seed <= 50; seed += 1) {
        const amounts = generateAmounts(max, mulberry32(seed));
        expect(amounts).toHaveLength(TOTAL_DAYS);
        expect(new Set(amounts.map(toCents)).size).toBe(TOTAL_DAYS);
        expect(Math.min(...amounts)).toBeGreaterThan(0);
        expect(Math.max(...amounts)).toBeLessThanOrEqual(max);
        // Cada importe tiene como mucho dos decimales
        expect(amounts.every((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-9)).toBe(true);
      }
    },
  );

  it('elige saltos "redondos" cuando es posible', () => {
    expect(stepCentsFor(24)).toBe(100);
    expect(stepCentsFor(12)).toBe(50);
    expect(stepCentsFor(10)).toBe(25); // 10 € => múltiplos de 0,25 €
    expect(stepCentsFor(2.4)).toBe(10);
    expect(stepCentsFor(0.24)).toBe(1);
    expect(generateAmounts(10, mulberry32(3)).every((v) => (v * 100) % 25 === 0)).toBe(true);
  });

  it('con 0,24 € usa exactamente 0,01 … 0,24', () => {
    const sorted = [...generateAmounts(0.24, mulberry32(9))].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 24 }, (_, i) => (i + 1) / 100));
  });

  it('soporta un rng que devuelva valores extremos', () => {
    for (const max of [30, 10, 0.24]) {
      expect(new Set(generateAmounts(max, () => 0)).size).toBe(24);
      expect(new Set(generateAmounts(max, () => 0.9999999)).size).toBe(24);
      expect(new Set(generateAmounts(max, () => 1)).size).toBe(24);
    }
  });

  it('lanza error con máximos inválidos', () => {
    expect(() => generateAmounts(0.23)).toThrow(RangeError);
    expect(() => generateAmounts(10.555)).toThrow(RangeError);
    expect(() => generateAmounts(NaN)).toThrow(RangeError);
  });
});

describe('formatEuro', () => {
  const norm = (s) => s.replace(/\s/g, ' ');
  it('muestra céntimos solo cuando los hay', () => {
    expect(norm(formatEuro(12))).toBe('12 €');
    expect(norm(formatEuro(8.5))).toBe('8,50 €');
    expect(norm(formatEuro(0.24))).toBe('0,24 €');
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

  it('suma con céntimos sin errores de coma flotante', () => {
    const amounts = generateAmounts(10, mulberry32(5));
    amounts[0] = 0.1;
    amounts[1] = 0.2;
    const s = summarize(amounts, { 1: 'x', 2: 'x' }, 3);
    expect(s.totalSaved).toBe(0.3); // 0,1 + 0,2 exactamente
    expect(Math.round(s.totalPlanned * 100)).toBe(amounts.reduce((t, v) => t + toCents(v), 0));
  });
});

describe('isValidState', () => {
  const valid = (max = 30) => ({
    year: 2026,
    maxAmount: max,
    amounts: generateAmounts(max, mulberry32(7)),
    completed: { 3: '2026-12-03T10:00:00.000Z' },
  });

  it('acepta un estado correcto, también con céntimos', () => {
    expect(isValidState(valid())).toBe(true);
    expect(isValidState(valid(10))).toBe(true);
    expect(isValidState(valid(8.5))).toBe(true);
  });
  it('rechaza estados corruptos', () => {
    expect(isValidState(null)).toBe(false);
    expect(isValidState({ ...valid(), amounts: [1, 2, 3] })).toBe(false);
    expect(isValidState({ ...valid(), amounts: Array(24).fill(5) })).toBe(false);
    expect(isValidState({ ...valid(), maxAmount: 10 })).toBe(false);
    expect(isValidState({ ...valid(), maxAmount: 'x' })).toBe(false);
    expect(isValidState({ ...valid(10), amounts: Array.from({ length: 24 }, (_, i) => (i + 1) / 7) })).toBe(false);
    expect(isValidState({ ...valid(), completed: { 99: 'x' } })).toBe(false);
    expect(isValidState({ ...valid(), completed: [] })).toBe(false);
  });
});
