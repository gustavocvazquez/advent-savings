import { formatEuro } from '../lib/format.js';
import { CheckIcon, LockIcon } from './Icons.jsx';

/** Texto accesible para cada estado de la puerta. */
function ariaLabel(day, status, amount) {
  switch (status) {
    case 'locked':
      return `Día ${day}, bloqueada. Se abre el ${day} de diciembre.`;
    case 'available':
      return `Día ${day}, disponible hoy. Toca para descubrir cuánto ahorrar.`;
    case 'pending':
      return `Día ${day}, pendiente de marcar. Toca para abrirla.`;
    default:
      return `Día ${day}, abierta y ahorrada: ${formatEuro(amount)}.`;
  }
}

/**
 * Una puerta del calendario.
 * Las bloqueadas usan aria-disabled (no disabled) para poder avisar al tocarlas.
 */
export default function Door({ day, status, amount, onOpen }) {
  return (
    <button
      type="button"
      className={`door door--${status}`}
      aria-label={ariaLabel(day, status, amount)}
      aria-disabled={status === 'locked' ? 'true' : undefined}
      onClick={() => onOpen(day)}
    >
      <span className="door__number" aria-hidden="true">
        {day}
      </span>
      <span className="door__meta" aria-hidden="true">
        {status === 'locked' && <LockIcon />}
        {status === 'available' && '¡Hoy!'}
        {status === 'pending' && 'Pendiente'}
        {status === 'done' && (
          <>
            <CheckIcon size={14} /> {formatEuro(amount)}
          </>
        )}
      </span>
    </button>
  );
}
