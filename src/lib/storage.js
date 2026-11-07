/**
 * Persistencia local (localStorage). Todo va protegido con try/catch porque
 * localStorage puede lanzar excepciones (modo privado, cuota, datos bloqueados).
 */
import { TOTAL_DAYS } from './calendar.js';

const STATE_KEY = 'advent-savings:v1';
const SIM_KEY = 'advent-savings:sim-day';

/** Comprueba que un objeto guardado tiene la forma esperada (datos corruptos -> false). */
export function isValidState(s) {
  if (!s || typeof s !== 'object') return false;
  if (!Number.isInteger(s.year) || !Number.isInteger(s.maxAmount)) return false;

  const a = s.amounts;
  if (!Array.isArray(a) || a.length !== TOTAL_DAYS) return false;
  if (!a.every((v) => Number.isInteger(v) && v >= 1 && v <= s.maxAmount)) return false;
  if (new Set(a).size !== a.length) return false;

  if (!s.completed || typeof s.completed !== 'object' || Array.isArray(s.completed)) return false;
  return Object.keys(s.completed).every((key) => {
    const day = Number(key);
    return Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS;
  });
}

/** Carga el calendario guardado, o null si no existe o no es válido. */
export function loadState() {
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Guarda el estado. Devuelve false si no se pudo (para avisar al usuario). */
export function saveState(state) {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Borra todos los datos de la app. */
export function clearState() {
  try {
    window.localStorage.removeItem(STATE_KEY);
    window.localStorage.removeItem(SIM_KEY);
  } catch {
    /* nada que hacer */
  }
}

/** Día simulado del "modo prueba" (null = fecha real). */
export function loadSimDay() {
  try {
    const raw = window.localStorage.getItem(SIM_KEY);
    const n = Number(raw);
    return raw !== null && Number.isInteger(n) && n >= 1 && n <= TOTAL_DAYS ? n : null;
  } catch {
    return null;
  }
}

export function saveSimDay(day) {
  try {
    if (day === null) window.localStorage.removeItem(SIM_KEY);
    else window.localStorage.setItem(SIM_KEY, String(day));
  } catch {
    /* el modo prueba es opcional */
  }
}
