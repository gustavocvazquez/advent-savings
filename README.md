# Advent Savings 🎄

Calendario de ahorro de adviento en español. Introduces una cantidad máxima diaria y la app genera
24 casillas (1–24 de diciembre) con un importe distinto en cada una. Es una **PWA** hecha con
**React + Vite**: se prueba en el móvil desde el navegador y se puede instalar en la pantalla de inicio.

## Cómo ejecutarla

Requisitos: Node.js 18 o superior.

```bash
npm install
npm run dev        # servidor de desarrollo (expuesto en la red local)
npm test           # tests de la lógica (Vitest)
npm run build      # compilación de producción en dist/
npm run preview    # sirve dist/ para probar la versión final
```

**Probarla en el móvil:** con `npm run dev` Vite muestra una dirección de red
(por ejemplo `http://192.168.1.20:5173`). Ábrela en el móvil conectado a la misma wifi.

**Instalarla como app:** despliega `dist/` en cualquier hosting estático con HTTPS (GitHub Pages,
Netlify, Cloudflare Pages…) y usa "Añadir a pantalla de inicio". El service worker solo se registra en
la versión de producción y permite usarla sin conexión.

## Reglas de los importes

- 24 importes **enteros**, **distintos** entre sí, entre 1 € y la cantidad máxima.
- Con 24 € salen exactamente los valores 1–24, mezclados al azar (total previsto: 300 €).
- Con menos de 24 € la app **avisa** de que hay que introducir al menos 24 €, porque no existen 24
  enteros distintos por debajo de ese valor.
- La asignación se genera una vez y se guarda: no cambia al recargar.
- El máximo permitido es 100.000 €.

## Cómo se usa

- **Disponible** (rojo, "¡Hoy!"): la casilla del día actual. Tócala para abrirla y ver el importe.
- **Bloqueada** (verde con candado): días futuros; al tocarlas avisan de cuándo se abren.
- **Abierta** (blanca con ✓): días ya marcados como ahorrados, con su importe.
- **Pendiente** (discontinua): días pasados sin marcar. Se pueden abrir para ponerse al día si
  olvidaste marcarlos.
- En el detalle del día, "He ahorrado esta cantidad" lo marca (con confeti) y "Desmarcar este día"
  lo deshace si te equivocaste.
- La pestaña **Progreso** muestra la barra, el total ahorrado, el total previsto, lo que falta y la
  lista de días completados.

**Modo prueba:** como el calendario solo se activa en diciembre, en *Progreso → Ajustes* puedes
simular cualquier día de diciembre para probar la app antes de tiempo. Mientras está activo se
muestra un aviso con el botón "Salir".

## Botón "Invítame a un café"

En la pestaña Progreso hay una tarjeta con un enlace a PayPal.Me con el precio de un café ya
rellenado (3 €, editable por quien paga). Para activarla, abre `src/config.js` y escribe tu usuario de
PayPal.Me en `PAYPAL_USER` (si tu enlace es `paypal.me/mariaperez`, pon `'mariaperez'`). Con el valor
vacío la tarjeta no se muestra. El importe sugerido se cambia en `COFFEE_PRICE`.

## Arquitectura

```
src/
├── main.jsx                 Punto de entrada, ErrorBoundary y registro del service worker
├── App.jsx                  Raíz: elige pantalla, pestañas y diálogo del día
├── styles.css               Estilos (mobile-first, variables de la paleta navideña)
├── config.js                Usuario de PayPal.Me e importe del café
├── hooks/
│   ├── useAdvent.js         TODO el estado y las acciones (crear, marcar, reiniciar, modo prueba)
│   └── useModalA11y.js      Foco, Escape y bloqueo de scroll para el diálogo
├── lib/                     Lógica pura, sin React
│   ├── calendar.js          Validación, generación aleatoria, fechas, estados, totales
│   ├── storage.js           localStorage con validación de datos y manejo de errores
│   ├── format.js            Formato de euros y fechas en español
│   └── calendar.test.js     Tests de Vitest
└── components/
    ├── HomeScreen.jsx       Formulario inicial con validación
    ├── CalendarScreen.jsx   Cuadrícula de 24 puertas, resumen inicial y leyenda
    ├── Door.jsx             Una puerta (bloqueada / disponible / abierta / pendiente)
    ├── DayModal.jsx         Detalle del día, animación de apertura y celebración
    ├── ProgressPanel.jsx    Barra de progreso, totales y lista de días
    ├── CoffeeCard.jsx       Tarjeta "Invítame a un café" (PayPal.Me)
    ├── SettingsPanel.jsx    Modo prueba y reinicio con confirmación
    ├── Header.jsx, Snow.jsx, Confetti.jsx, Icons.jsx, ErrorBoundary.jsx
public/
├── manifest.webmanifest, icon.svg, sw.js    PWA
```

**Decisiones de diseño**

- **Lógica separada de la interfaz:** `lib/` son funciones puras (fáciles de probar) y `useAdvent`
  es el único sitio que toca el estado; los componentes solo reciben datos y callbacks.
- **Generación sin sesgo:** Fisher–Yates con `Map` (no construye arrays enormes con máximos altos).
- **Persistencia:** un único objeto JSON en `localStorage` (`advent-savings:v1`) con año, máximo,
  los 24 importes y los días completados con su fecha. Al cargar se valida; si los datos están
  corruptos se ignoran y se vuelve al inicio. Si no se puede guardar (modo privado, almacenamiento
  lleno) se muestra un aviso.
- **Fechas:** el calendario pertenece al año en que se crea (o al siguiente si se crea después del 24
  de diciembre). La puerta de "hoy" se recalcula cada minuto y al volver a la app.
- **Accesibilidad:** etiquetas descriptivas en cada puerta, foco visible, diálogo con foco atrapado y
  Escape, barra de progreso con `role="progressbar"`, mensajes con `role="alert"`/`status`, objetivos
  táctiles de al menos 44 px y respeto de `prefers-reduced-motion` (se desactivan nieve, confeti y
  animaciones).
