/** Utilidades de formato en español. */

const euroFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/** 12 -> "12 €" */
export const formatEuro = (amount) => euroFormatter.format(amount);

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
