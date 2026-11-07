/**
 * Hook que concentra TODO el estado de la app y sus acciones.
 * Los componentes solo reciben datos y callbacks.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  adventYearFor,
  currentAdventDay,
  dayStatus,
  generateAmounts,
  summarize,
  validateMaxAmount,
} from '../lib/calendar.js';
import { clearState, loadSimDay, loadState, saveSimDay, saveState } from '../lib/storage.js';

export function useAdvent() {
  const [state, setState] = useState(loadState);
  const [now, setNow] = useState(() => new Date());
  const [simDay, setSimDayState] = useState(loadSimDay);
  const [storageError, setStorageError] = useState(false);

  // Refresca "la hora" cada minuto y al volver a la app, para que la puerta
  // de hoy cambie sola al pasar la medianoche.
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const id = setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  // Persiste cada cambio; si falla, se avisa al usuario.
  useEffect(() => {
    if (!state) return;
    setStorageError(!saveState(state));
  }, [state]);

  // Día "de hoy" del calendario (real o simulado en modo prueba).
  const today = state ? (simDay ?? currentAdventDay(now, state.year)) : 0;

  const summary = useMemo(
    () => (state ? summarize(state.amounts, state.completed, today) : null),
    [state, today],
  );

  /** Valida y crea un calendario nuevo con importes aleatorios. */
  const createCalendar = useCallback((rawMax) => {
    const check = validateMaxAmount(rawMax);
    if (!check.ok) return check;
    try {
      setState({
        version: 1,
        year: adventYearFor(new Date()),
        maxAmount: check.value,
        amounts: generateAmounts(check.value),
        completed: {},
        createdAt: new Date().toISOString(),
      });
      return { ok: true, value: check.value };
    } catch {
      return { ok: false, error: 'No se pudo crear el calendario. Inténtalo de nuevo.' };
    }
  }, []);

  /** Marca o desmarca un día. Devuelve false si el día está bloqueado. */
  const toggleDay = useCallback(
    (day) => {
      if (!state || dayStatus(day, today, state.completed) === 'locked') return false;
      setState((prev) => {
        const completed = { ...prev.completed };
        if (completed[day]) delete completed[day];
        else completed[day] = new Date().toISOString();
        return { ...prev, completed };
      });
      return true;
    },
    [state, today],
  );

  /** Borra todo y vuelve a la pantalla de inicio. */
  const reset = useCallback(() => {
    clearState();
    setState(null);
    setSimDayState(null);
    setStorageError(false);
  }, []);

  /** Modo prueba: simula que hoy es el día N de diciembre (null = fecha real). */
  const setSimDay = useCallback((day) => {
    setSimDayState(day);
    saveSimDay(day);
  }, []);

  return {
    state,
    now,
    today,
    simDay,
    summary,
    storageError,
    createCalendar,
    toggleDay,
    reset,
    setSimDay,
  };
}
