import { TOTAL_DAYS } from '../lib/calendar.js';
import { dayLabel, formatEuro, plural } from '../lib/format.js';
import CoffeeCard from './CoffeeCard.jsx';
import SettingsPanel from './SettingsPanel.jsx';

/** Pantalla de progreso: barra, totales y lista de días completados. */
export default function ProgressPanel({ state, summary, simDay, onOpenDay, onSimDay, onReset }) {
  const { doneCount, totalSaved, totalPlanned, remaining, pendingCount } = summary;
  const percent = Math.round((doneCount / TOTAL_DAYS) * 100);

  // Días completados en orden, con su importe
  const completedDays = Object.keys(state.completed)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <section aria-labelledby="progress-title">
      <h2 id="progress-title" className="section-title">
        Tu progreso
      </h2>

      <div className="card">
        <p className="progress__text">
          <strong>{doneCount} de {TOTAL_DAYS} días</strong> completados
        </p>
        <div
          className="progress"
          role="progressbar"
          aria-label="Días completados"
          aria-valuemin={0}
          aria-valuemax={TOTAL_DAYS}
          aria-valuenow={doneCount}
          aria-valuetext={`${doneCount} de ${TOTAL_DAYS} días`}
        >
          <div className="progress__fill" style={{ '--pct': `${percent}%` }} />
        </div>
        <p className="hint">{percent}% del calendario</p>
      </div>

      <dl className="stats">
        <div className="stat stat--green">
          <dt>Total ahorrado</dt>
          <dd>{formatEuro(totalSaved)}</dd>
        </div>
        <div className="stat stat--red">
          <dt>Total previsto</dt>
          <dd>{formatEuro(totalPlanned)}</dd>
        </div>
        <div className="stat">
          <dt>Te falta por ahorrar</dt>
          <dd>{formatEuro(remaining)}</dd>
        </div>
        <div className="stat">
          <dt>Días pendientes</dt>
          <dd>{pendingCount}</dd>
        </div>
      </dl>

      <div className="card">
        <h3 className="card__title">Días completados</h3>
        {completedDays.length === 0 ? (
          <p className="hint">Todavía no has marcado ningún día. ¡Abre tu primera casilla!</p>
        ) : (
          <>
            <ul className="done-list">
              {completedDays.map((day) => (
                <li key={day}>
                  <button type="button" className="done-list__item" onClick={() => onOpenDay(day)}>
                    <span>
                      <strong>Día {day}</strong>
                      <span className="done-list__date"> · {dayLabel(day)}</span>
                    </span>
                    <span className="done-list__amount">{formatEuro(state.amounts[day - 1])}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="hint">{plural(completedDays.length, 'día completado', 'días completados')}. Toca uno para verlo o desmarcarlo.</p>
          </>
        )}
      </div>

      <CoffeeCard />

      <SettingsPanel simDay={simDay} onSimDay={onSimDay} onReset={onReset} />
    </section>
  );
}
