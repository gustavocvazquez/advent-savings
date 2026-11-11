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

Puedes introducir cualquier cantidad máxima diaria (con coma o punto, hasta dos decimales), por ejemplo
`10`, `8,50` o `30`. Mínimo: 0,24 € (24 importes distintos de al menos 0,01 €); máximo: 100.000 €.

- Se generan 24 importes **distintos** entre 0,01 € y tu máximo; ninguno lo supera.
- **24 € o más:** euros enteros. Con 24 € salen exactamente los valores 1–24, mezclados (total: 300 €).
- **Menos de 24 €:** no hay 24 euros enteros distintos, así que se usan céntimos, con el salto más
  "redondo" posible: 0,50 € (desde 12 €), 0,25 € (con 10 € salen importes como 8,50 o 3,25),
  0,10 €, 0,05 € y 0,01 €.
- La asignación se genera una vez y se guarda: no cambia al recargar. Los calendarios guardados con
  la versión anterior (euros enteros) siguen funcionando.
- Todo el dinero se calcula en céntimos internamente para evitar errores de coma flotante.

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

En la pestaña Progreso hay una tarjeta con un enlace a la página de Ko-fi
(`https://ko-fi.com/adventsavings`). El usuario se configura en `src/config.js` (`KOFI_USER`). Si lo
dejas vacío, la tarjeta no se muestra; es lo más seguro para una versión de Google Play, porque su
política sobre enlaces de donación externos puede afectar a la revisión.

## Política de privacidad

La política está en `public/privacidad.html` y se publica junto con la app (por ejemplo,
`https://gustavocvazquez.github.io/privacidad.html`). La app la enlaza desde el pie de las pantallas.
**Antes de publicar**, abre el archivo y sustituye `[TU NOMBRE]` y `[TU CORREO]` (aparecen varias veces)
por tus datos reales. Google Play pide esta URL en la ficha de la app.

## Arquitectura

```
src/
├── main.jsx                 Punto de entrada, ErrorBoundary y registro del service worker
├── App.jsx                  Raíz: elige pantalla, pestañas y diálogo del día
├── styles.css               Estilos (mobile-first, variables de la paleta navideña)
├── config.js                Usuario de Ko-fi
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
    ├── CoffeeCard.jsx       Tarjeta "Invítame a un café" (Ko-fi)
    ├── PrivacyLink.jsx      Enlace a la política de privacidad
    ├── SettingsPanel.jsx    Modo prueba y reinicio con confirmación
    ├── Header.jsx, Snow.jsx, Confetti.jsx, Icons.jsx, ErrorBoundary.jsx
public/
├── manifest.webmanifest, icon.svg, sw.js    PWA
├── privacidad.html                          Política de privacidad
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
