import { useState } from 'react';
import { TOTAL_DAYS } from '../lib/calendar.js';
import { dayLabel } from '../lib/format.js';

/**
 * Ajustes: modo prueba (simular fecha) y crear un calendario nuevo.
 * El borrado pide confirmación inline (sin window.confirm, que es poco accesible en móvil).
 */
export default function SettingsPanel({ simDay, onSimDay, onReset }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="card settings" aria-labelledby="settings-title">
      <h3 id="settings-title" className="card__title">
        Ajustes
      </h3>

      <label htmlFor="sim-day" className="label">
        Modo prueba: simular fecha
      </label>
      <select
        id="sim-day"
        className="input"
        value={simDay ?? ''}
        onChange={(e) => onSimDay(e.target.value === '' ? null : Number(e.target.value))}
      >
        <option value="">Fecha real</option>
        {Array.from({ length: TOTAL_DAYS }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {dayLabel(i + 1)}
          </option>
        ))}
      </select>
      <p className="hint">Útil para probar la app antes de diciembre.</p>

      {confirming ? (
        <div className="settings__confirm" role="alertdialog" aria-label="Confirmar borrado">
          <p className="error">Se borrará tu calendario y todo tu progreso. ¿Seguro?</p>
          <div className="settings__buttons">
            <button type="button" className="btn btn--danger" onClick={onReset}>
              Sí, borrar todo
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn--ghost" onClick={() => setConfirming(true)}>
          Crear un calendario nuevo
        </button>
      )}
    </section>
  );
}
