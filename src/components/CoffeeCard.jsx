import { COFFEE_PRICE, PAYPAL_USER } from '../config.js';
import { formatEuro } from '../lib/format.js';

/**
 * "Invítame a un café": enlace a PayPal.Me con el importe de un café ya rellenado
 * (el usuario puede cambiarlo en PayPal). No se muestra si PAYPAL_USER está vacío.
 */
export default function CoffeeCard() {
  const user = PAYPAL_USER.trim();
  if (!user) return null;

  const url = `https://www.paypal.me/${encodeURIComponent(user)}/${COFFEE_PRICE}EUR`;

  return (
    <section className="card coffee" aria-labelledby="coffee-title">
      <h3 id="coffee-title" className="card__title">
        ¿Te gusta la aplicación? <span aria-hidden="true">☕</span>
      </h3>
      <p>Si te está ayudando a ahorrar, puedes invitarme a un café. ¡Gracias!</p>
      <a className="btn btn--gold" href={url} target="_blank" rel="noopener noreferrer">
        Invítame a un café ({formatEuro(COFFEE_PRICE)})
      </a>
      <p className="hint">Se abre PayPal en otra pestaña. Es voluntario y puedes cambiar el importe.</p>
    </section>
  );
}
