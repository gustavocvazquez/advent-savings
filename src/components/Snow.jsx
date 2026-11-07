import { useMemo } from 'react';

/**
 * Copos de nieve decorativos hechos solo con CSS.
 * Se generan una vez (useMemo) y se ocultan con prefers-reduced-motion.
 */
export default function Snow({ count = 18 }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 3 + Math.random() * 5,
        duration: 6 + Math.random() * 6,
        delay: -Math.random() * 10,
        drift: -20 + Math.random() * 40,
      })),
    [count],
  );

  return (
    <div className="snow" aria-hidden="true">
      {flakes.map((f) => (
        <span
          key={f.id}
          className="snow__flake"
          style={{
            '--x': `${f.x}%`,
            '--s': `${f.size}px`,
            '--d': `${f.duration}s`,
            '--delay': `${f.delay}s`,
            '--drift': `${f.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
