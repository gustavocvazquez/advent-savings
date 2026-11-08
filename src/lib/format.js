/** Utilidades de formato en español. */

const euroWhole = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const euroCents = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 12 -> "12 €"; 8.5 -> "8,50 €" (solo muestra céntimos si los hay). */
export function formatEuro(amount) {
  const cents = Math.round(amount * 100);
  return (cents % 100 === 0 ? euroWhole : euroCents).format(cents / 100);
}

/** 5 -> "5 de diciembre" */
export const dayLabel = (day) => `${day} de diciembre`;

/** plural(2, 'día', 'días') -> "2 días" */
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** Fecha ISO -> "3 dic" (para mostrar cuándo se marcó un día). */
export function shortDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
