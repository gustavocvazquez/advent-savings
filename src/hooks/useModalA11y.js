/**
 * Accesibilidad básica para diálogos modales:
 *  - mueve el foco al abrir y lo devuelve al cerrar
 *  - atrapa el foco con Tab / Shift+Tab
 *  - cierra con Escape
 *  - bloquea el scroll del fondo
 */
import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalA11y(containerRef, onClose) {
  // Guardamos la última versión de onClose sin reiniciar el efecto en cada render.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const container = containerRef.current;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    container?.querySelector(FOCUSABLE)?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !container) return;

      const items = [...container.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [containerRef]);
}
