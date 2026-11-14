import { KOFI_USER } from '../config.js';
import { CoffeeIcon } from './Icons.jsx';

/**
 * "Invítame a un café": botón que abre la página de Ko-fi, donde cada persona
 * elige cuántos cafés regalar. No se muestra si KOFI_USER está vacío.
 */
export default function CoffeeCard() {
  const user = KOFI_USER.trim();
  if (!user) return null;

  const url = `https://ko-fi.com/${encodeURIComponent(user)}`;

  return (
    <section className="card coffee" aria-label="Apoyar la app">
      <a className="btn btn--gold btn--coffee" href={url} target="_blank" rel="noopener noreferrer">
        <CoffeeIcon />
        Invítame a un café
      </a>
    </section>
  );
}
