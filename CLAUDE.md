# Ants

Registro de gastos personales, en español (con inglés/portugués/italiano
agregados), pensado para andar como PWA instalable en el celular — y, en
paralelo, empaquetada como TWA para publicarse en Google Play. Tagline:
"Cada peso cuenta." Nombre público en las tiendas: "Registro de Gastos
Hormiga".

Filosofía central: **todo vive en el dispositivo**. No hay backend, no hay
cuentas de usuario, no hay servidor propio. Los gastos se guardan en
`localStorage` y la única forma de sacarlos es exportando a Excel. Esto no
es un detalle técnico menor — condiciona varias decisiones de diseño
descritas más abajo (moneda fija en `$`, reconocimiento de compras del
lado del cliente, verificación de premium sin servidor, etc.).

## Cómo está armada

Vanilla JS, sin build ni framework, sin `npm`/bundler. Los archivos se
sirven tal cual y se cachean con un service worker para uso offline.

- `index.html` — toda la estructura de la app (SPA de una sola página,
  con tabs). Usa atributos `data-i18n` / `data-i18n-placeholder` /
  `data-i18n-aria` para marcar qué texto se traduce solo.
- `privacidad.html` — Política de Privacidad, página aparte (no forma
  parte de la SPA, no carga `app.js`). HTML autocontenido con su propio
  `<style>` inline que imita la paleta/tipografía de la app en vez de
  importar `style.css` (evita arrastrar reglas de la app que no aplican
  ahí). Requisito de las tiendas (Google Play la pide para el listado).
  Contacto: `infotintaps@gmail.com`.
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
  versión nueva. Está en `ants-v4.8`. Nota: `.well-known/assetlinks.json`
  y `.nojekyll` (ver sección TWA más abajo) **no** están en esta lista a
  propósito — no los usa la app en tiempo de ejecución, son metadata que
  consume Android/Google, no tiene sentido cachearlos para offline.
- `test.js` — prueba de humo en Node puro (sin runner externo), corre con
  `node test.js`. Carga `i18n.js`, `premium.js` y `app.js` en ese orden
  dentro de un `vm.createContext` con un DOM falso mínimo. **Si se agrega
  un archivo `.js` nuevo del que `app.js` dependa a nivel global, hay que
  sumarlo también acá** (mismo patrón: `vm.runInContext` antes de cargar
  `app.js`), o el test explota con `ReferenceError`. El DOM falso solo
  implementa `getElementById` y `querySelectorAll` (con selectores
  hardcodeados tipo `.chip`) — no tiene `querySelector` genérico, así que
  el código de `app.js` tiene que resolver elementos únicos con
  `Array.from(lista).find(...)` en vez de `document.querySelector(...)`.

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

### TWA y verificación de Digital Asset Links (en curso)

La Digital Goods API **solo funciona dentro de una TWA instalada desde
Google Play**, con Digital Asset Links verificados. Se está armando esa
TWA con **PWABuilder**, lo que ya dejó cosas concretas en el repo:

- `.well-known/assetlinks.json` — declara qué paquete Android puede
  manejar los links de este dominio (`package_name` +
  `sha256_cert_fingerprints`). Se regenera cada vez que PWABuilder genera
  un paquete nuevo con otra firma — **el contenido de este archivo va a
  seguir cambiando** a medida que se prueben builds; no es un archivo
  "de una vez y listo". Último valor conocido: `package_name`
  `com.tintaps.gastoshormiga` (antes fue `io.github.tinchobot.twa`, con
  otro fingerprint — quedó reemplazado, no hay que restaurarlo).
  **El fingerprint que hay que publicar es el de Play App Signing**
  (Play Console → Integridad de la app / Protegida con Play → Gestiona
  la firma de aplicaciones), no el del keystore local que usa PWABuilder
  para firmar el AAB que subís — Google re-firma la app al publicarla
  con su propia clave, así que son fingerprints distintos y solo el de
  Play App Signing es el que termina en los dispositivos reales.
- `.nojekyll` (raíz, vacío) — necesario porque GitHub Pages procesa el
  sitio con Jekyll por default, y Jekyll **ignora carpetas que empiezan
  con punto** como `.well-known`, así que sin este archivo
  `assetlinks.json` daba 404 aunque estuviera bien commiteado. Si el
  archivo desaparece del repo en algún momento, ese síntoma (404 en
  `/.well-known/algo` con el resto del sitio funcionando) es la primera
  pista.
- Se sirve desde GitHub Pages en `https://tinchobot.github.io/Ants/`
  (repo `github.com/Tinchobot/Ants`, rama `main`), así que
  `assetlinks.json` queda público en
  `https://tinchobot.github.io/Ants/.well-known/assetlinks.json`. Google
  valida contra esa URL, no contra el repo.

Hasta que el paquete generado por PWABuilder esté firmado con el
fingerprint correcto, `assetlinks.json` esté verificado, y el producto
esté dado de alta en Play Console, **la compra real no puede completarse
en ningún navegador suelto** — `digitalGoodsDisponible()` da `false` y el
botón siempre muestra el mensaje de fallback ("solo disponible en la
versión de Google Play"). Eso es el comportamiento esperado, no algo
para "arreglar" en el JS.

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

Como todavía no hay una compra real verificable end-to-end, esta es la
forma de probar (y de sacar capturas de) las pantallas premium. Desde la
consola del navegador, con la app abierta:

- `antsDevPremium(true)` → simula la compra, desbloquea todo al toque
  (no hace falta recargar, `actualizarEstadoPremium()` repinta sola).
- `antsDevPremium(false)` → la deshace, vuelve al estado gratis.

No es un botón ni un gesto de la UI a propósito — es solo para
desarrollo. No usar `localStorage.setItem("ants_premium", ...)` a mano:
la clave real guarda un objeto JSON (`{activo, origen, ts}`), no un
string plano, y `antsDevPremium` ya arma eso y refresca la pantalla.

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

El registro de gastos, el historial, **exportar a Excel** y borrar todo
son y quedan **gratis**, sin restricción — incluso en la versión gratuita
se puede sacar toda la información. Los filtros de período también son
gratis, con la única excepción de "Rango" (ver arriba).

Nota histórica: el banner premium mencionaba también "backup en la
nube" como beneficio, con una tarjeta "Próximamente" en la pestaña
Metas. Se sacó por completo (banner, tarjeta y claves de i18n): implicaba
un backend que no existe ni está planeado a corto plazo, y no tenía
sentido seguir prometiéndolo. El texto del banner ahora ofrece
"estadísticas, metas de gasto y filtrar por períodos específicos" — este
último ítem es el filtro "Rango" de arriba, que si es real y ya está
implementado.

## Control de versiones y despliegue

- Repo: `github.com/Tinchobot/Ants` (privado), rama `main`. Tiene
  historial real de mucho antes de que este repo tuviera un `CLAUDE.md`
  (commits tipo "Add files via upload" hechos desde la web de GitHub) —
  si en algún momento hay que rehacer el historial local, no hacerlo con
  un commit único que lo reemplace: traer `origin/main` y parar un commit
  nuevo encima (`git reset --soft origin/main` + commit), nunca force-push
  que lo pise.
- `.gitignore` excluye `.claude/` (config local de Claude Code con rutas
  de la máquina, no aporta nada al repo).
- GitHub Pages sirve el sitio estático desde `main` en
  `https://tinchobot.github.io/Ants/` — esto es lo que expone
  `assetlinks.json` para la verificación de la TWA (ver sección de
  arriba). No confundir esta URL de Pages con una futura instalación
  real desde Play: Pages solo sirve para que Google valide el dominio.

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
- **GitHub Pages + Jekyll ignora carpetas que empiezan con punto.**
  `.well-known/assetlinks.json` daba 404 aunque estuviera bien
  commiteado y el resto del sitio funcionara — la causa era que Jekyll
  no publica nada dentro de `.well-known` sin un `.nojekyll` en la raíz
  (ver sección TWA arriba).
