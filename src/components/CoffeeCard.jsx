import { KOFI_USER } from '../config.js';
import { CoffeeIcon } from './Icons.jsx';

/**
 * "Invítame a un café": enlace a la página de Ko-fi. En Ko-fi cada persona elige
 * cuántos cafés quiere regalar. No se muestra si KOFI_USER está vacío.
 */
export default function CoffeeCard() {
  const user = KOFI_USER.trim();
  if (!user) return null;

  const url = `https://ko-fi.com/${encodeURIComponent(user)}`;

  return (
    <section className="card coffee" aria-labelledby="coffee-title">
      <h3 id="coffee-title" className="card__title">
        ¿Te gusta la aplicación? <span aria-hidden="true">☕</span>
      </h3>
      <p>Si te está ayudando a ahorrar, puedes invitarme a un café. ¡Gracias!</p>
      <a className="btn btn--gold btn--coffee" href={url} target="_blank" rel="noopener noreferrer">
        <CoffeeIcon />
        Invítame a un café
      </a>
      <p className="hint">
        Se abre Ko-fi en otra pestaña. Es voluntario y tú eliges el importe.
      </p>
    </section>
  );
}
