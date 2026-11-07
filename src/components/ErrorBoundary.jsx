import { Component } from 'react';
import { clearState } from '../lib/storage.js';

/**
 * Red de seguridad: si algo falla al renderizar, se muestra un mensaje claro
 * en español con opción de recargar o de borrar los datos guardados.
 */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('Advent Savings: error inesperado', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="fatal">
        <h1>Vaya, algo ha salido mal 🎅</h1>
        <p>La app ha tenido un problema inesperado. Prueba a recargarla.</p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Recargar
        </button>
        <p className="hint">Si el problema continúa, puedes borrar los datos guardados y empezar de cero.</p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            clearState();
            window.location.reload();
          }}
        >
          Borrar datos y empezar de nuevo
        </button>
      </main>
    );
  }
}
