/**
 * Lógica pura del calendario de adviento (sin React ni DOM).
 * Al ser funciones puras se pueden probar fácilmente con Vitest.
 */

export const TOTAL_DAYS = 24;
export const MAX_ALLOWED = 100000;
const DECEMBER = 11; // Los meses de Date empiezan en 0

/**
 * Valida la cantidad máxima diaria escrita por el usuario.
 * Acepta coma o punto decimal en la entrada, pero exige euros enteros.
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
  if (!Number.isInteger(value)) {
    return { ok: false, error: 'Usa euros enteros, sin céntimos (por ejemplo, 30).' };
  }
  if (value < TOTAL_DAYS) {
    return {
      ok: false,
      error: `Introduce al menos ${TOTAL_DAYS} €: hacen falta ${TOTAL_DAYS} importes distintos en euros enteros, uno por día.`,
    };
  }
  if (value > MAX_ALLOWED) {
    return {
      ok: false,
      error: `La cantidad máxima permitida es ${MAX_ALLOWED.toLocaleString('es-ES')} €.`,
    };
  }
  return { ok: true, value };
}

/**
 * Genera 24 importes enteros, distintos entre sí, entre 1 y maxAmount.
 * Usa un Fisher–Yates "disperso" (con Map) para no construir un array
 * enorme cuando maxAmount es grande.
 * Con maxAmount = 24 devuelve exactamente 1..24 mezclados.
 * @param {number} maxAmount Entero >= 24
 * @param {() => number} rng Generador en [0, 1); inyectable para tests
 * @returns {number[]} Array de 24 importes (índice 0 = día 1)
 */
export function generateAmounts(maxAmount, rng = Math.random) {
  if (!Number.isInteger(maxAmount) || maxAmount < TOTAL_DAYS) {
    throw new RangeError(`maxAmount debe ser un entero de al menos ${TOTAL_DAYS}.`);
  }

  const moved = new Map(); // posición -> valor intercambiado
  const valueAt = (pos) => (moved.has(pos) ? moved.get(pos) : pos);
  const amounts = [];

  for (let i = 0; i < TOTAL_DAYS; i += 1) {
    const raw = i + Math.floor(rng() * (maxAmount - i));
    const j = Math.min(raw, maxAmount - 1); // protege ante un rng que devuelva 1
    amounts.push(valueAt(j) + 1); // los importes empiezan en 1 €
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

/** Totales para la pantalla de progreso. */
export function summarize(amounts, completed, today) {
  let totalSaved = 0;
  let doneCount = 0;
  let pendingCount = 0;

  amounts.forEach((amount, index) => {
    const day = index + 1;
    if (completed[day]) {
      totalSaved += amount;
      doneCount += 1;
    } else if (day < today) {
      pendingCount += 1;
    }
  });

  const totalPlanned = amounts.reduce((sum, value) => sum + value, 0);
  return {
    totalPlanned,
    totalSaved,
    doneCount,
    pendingCount,
    remaining: totalPlanned - totalSaved,
  };
}
