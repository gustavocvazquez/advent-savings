import { useEffect, useRef, useState } from 'react';
import { useModalA11y } from '../hooks/useModalA11y.js';
import { dayLabel, formatEuro, shortDate } from '../lib/format.js';
import Confetti from './Confetti.jsx';

/**
 * Detalle del día: la puerta se abre con una animación y revela el importe.
 * Permite confirmar ("He ahorrado esta cantidad") y desmarcar si hubo un error.
 *
 * Props:
 *  - status: 'available' | 'pending' | 'done' (la puerta nunca se abre si está bloqueada)
 *  - totalSaved: total ahorrado actual (para el mensaje de celebración)
 */
export default function DayModal({
  day,
  amount,
  status,
  completedAt,
  totalSaved,
  onConfirm,
  onUndo,
  onClose,
}) {
  const sheetRef = useRef(null);
  const [opened, setOpened] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useModalA11y(sheetRef, onClose);

  // La puerta se abre un instante después de aparecer el diálogo.
  useEffect(() => {
    const timer = setTimeout(() => setOpened(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const done = status === 'done';

  function handleConfirm() {
    onConfirm();
    setCelebrating(true);
  }

  function handleUndo() {
    onUndo();
    setCelebrating(false);
  }

  return (
    <div
      className="modal"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-title"
        ref={sheetRef}
      >
        <button type="button" className="modal__close" aria-label="Cerrar" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>

        <h2 id="day-title" className="modal__title">
          Día {day}
        </h2>
        <p className="modal__date">{dayLabel(day)}</p>

        {/* Puerta que se abre y deja ver la cantidad */}
        <div className={`reveal ${opened ? 'reveal--open' : ''}`}>
          <div className="reveal__inside" aria-live="polite">
            {opened && (
              <div>
                <p className="reveal__label">{status === 'available' ? 'Hoy ahorras' : 'Ahorro del día'}</p>
                <p className="reveal__amount">{formatEuro(amount)}</p>
              </div>
            )}
          </div>
          <div className="reveal__door" aria-hidden="true">
            {day}
          </div>
        </div>

        {done ? (
          <div className="modal__done">
            <p className="modal__done-title">✓ Día completado</p>
            <p>
              {celebrating
                ? `¡Enhorabuena! Ya llevas ${formatEuro(totalSaved)} ahorrados.`
                : `Marcado como ahorrado${completedAt ? ` el ${shortDate(completedAt)}` : ''}.`}
            </p>
            <div className="modal__actions">
              <button type="button" className="btn btn--primary" onClick={onClose}>
                Cerrar
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleUndo}>
                Desmarcar este día
              </button>
            </div>
          </div>
        ) : (
          <div className="modal__actions">
            {status === 'pending' && (
              <p className="hint">
                Este día quedó sin marcar. Si ya ahorraste esta cantidad, puedes marcarlo ahora.
              </p>
            )}
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleConfirm}
              disabled={!opened}
            >
              He ahorrado esta cantidad
            </button>
          </div>
        )}
      </div>

      {celebrating && done && <Confetti />}
    </div>
  );
}
