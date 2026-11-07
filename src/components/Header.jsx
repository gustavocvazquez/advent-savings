import Snow from './Snow.jsx';

/**
 * Cabecera navideña con nieve. `compact` reduce la altura en el calendario;
 * en la pantalla de inicio se muestra más grande como "hero".
 */
export default function Header({ compact = false }) {
  return (
    <header className={`header ${compact ? 'header--compact' : ''}`}>
      <Snow />
      <div className="header__content">
        <p className="header__brand">
          <span aria-hidden="true">🎁</span> Advent Savings
        </p>
        <h1 className="header__title">Calendario de Ahorro de Adviento</h1>
      </div>
    </header>
  );
}
