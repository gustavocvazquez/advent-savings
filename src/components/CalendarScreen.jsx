import { TOTAL_DAYS, dayStatus, daysUntilStart } from '../lib/calendar.js';
import { formatEuro, plural } from '../lib/format.js';
import Door from './Door.jsx';

/** Mensaje de situación según la fecha (antes, durante o después de diciembre). */
function statusMessage({ today, now, state, summary }) {
  if (today === 0) {
    const days = daysUntilStart(now, state.year);
    return `Tu calendario empieza el 1 de diciembre. Faltan ${plural(days, 'día', 'días')}.`;
  }
  if (today > TOTAL_DAYS) {
    return summary.pendingCount > 0
      ? `El calendario ha terminado. Te quedan ${plural(summary.pendingCount, 'día pendiente', 'días pendientes')} por marcar.`
      : '¡El calendario ha terminado! Mira tu progreso en la otra pestaña.';
  }
  return state.completed[today]
    ? `Hoy es ${today} de diciembre y ya lo has ahorrado. ¡Hasta mañana!`
    : `Hoy es ${today} de diciembre. Toca la casilla de hoy para descubrir tu ahorro.`;
}

/** Cuadrícula de 24 puertas + resumen inicial + leyenda. */
export default function CalendarScreen({
  state,
  today,
  now,
  summary,
  justCreated,
  onDismissWelcome,
  onDoorClick,
}) {
  return (
    <section aria-labelledby="calendar-title">
      <h2 id="calendar-title" className="section-title">
        Tu calendario
      </h2>

      {justCreated && (
        <div className="card welcome" role="status">
          <p className="welcome__title">¡Tu calendario está listo! 🎄</p>
          <p>
            Total previsto al final: <strong>{formatEuro(summary.totalPlanned)}</strong>. Ningún día
            supera los {formatEuro(state.maxAmount)}.
          </p>
          <button type="button" className="btn btn--green btn--small" onClick={onDismissWelcome}>
            Entendido
          </button>
        </div>
      )}

      <p className="status-line">{statusMessage({ today, now, state, summary })}</p>

      <ol className="doors">
        {state.amounts.map((amount, index) => {
          const day = index + 1;
          return (
            <li key={day}>
              <Door
                day={day}
                amount={amount}
                status={dayStatus(day, today, state.completed)}
                onOpen={onDoorClick}
              />
            </li>
          );
        })}
      </ol>

      <ul className="legend" aria-label="Leyenda">
        <li>
          <span className="legend__dot legend__dot--locked" aria-hidden="true" /> Bloqueada
        </li>
        <li>
          <span className="legend__dot legend__dot--available" aria-hidden="true" /> Hoy
        </li>
        <li>
          <span className="legend__dot legend__dot--done" aria-hidden="true" /> Abierta
        </li>
        <li>
          <span className="legend__dot legend__dot--pending" aria-hidden="true" /> Pendiente
        </li>
      </ul>
    </section>
  );
}
