/**
 * Lógica pura del calendario de adviento (sin React ni DOM).
 * Al ser funciones puras se pueden probar fácilmente con Vitest.
 *
 * Los cálculos de dinero se hacen en CÉNTIMOS (enteros) para evitar errores
 * de coma flotante (0,1 + 0,2 !== 0,3); la app guarda y muestra euros.
 */

export const TOTAL_DAYS = 24;
export const MAX_ALLOWED = 100000;
/** Mínimo posible: 24 importes distintos de al menos 0,01 € => 0,24 €. */
export const MIN_ALLOWED = TOTAL_DAYS / 100;
const DECEMBER = 11; // Los meses de Date empiezan en 0

/**
 * Saltos entre importes, de más "redondo" a menos (en céntimos):
 * 1 €, 0,50 €, 0,25 €, 0,10 €, 0,05 €, 0,01 €.
 * Se usa el más grande que deje al menos 24 valores posibles.
 */
const STEPS_CENTS = [100, 50, 25, 10, 5, 1];

export const toCents = (euros) => Math.round(euros * 100);
export const fromCents = (cents) => cents / 100;

/** ¿Tiene como mucho dos decimales? (tolerante al error de coma flotante) */
const hasCentPrecision = (euros) => Math.abs(euros * 100 - toCents(euros)) < 1e-7;

/** Formato corto para mensajes de error: 0.24 -> "0,24". */
const comma = (n) => String(n).replace('.', ',');

/**
 * Valida la cantidad máxima diaria escrita por el usuario.
 * Acepta coma o punto decimal, con hasta dos decimales (10, 10,5, 8,50).
 * @param {string|number} raw
 * @returns {{ok: true, value: number} | {ok: false, error: string}}
 */
export function validateMaxAmount(raw) {
  const text = String(raw ?? '').trim().replace(',', '.');

  if (text === '') {
    return { ok: false, error: 'Introduce la cantidad máxima diaria.' };
  }
  if (!/^-?\d+(\.\d+)?$/.test(text)) {
    return { ok: false, error: 'Introduce un número válido, solo con cifras.' };
  }

  const value = Number(text);

  if (value <= 0) {
    return { ok: false, error: 'La cantidad debe ser mayor que 0 €.' };
  }
  if (!hasCentPrecision(value)) {
    return { ok: false, error: 'Usa como máximo dos decimales (por ejemplo, 8,50).' };
  }
  if (toCents(value) < TOTAL_DAYS) {
    return {
      ok: false,
      error: `Introduce al menos ${comma(MIN_ALLOWED)} €: hacen falta ${TOTAL_DAYS} importes distintos y el mínimo es de 0,01 € al día.`,
    };
  }
  if (value > MAX_ALLOWED) {
    return {
      ok: false,
      error: `La cantidad máxima permitida es ${MAX_ALLOWED.toLocaleString('es-ES')} €.`,
    };
  }
  return { ok: true, value: fromCents(toCents(value)) };
}

/**
 * Salto (en céntimos) que se usará para una cantidad máxima dada:
 * el mayor de la lista que permita al menos 24 importes distintos.
 */
export function stepCentsFor(maxAmount) {
  const maxCents = toCents(maxAmount);
  return STEPS_CENTS.find((step) => Math.floor(maxCents / step) >= TOTAL_DAYS) ?? 1;
}

/**
 * Genera 24 importes distintos entre 0,01 € y maxAmount (en euros).
 *  - Si el máximo es 24 € o más: euros enteros (con 24 € salen exactamente 1..24).
 *  - Si es menor: se usan céntimos en saltos de 0,50 / 0,25 / 0,10 / 0,05 / 0,01 €
 *    (por ejemplo, con 10 € salen importes como 8,50 o 3,25).
 * Usa un Fisher–Yates "disperso" (con Map) para no construir arrays enormes.
 * @param {number} maxAmount En euros, con hasta 2 decimales y >= 0,24
 * @param {() => number} rng Generador en [0, 1); inyectable para tests
 * @returns {number[]} Array de 24 importes en euros (índice 0 = día 1)
 */
export function generateAmounts(maxAmount, rng = Math.random) {
  const maxCents = toCents(maxAmount);
  if (
    !Number.isFinite(maxAmount) ||
    !hasCentPrecision(maxAmount) ||
    maxCents < TOTAL_DAYS
  ) {
    throw new RangeError(`maxAmount debe ser un importe de al menos ${comma(MIN_ALLOWED)} €.`);
  }

  const step = stepCentsFor(maxAmount);
  const slots = Math.floor(maxCents / step); // importes posibles: step, 2·step, … slots·step

  const moved = new Map(); // posición -> valor intercambiado
  const valueAt = (pos) => (moved.has(pos) ? moved.get(pos) : pos);
  const amounts = [];

  for (let i = 0; i < TOTAL_DAYS; i += 1) {
    const raw = i + Math.floor(rng() * (slots - i));
    const j = Math.min(raw, slots - 1); // protege ante un rng que devuelva 1
    amounts.push(fromCents((valueAt(j) + 1) * step));
    moved.set(j, valueAt(i));
  }
  return amounts;
}

/**
 * Año al que pertenece el calendario que se crea "ahora".
 * Si ya pasó el 24 de diciembre, se prepara el del año siguiente.
 */
export function adventYearFor(now = new Date()) {
  const year = now.getFullYear();
  return now.getMonth() === DECEMBER && now.getDate() > TOTAL_DAYS ? year + 1 : year;
}

/**
 * Día de adviento "actual":
 *  0      -> todavía no es 1 de diciembre
 *  1..24  -> día del calendario
 *  25     -> el calendario ya terminó
 */
export function currentAdventDay(now, year) {
  if (now < new Date(year, DECEMBER, 1)) return 0;
  if (now >= new Date(year, DECEMBER, TOTAL_DAYS + 1)) return TOTAL_DAYS + 1;
  return now.getDate();
}

/** Días naturales que faltan para el 1 de diciembre (0 si ya empezó). */
export function daysUntilStart(now, year) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(year, DECEMBER, 1);
  return Math.max(0, Math.round((start - startOfToday) / 86_400_000));
}

/**
 * Estado de una puerta:
 *  'done'      -> marcada como ahorrada
 *  'available' -> es el día de hoy
 *  'pending'   -> día pasado sin marcar (se puede abrir para ponerse al día)
 *  'locked'    -> día futuro
 */
export function dayStatus(day, today, completed) {
  if (completed[day]) return 'done';
  if (day === today) return 'available';
  if (day < today) return 'pending';
  return 'locked';
}

/** Totales para la pantalla de progreso (sumados en céntimos, devueltos en euros). */
export function summarize(amounts, completed, today) {
  let savedCents = 0;
  let plannedCents = 0;
  let doneCount = 0;
  let pendingCount = 0;

  amounts.forEach((amount, index) => {
    const day = index + 1;
    const cents = toCents(amount);
    plannedCents += cents;
    if (completed[day]) {
      savedCents += cents;
      doneCount += 1;
    } else if (day < today) {
      pendingCount += 1;
    }
  });

  return {
    totalPlanned: fromCents(plannedCents),
    totalSaved: fromCents(savedCents),
    doneCount,
    pendingCount,
    remaining: fromCents(plannedCents - savedCents),
  };
}
