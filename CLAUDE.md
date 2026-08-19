# Ants

Registro de gastos personales, en español (con inglés/portugués/italiano
agregados), pensado para andar como PWA instalable en el celular. Tagline:
"Cada peso cuenta."

Filosofía central: **todo vive en el dispositivo**. No hay backend, no hay
cuentas de usuario, no hay servidor propio. Los gastos se guardan en
`localStorage` y la única forma de sacarlos es exportando a Excel. Esto no
es un detalle técnico menor — condiciona varias decisiones de diseño
descritas más abajo (moneda fija en `$`, reconocimiento de compras del
lado del cliente, etc.).

## Cómo está armada

Vanilla JS, sin build ni framework, sin `npm`/bundler. Los archivos se
sirven tal cual y se cachean con un service worker para uso offline.

- `index.html` — toda la estructura. Usa atributos `data-i18n` /
  `data-i18n-placeholder` / `data-i18n-aria` para marcar qué texto se
  traduce solo.
- `style.css` — una sola hoja, sin preprocesador. Paleta: amarillo/dorado
  de fondo (`#FFD54F`/`#FFE66D`), blanco para las tarjetas, y verde/naranja/
  rojo (`#2e7d32`/`#ef6c00`/`#c62828`) como colores semánticos fijos de
  Necesario/Evitable/Innecesario (se reutilizan en botones, etiquetas y
  gráficos).
- `app.js` — toda la lógica de la app (gastos, filtros, historial, tabs,
  metas). Es el último script en cargar; asume que `i18n.js` y
  `premium.js` ya corrieron antes y expusieron sus globals.
- `i18n.js` — diccionario de traducciones (ver sección Idiomas) + helpers
  de detección de idioma. Se carga antes que `app.js`.
- `premium.js` — todo lo de la Digital Goods API / estado premium (ver
  más abajo). También se carga antes que `app.js`.
- `chart.umd.min.js`, `xlsx.full.min.js` — Chart.js y SheetJS
  **vendorizados localmente** (no CDN), para que el service worker los
  pueda cachear y la app funcione offline. Cualquier librería nueva que
  se agregue debería seguir el mismo criterio.
- `sw.js` — cache-first con fallback a red. Cualquier archivo estático
  nuevo que se agregue **tiene que sumarse a `FILES_TO_CACHE`**, y hay que
  bumpear `CACHE_NAME` (`ants-vX.Y`) para que los usuarios reciban la
  versión nueva. Está en `ants-v4.5`.
- `test.js` — prueba de humo en Node puro (sin runner externo), corre con
  `node test.js`. Carga `i18n.js`, `premium.js` y `app.js` en ese orden
  dentro de un `vm.createContext` con un DOM falso mínimo. **Si se agrega
  un archivo `.js` nuevo del que `app.js` dependa a nivel global, hay que
  sumarlo también acá** (mismo patrón: `vm.runInContext` antes de cargar
  `app.js`), o el test explota con `ReferenceError`.

Orden de carga de scripts (importa): `xlsx.full.min.js` →
`chart.umd.min.js` → `i18n.js` → `premium.js` → `app.js`.

## Categorías de gasto: fijas, no configurables

Todo gasto se clasifica en una de tres categorías, siempre las mismas,
sin importar el idioma: `necesario` / `evitable` / `innecesario` (esas
son las claves internas que se guardan; el nombre que se ve sale de
`t("tipos." + clave)`). No hay forma de que el usuario cree categorías
propias — es una decisión de simplicidad, no una limitación técnica que
haya que resolver. Los gastos cargados antes de que existiera el tipeo
quedan como "Sin clasificar" (`tipos.sin`) y siguen sumando al total.

## Fecha y hora: formato canónico vs. formato mostrado

Decisión importante para no romper nada al cambiar de idioma: la fecha y
la hora de cada gasto se **guardan siempre en formato fijo es-AR**
(`DD/MM/AAAA`, 24hs) sin importar el idioma de la interfaz — es lo que
parsean `fechaDeGasto()` y todos los filtros de período. Lo que cambia
según el idioma es solo cómo se **muestran** (`fechaParaMostrar()` /
`horaParaMostrar()`, con `ordenFecha`/`hora12` definidos por idioma en
`i18n.js`). Si en algún momento se te ocurre "simplificar" guardando la
fecha ya formateada según el idioma activo, no lo hagas: rompe el
filtrado de gastos viejos apenas alguien cambia de idioma.

## Idiomas

Español (default), English, Português (Brasil), Italiano. Arquitectura:

- Diccionario completo en `IDIOMAS` (`i18n.js`), con `textos` (claves
  tipo `"seccion.algo"`), más metadata por idioma: `locale` (para
  `toLocaleString`), `vozLang` (reconocimiento de voz), `ordenFecha`
  (`DMY`/`MDY`), `hora12`, `mesesCortos` (gráfico de barras),
  `patronMoneda`/`patronMillar` (regex que usa `interpretarGasto()` para
  reconocer "pesos"/"mil", "dollars"/"thousand", etc. en el texto libre).
- `t(clave, params)` busca el texto en el idioma actual, cae a español si
  falta, y hace reemplazo simple de `{parametro}`.
- El idioma se detecta al arrancar (`ants_idioma` guardado → idioma del
  navegador → español) y se puede cambiar con el `<select>` de la barra
  superior; queda persistido en `localStorage`.
- **Al agregar un texto nuevo**: la clave tiene que existir en los 4
  idiomas del diccionario. Es fácil olvidarse de uno — conviene grepear
  la clave en los cuatro bloques (`es`/`en`/`pt`/`it`) antes de dar por
  terminado el cambio.
- El símbolo de moneda queda fijo en `$` en los 4 idiomas (no hay
  conversión de divisas, la app no sabe de tipos de cambio).

## Monetización: pago único vía Google Play, sin suscripción

Se eligió **Digital Goods API + Payment Request API** (el mecanismo
estándar para cobrar en una Trusted Web Activity a través de Google
Play Billing), con un único producto de pago único (no consumible):

- Product ID: **`premium_unlock`** (se crea en Play Console; acá es solo
  una constante, `PRODUCTO_PREMIUM` en `premium.js`).
- No es suscripción — es un unlock permanente. Por eso se reconoce con
  `service.acknowledge(purchaseToken, "onetime")` y no se consume nunca.
- Precio de referencia en la interfaz: **US$3.99** (texto estático en el
  banner y en las pantallas de candado — hoy no se consulta
  `service.getDetails()` para traer el precio real desde Play. Si el
  precio cambia en Play Console, hay que actualizar el texto a mano en
  `i18n.js`, o mejor: cambiar a precio dinámico vía `getDetails()`).

### Limitación real, no un bug

La Digital Goods API **solo funciona dentro de una TWA instalada desde
Google Play**, con Digital Asset Links verificados. Este repo hoy es una
PWA suelta, sin empaquetar. Hasta que se arme la TWA (Bubblewrap o
PWABuilder), se publique `assetlinks.json`, y se dé de alta el producto
en Play Console, **la compra real no puede completarse en ningún
navegador** — `digitalGoodsDisponible()` da `false` y el botón siempre va
a mostrar el mensaje de fallback ("solo disponible en la versión de
Google Play"). Eso es el comportamiento esperado, no algo para "arreglar"
en el JS.

### Estado local y verificación

- `esPremium()` es la lectura rápida y sincrónica (`localStorage["ants_premium"]`
  → `{activo, origen, ts}`) que usa toda la interfaz para decidir qué
  mostrar. No hace falta esperar ninguna llamada async para pintar la
  pantalla.
- `sincronizarPremiumConPlay()` reconcilia contra `listPurchases()` real
  al arrancar y cada vez que la app vuelve a foco — pero **solo si la
  Digital Goods API existe**; si no, no toca nada (así no pisa un estado
  guardado localmente, incluido el modo de prueba).
- Sin backend propio, la confirmación de compra se reconoce del lado del
  cliente. Alcanza para una app así, pero no es a prueba de manipulación
  (alguien podría escribir en su propio `localStorage`) — mismo
  trade-off que ya tiene el resto de Ants al no tener servidor.

### Modo de prueba (dev-only, intencionalmente oculto)

Como no hay TWA publicada, no hay forma de probar la compra real. Desde
la consola del navegador: `antsDevPremium(true)` simula la compra,
`antsDevPremium(false)` la deshace. No es un botón ni un gesto de la UI
a propósito — es solo para desarrollo.

## Qué queda premium

- **Estadísticas** (torta + barras de los últimos 6 meses): implementada
  y funcionando, bloqueada detrás del premium.
- **Metas de gasto**: meta mensual con barra de progreso y alerta
  (⚠️ cerca del límite, 🚨 superada) — implementada y bloqueada.
- **Filtro de período "Rango"** (elegir fecha desde/hasta a mano): el
  único filtro de período que es premium. Si no se compró, el chip
  "Rango" se ve con 🔒 (clase `.bloqueado` en CSS, vía `::before`) y al
  tocarlo no cambia el filtro — solo dispara un toast
  (`premium.filtroRangoBloqueado`). Si el premium se pierde en medio de
  sesión (solo pasa en modo de prueba, `antsDevPremium(false)`) con
  "Rango" activo, se vuelve a "Todo" automáticamente. El resto de los
  filtros de período ("Todo", "Semana", "Mes") no está afectado por
  esto — es una excepción puntual, no el criterio general.

El registro de gastos, el historial, exportar a Excel y borrar todo son
y quedan **gratis**, sin restricción. Los filtros de período también son
gratis, con la única excepción de "Rango" (ver arriba).

## Cosas que ya se supieron mal una vez (para no repetirlas)

- **CSS: cuidado con `.algo{display:X}` peleando con `.oculto{display:
  none}`.** Cuando una clase define `display` explícito y aparece más
  abajo que `.oculto` en la hoja, gana por orden de cascada aunque el
  elemento tenga la clase `oculto` puesta. Ya pasó dos veces
  (`.rangoFechas` y `.bannerPremium`): la solución es una regla
  combinada `.claseQueSea.oculto{display:none}`, no reordenar toda la
  hoja ni usar `!important`.
- **Gráficos de Chart.js con el canvas oculto se miden 0x0 y quedan
  rotos.** Por eso los gráficos de Estadísticas solo se crean/actualizan
  cuando esa pestaña está realmente visible y es premium — nunca "por
  las dudas" en segundo plano.
