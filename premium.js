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
// Detección
// -------------------------------------

function digitalGoodsDisponible() {

    return typeof window !== "undefined" && "getDigitalGoodsService" in window;

}

async function obtenerServicioDigitalGoods() {

    if (!digitalGoodsDisponible()) {

        return null;

    }

    try {

        return await window.getDigitalGoodsService(METODO_PAGO_PLAY);

    } catch (e) {

        console.error("No se pudo obtener el servicio de Digital Goods", e);

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

        return compras.some((compra) => compra.itemId === PRODUCTO_PREMIUM);

    } catch (e) {

        console.error("No se pudieron listar las compras", e);

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

        return;

    }

    const comprado = await consultarComprasPremium();

    if (comprado === true) {

        guardarPremiumLocal("compra");

    } else if (comprado === false) {

        const local = leerPremiumLocal();

        if (local && local.origen === "compra") {

            borrarPremiumLocal();

        }

    }

    // comprado === null: no se pudo verificar, no tocamos nada.

}

// -------------------------------------
// Flujo de compra
// -------------------------------------

// Devuelve "ok" | "cancelado" | "error". El caso "no-disponible" lo
// filtra quien llama a esta función (ver iniciarCompraPremium en
// app.js), mostrando el mensaje de fallback del punto 1 antes de
// intentar nada.
async function comprarPremium() {

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

        const respuesta = await solicitud.show();

        const purchaseToken = respuesta.details && respuesta.details.purchaseToken;

        await respuesta.complete("success");

        const servicio = await obtenerServicioDigitalGoods();

        if (servicio && purchaseToken) {

            // "onetime": queda reconocida para siempre y no se
            // consume (a diferencia de un ítem consumible, que
            // habría que volver a comprar).
            await servicio.acknowledge(purchaseToken, "onetime");

        }

        return "ok";

    } catch (e) {

        // El usuario cerró el cuadro de pago sin completar la compra.
        if (e && e.name === "AbortError") {

            return "cancelado";

        }

        console.error("Error al comprar premium", e);

        return "error";

    }

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
