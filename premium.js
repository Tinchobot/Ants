// =====================================
// Premium (Google Play Digital Goods API)
//
// Pago único, sin backend: se compra un producto en Play ("premium_
// unlock") y una vez confirmado queda guardado en localStorage para
// no tener que volver a consultar la API todo el tiempo.
//
// OJO: la Digital Goods API solo existe dentro de una Trusted Web
// Activity (TWA) instalada desde Google Play, con Digital Asset
// Links verificados contra el dominio. En un navegador normal (o en
// esta app corriendo suelta, sin empaquetar) directamente no está
// disponible: digitalGoodsDisponible() da false y todo el módulo
// queda en modo "no disponible" a propósito, sin romper nada.
//
// Como esta app no tiene backend propio, la confirmación de la
// compra se reconoce (acknowledge) del lado del cliente. Eso alcanza
// para uso normal, pero no es a prueba de manipulación (alguien
// podría escribir directamente en su propio localStorage). Para una
// app sin servidor es el mismo trade-off que ya tiene el resto de
// Ants (todo vive en el dispositivo).
// =====================================

// El ID de producto que se crea en Play Console (pago único, no
// suscripción).
const PRODUCTO_PREMIUM = "premium_unlock";

// El "supportedMethods" que usa la Payment Request API para hablar
// con Play Billing a través de Chrome.
const METODO_PAGO_PLAY = "https://play.google.com/billing";

const CLAVE_PREMIUM = "ants_premium";

// -------------------------------------
// Panel de debug visible (TEMPORAL)
//
// Se agregó para diagnosticar un caso real: una compra que Play cobró
// de verdad pero que no desbloqueó el premium en el dispositivo, sin
// poder usar depuración USB para leer la consola. Muestra en pantalla
// los mismos pasos que ya se logueaban por consola.
//
// Sacar esta sección (y las llamadas a logDebugPremium/
// logErrorDebugPremium de más abajo, volviéndolas console.log/
// console.error directos) una vez resuelto el diagnóstico — el panel
// no es parte de la interfaz definitiva de la app.
// -------------------------------------

function agregarLineaPanelDebug(mensaje) {

    try {

        const panel = document.getElementById("panelDebugPremium");
        const texto = document.getElementById("panelDebugPremiumTexto");

        if (!panel || !texto) return;

        const hora = new Date().toLocaleTimeString("es-AR");

        texto.textContent += `[${hora}] ${mensaje}\n`;

        panel.classList.remove("oculto");

        if (typeof panel.scrollTop === "number") {

            panel.scrollTop = panel.scrollHeight;

        }

    } catch (e) {}

}

function formatearDatoDebug(dato) {

    if (dato === undefined) return "";

    if (typeof dato === "string") return " " + dato;

    try {

        return " " + JSON.stringify(dato);

    } catch (e) {

        return " " + String(dato);

    }

}

// Reemplaza a console.log en los puntos clave del flujo premium: deja
// el log en consola (por si hay devtools) y además lo muestra en el
// panel visible, para poder diagnosticar sin depuración USB.
function logDebugPremium(mensaje, dato) {

    console.log("[Ants Premium]", mensaje, dato === undefined ? "" : dato);

    agregarLineaPanelDebug(mensaje + formatearDatoDebug(dato));

}

function logErrorDebugPremium(mensaje, error) {

    console.error("[Ants Premium]", mensaje, error);

    const detalle = error && (error.message || String(error));

    agregarLineaPanelDebug("❌ " + mensaje + formatearDatoDebug(detalle));

}

// -------------------------------------
// Detección
// -------------------------------------

function digitalGoodsDisponible() {

    return typeof window !== "undefined" && "getDigitalGoodsService" in window;

}

async function obtenerServicioDigitalGoods() {

    if (!digitalGoodsDisponible()) {

        logDebugPremium("Digital Goods API no disponible en este navegador/instalación.");

        return null;

    }

    try {

        const servicio = await window.getDigitalGoodsService(METODO_PAGO_PLAY);

        logDebugPremium("Servicio de Digital Goods obtenido:", !!servicio);

        return servicio;

    } catch (e) {

        logErrorDebugPremium("No se pudo obtener el servicio de Digital Goods", e);

        return null;

    }

}

// -------------------------------------
// Estado local (cache)
// -------------------------------------

function leerPremiumLocal() {

    try {

        const guardado = JSON.parse(localStorage.getItem(CLAVE_PREMIUM));

        return guardado && guardado.activo ? guardado : null;

    } catch (e) {

        return null;

    }

}

function guardarPremiumLocal(origen) {

    try {

        localStorage.setItem(CLAVE_PREMIUM, JSON.stringify({
            activo: true,
            origen: origen || "compra",
            ts: Date.now()
        }));

    } catch (e) {}

}

function borrarPremiumLocal() {

    try {

        localStorage.removeItem(CLAVE_PREMIUM);

    } catch (e) {}

}

// Lectura rápida y sincrónica: es la que usa la interfaz en cada
// render, así no hay que esperar una llamada async para pintar la
// pantalla.
function esPremium() {

    return !!leerPremiumLocal();

}

// -------------------------------------
// Consultar compras reales en Play
// -------------------------------------

// Devuelve true/false si pudo confirmar contra Play, o null si no
// se pudo verificar (por ejemplo, porque no estamos en una TWA).
async function consultarComprasPremium() {

    const servicio = await obtenerServicioDigitalGoods();

    if (!servicio) {

        return null;

    }

    try {

        const compras = await servicio.listPurchases();

        // Log crudo a propósito: si el product ID de Play Console no
        // coincide letra por letra con PRODUCTO_PREMIUM, acá se ve
        // el itemId real que devuelve Play para compararlo a mano.
        logDebugPremium(
            `listPurchases() devolvió ${compras.length} compra(s):`,
            compras.map((c) => ({ itemId: c.itemId, purchaseToken: c.purchaseToken }))
        );

        const encontrada = compras.some((compra) => compra.itemId === PRODUCTO_PREMIUM);

        logDebugPremium(`¿Está "${PRODUCTO_PREMIUM}" entre las compras?`, encontrada);

        return encontrada;

    } catch (e) {

        logErrorDebugPremium("No se pudieron listar las compras", e);

        return null;

    }

}

// Se llama al arrancar la app y cada vez que vuelve a foco. Si no
// hay Digital Goods API disponible, no toca nada (respeta lo que
// ya haya en localStorage, incluido el modo de prueba). Si sí la
// hay, reconcilia el estado local con lo que diga Play de verdad
// (por ejemplo, para detectar un reembolso).
async function sincronizarPremiumConPlay() {

    if (!digitalGoodsDisponible()) {

        logDebugPremium("sincronizarPremiumConPlay: sin Digital Goods API, no se toca localStorage.");

        return;

    }

    logDebugPremium("sincronizarPremiumConPlay: consultando compras reales en Play...");

    const comprado = await consultarComprasPremium();

    if (comprado === true) {

        logDebugPremium("Compra confirmada por Play → guardando premium en localStorage.");

        guardarPremiumLocal("compra");

    } else if (comprado === false) {

        const local = leerPremiumLocal();

        if (local && local.origen === "compra") {

            logDebugPremium("Play ya no reporta la compra (¿reembolso?) → borrando premium local.");

            borrarPremiumLocal();

        }

    } else {

        // comprado === null: no se pudo verificar (ver logs de
        // obtenerServicioDigitalGoods/consultarComprasPremium arriba
        // para la causa puntual). A propósito no tocamos localStorage
        // acá para no pisar un estado guardado (incluido el modo de
        // prueba) por un error transitorio de red o del servicio.
        logDebugPremium("No se pudo verificar el estado contra Play (comprado === null); localStorage queda sin tocar.");

    }

}

// -------------------------------------
// Flujo de compra
// -------------------------------------

// Devuelve "ok" | "cancelado" | "error". El caso "no-disponible" lo
// filtra quien llama a esta función (ver iniciarCompraPremium en
// app.js), mostrando el mensaje de fallback del punto 1 antes de
// intentar nada.
async function comprarPremium() {

    let purchaseToken = null;

    try {

        const metodos = [{
            supportedMethods: METODO_PAGO_PLAY,
            data: { sku: PRODUCTO_PREMIUM }
        }];

        // El monto real lo define el producto en Play Console; esto
        // es solo el resumen que exige la Payment Request API.
        const detalles = {
            total: {
                label: "Ants Premium",
                amount: { currency: "USD", value: "0" }
            }
        };

        const solicitud = new PaymentRequest(metodos, detalles);

        logDebugPremium("Mostrando el cuadro de pago de Play Billing...");

        const respuesta = await solicitud.show();

        purchaseToken = respuesta.details && respuesta.details.purchaseToken;

        logDebugPremium("Pago confirmado por Play. purchaseToken:", purchaseToken ? "sí, presente" : "vacío/ausente");

        await respuesta.complete("success");

    } catch (e) {

        // El usuario cerró el cuadro de pago sin completar la compra.
        if (e && e.name === "AbortError") {

            logDebugPremium("El usuario canceló el cuadro de pago.");

            return "cancelado";

        }

        logErrorDebugPremium("Error antes de completar el pago", e);

        return "error";

    }

    // A partir de acá el pago ya se completó y Play ya cobró — un
    // problema al reconocer (acknowledge) la compra NO puede hacer
    // que tratemos esto como una compra fallida, o el usuario queda
    // cobrado sin desbloquear nada (bug real que se dio en producción:
    // el acknowledge tiraba una excepción intermitente y esa excepción
    // caía en el mismo catch que el pago, perdiendo el "ok"). Por eso
    // va en su propio try/catch, separado del de arriba.
    try {

        const servicio = await obtenerServicioDigitalGoods();

        if (servicio && purchaseToken) {

            // "onetime": queda reconocida para siempre y no se
            // consume (a diferencia de un ítem consumible, que
            // habría que volver a comprar).
            await servicio.acknowledge(purchaseToken, "onetime");

            logDebugPremium("Compra reconocida (acknowledge) correctamente.");

        } else {

            logDebugPremium(
                "⚠️ No se pudo hacer acknowledge",
                { servicioDisponible: !!servicio, purchaseTokenPresente: !!purchaseToken }
            );

        }

    } catch (e) {

        // No devolvemos "error" acá: el pago ya se completó y no hay
        // que perder el desbloqueo por esto. sincronizarPremiumConPlay
        // va a reintentar el acknowledge implícito la próxima vez que
        // la app tenga foco (listPurchases sigue viendo la compra
        // aunque no esté reconocida todavía).
        logErrorDebugPremium("El pago se completó pero falló el acknowledge (se reintentará solo)", e);

    }

    return "ok";

}

// -------------------------------------
// Modo de prueba (oculto)
//
// No hay ninguna TWA publicada todavía, así que la compra real no
// se puede probar. Desde la consola del navegador:
//   antsDevPremium(true)   -> simula la compra
//   antsDevPremium(false)  -> la deshace
// Esto no es un botón ni un gesto en la interfaz: es intencional
// que solo se pueda activar escribiendo en devtools.
// -------------------------------------

window.antsDevPremium = function (activar) {

    if (activar) {

        guardarPremiumLocal("dev");

    } else {

        borrarPremiumLocal();

    }

    if (typeof actualizarEstadoPremium === "function") {

        actualizarEstadoPremium();

    }

    console.log(
        "[Ants] Premium de prueba:",
        activar ? "activado ✅ (no es una compra real)" : "desactivado"
    );

};
