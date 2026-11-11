import { useEffect, useState } from 'react';
import CalendarScreen from './components/CalendarScreen.jsx';
import DayModal from './components/DayModal.jsx';
import Header from './components/Header.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import PrivacyLink from './components/PrivacyLink.jsx';
import { CalendarIcon, ChartIcon } from './components/Icons.jsx';
import ProgressPanel from './components/ProgressPanel.jsx';
import { useAdvent } from './hooks/useAdvent.js';
import { dayStatus } from './lib/calendar.js';
import { dayLabel } from './lib/format.js';

/**
 * Componente raíz: decide qué pantalla mostrar y coordina el diálogo del día.
 *   sin calendario -> HomeScreen
 *   con calendario -> pestañas "Calendario" y "Progreso" (+ DayModal encima)
 */
export default function App() {
  const advent = useAdvent();
  const { state, today, now, summary, simDay } = advent;

  const [tab, setTab] = useState('calendar');
  const [openDay, setOpenDay] = useState(null);
  const [justCreated, setJustCreated] = useState(false);
  const [toast, setToast] = useState('');

  // El aviso (toast) desaparece solo a los 3 segundos.
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleCreate(rawMax) {
    const result = advent.createCalendar(rawMax);
    if (result.ok) {
      setTab('calendar');
      setJustCreated(true);
    }
    return result;
  }

  function handleDoorClick(day) {
    if (dayStatus(day, today, state.completed) === 'locked') {
      setToast(`La casilla ${day} se abrirá el ${dayLabel(day)}.`);
      return;
    }
    setOpenDay(day);
  }

  function handleReset() {
    advent.reset();
    setOpenDay(null);
    setTab('calendar');
    setJustCreated(false);
  }

  // ---- Sin calendario: pantalla de inicio ----
  if (!state) {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <HomeScreen onCreate={handleCreate} />
          <PrivacyLink />
        </main>
      </div>
    );
  }

  // ---- Con calendario ----
  return (
    <div className="app">
      <Header compact />

      {advent.storageError && (
        <div className="notice notice--error" role="alert">
          No se pudo guardar tu progreso en este dispositivo (¿navegación privada o almacenamiento
          lleno?). Si cierras la app, podrías perderlo.
        </div>
      )}

      {simDay !== null && (
        <div className="notice notice--sim" role="status">
          <span>Modo prueba: simulando el {dayLabel(simDay)}.</span>
          <button type="button" className="notice__btn" onClick={() => advent.setSimDay(null)}>
            Salir
          </button>
        </div>
      )}

      <main className="main">
        {tab === 'calendar' ? (
          <CalendarScreen
            state={state}
            today={today}
            now={now}
            summary={summary}
            justCreated={justCreated}
            onDismissWelcome={() => setJustCreated(false)}
            onDoorClick={handleDoorClick}
          />
        ) : (
          <ProgressPanel
            state={state}
            summary={summary}
            simDay={simDay}
            onOpenDay={setOpenDay}
            onSimDay={advent.setSimDay}
            onReset={handleReset}
          />
        )}
        <PrivacyLink />
      </main>

      <nav className="tabbar" aria-label="Navegación principal">
        <div className="tabbar__inner">
          <button
            type="button"
            className="tabbar__btn"
            aria-current={tab === 'calendar' ? 'page' : undefined}
            onClick={() => setTab('calendar')}
          >
            <CalendarIcon /> Calendario
          </button>
          <button
            type="button"
            className="tabbar__btn"
            aria-current={tab === 'progress' ? 'page' : undefined}
            onClick={() => setTab('progress')}
          >
            <ChartIcon /> Progreso
          </button>
        </div>
      </nav>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      {openDay !== null && (
        <DayModal
          key={openDay}
          day={openDay}
          amount={state.amounts[openDay - 1]}
          status={dayStatus(openDay, today, state.completed)}
          completedAt={state.completed[openDay]}
          totalSaved={summary.totalSaved}
          onConfirm={() => advent.toggleDay(openDay)}
          onUndo={() => advent.toggleDay(openDay)}
          onClose={() => setOpenDay(null)}
        />
      )}
    </div>
  );
}
