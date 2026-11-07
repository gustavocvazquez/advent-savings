import { useMemo } from 'react';

const COLORS = ['#b3202f', '#1f6f4a', '#d9a93f', '#ffffff', '#f3d98b'];

/** Lluvia de confeti navideño para celebrar un día completado (solo CSS). */
export default function Confetti({ count = 44 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.2,
        color: COLORS[i % COLORS.length],
        rotation: Math.random() * 360,
      })),
    [count],
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti__piece"
          style={{
            '--x': `${p.x}%`,
            '--delay': `${p.delay}s`,
            '--d': `${p.duration}s`,
            '--c': p.color,
            '--r': `${p.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
}
