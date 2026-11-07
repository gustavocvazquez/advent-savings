import { useState } from 'react';

/**
 * Pantalla de inicio: el usuario escribe la cantidad máxima diaria.
 * `onCreate(raw)` valida y crea el calendario; devuelve {ok, error?}.
 */
export default function HomeScreen({ onCreate }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const result = onCreate(value);
    if (!result.ok) setError(result.error);
  }

  return (
    <section className="home">
      <p className="home__intro">Cada día abrirás una casilla y descubrirás cuánto ahorrar.</p>

      <form className="card home__form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="max-amount" className="label">
          Cantidad máxima diaria (€)
        </label>
        <input
          id="max-amount"
          className={`input ${error ? 'input--error' : ''}`}
          type="number"
          inputMode="numeric"
          min="24"
          step="1"
          placeholder="Ej.: 24"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'max-hint max-error' : 'max-hint'}
        />
        <p id="max-hint" className="hint">
          Mínimo 24 €: cada uno de los 24 días tiene un importe distinto en euros enteros. Con 24 €
          ahorrarás 300 € en total.
        </p>
        {error && (
          <p id="max-error" className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary">
          Crear mi calendario
        </button>
      </form>

      <ul className="home__rules">
        <li>
          <span aria-hidden="true">🎄</span> 24 casillas, del 1 al 24 de diciembre.
        </li>
        <li>
          <span aria-hidden="true">🎁</span> Ningún día superará tu cantidad máxima.
        </li>
        <li>
          <span aria-hidden="true">❄️</span> Tu calendario se guarda en este dispositivo.
        </li>
      </ul>
    </section>
  );
}
