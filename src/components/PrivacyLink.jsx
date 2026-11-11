/**
 * Enlace a la política de privacidad (página estática en public/privacidad.html).
 * Ruta relativa para que funcione en cualquier subruta de despliegue.
 */
export default function PrivacyLink() {
  return (
    <p className="privacy-link">
      <a href="./privacidad.html" target="_blank" rel="noopener noreferrer">
        Política de privacidad
      </a>
    </p>
  );
}
