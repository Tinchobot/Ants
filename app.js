// =====================================
// ANTS 3.0
//
// Los gastos no salen del teléfono: se guardan en el
// almacenamiento local del navegador. La única forma de
// sacarlos es el botón Exportar, que genera un Excel.
// =====================================

// Elementos
const entrada = document.getElementById("entrada");
const botonesGuardar = document.querySelectorAll(".btnGuardar");
const vozBtn = document.getElementById("voz");
const exportarBtn = document.getElementById("exportar");
const borrarTodoBtn = document.getElementById("borrarTodo");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("listaHistorial");
const verMasBtn = document.getElementById("verMas");
const contadorHistorial = document.getElementById("contadorHistorial");
const totalHoy = document.getElementById("totalHoy");
const cantidadHoy = document.getElementById("cantidadHoy");
const totalGeneral = document.getElementById("totalGeneral");
const cantidadGeneral = document.getElementById("cantidadGeneral");
const desgloseHoy = document.getElementById("desgloseHoy");
const desglosePeriodo = document.getElementById("desglosePeriodo");
const etiquetaPeriodo = document.getElementById("etiquetaPeriodo");
const tituloHistorial = document.getElementById("tituloHistorial");
const rangoFechas = document.getElementById("rangoFechas");
const fechaDesde = document.getElementById("fechaDesde");
const fechaHasta = document.getElementById("fechaHasta");
const chips = document.querySelectorAll(".chip");
const chipRango = Array.from(chips).find(
    (chip) => chip.dataset.filtro === "rango"
);
const splash = document.getElementById("splash");
const app = document.getElementById("app");

const tabs = document.querySelectorAll(".tab");
const vistaGastosEls = document.querySelectorAll(".vistaGastos");
const vistaEstadisticas = document.getElementById("vistaEstadisticas");
const tituloTorta = document.getElementById("tituloTorta");
const canvasTorta = document.getElementById("graficoTorta");
const tortaVacio = document.getElementById("tortaVacio");
const canvasBarras = document.getElementById("graficoBarras");

const selectorIdioma = document.getElementById("idiomaSelector");

// Premium
const badgePremium = document.getElementById("badgePremium");
const bannerPremium = document.getElementById("bannerPremium");
const botonesComprarPremium = document.querySelectorAll(".btnComprarPremium");
const candadoEstadisticas = document.getElementById("candadoEstadisticas");
const contenidoEstadisticas = document.getElementById("contenidoEstadisticas");
const vistaMetas = document.getElementById("vistaMetas");
const candadoMetas = document.getElementById("candadoMetas");
const contenidoMetas = document.getElementById("contenidoMetas");
const metaSinDefinir = document.getElementById("metaSinDefinir");
const metaDefinida = document.getElementById("metaDefinida");
const barraMetaProgreso = document.getElementById("barraMetaProgreso");
const metaTexto = document.getElementById("metaTexto");
const metaAlerta = document.getElementById("metaAlerta");
const metaInput = document.getElementById("metaInput");
const guardarMetaBtn = document.getElementById("guardarMeta");

const sonidoGuardar = new Audio("guardar.mp3");

// Tipos de gasto válidos. La clave es lo que se guarda en cada
// gasto; el nombre que se muestra sale de las traducciones (t()),
// así que no depende de en qué idioma esté la app.
const TIPOS_VALIDOS = ["necesario", "evitable", "innecesario"];

function esTipoValido(tipo) {

    return TIPOS_VALIDOS.includes(tipo);

}

// Los gastos cargados antes de esta versión no tienen tipo.
function nombreTipo(tipo) {

    return esTipoValido(tipo) ? t("tipos." + tipo) : t("tipos.sin");

}

// =====================================
// Idioma
//
// IDIOMAS, idiomaValido/idiomaGuardado/idiomaDelNavegador vienen
// de i18n.js, que se carga antes que este archivo.
// =====================================

// El idioma elegido por el usuario, o el que sugiere el navegador,
// o español si no hay pistas de ninguno de los dos.
let idiomaActual =
    idiomaGuardado() || idiomaDelNavegador() || IDIOMA_POR_DEFECTO;

function idiomaConfig() {

    return IDIOMAS[idiomaActual] || IDIOMAS[IDIOMA_POR_DEFECTO];

}

// Busca un texto traducido. Si falta en el idioma actual, cae al
// español; si tampoco está ahí, devuelve la clave tal cual (para
// notar el faltante en vez de romper la pantalla).
function t(clave, params) {

    const base = IDIOMAS[IDIOMA_POR_DEFECTO].textos;

    let texto = idiomaConfig().textos[clave];

    if (texto === undefined) {

        texto = base[clave] !== undefined ? base[clave] : clave;

    }

    if (params) {

        Object.keys(params).forEach((clavePar) => {

            texto = texto.split("{" + clavePar + "}").join(params[clavePar]);

        });

    }

    return texto;

}

// El locale que usan toLocaleString/toLocaleDateString.
function localeActual() {

    return idiomaConfig().locale;

}

// Aplica las traducciones a todo lo que tiene marcado data-i18n*
// en el HTML. Lo dinámico (totales, listas, gráficos) se traduce
// solo porque ya usa t() en cada render, no hace falta tocarlo acá.
function aplicarTraducciones() {

    document.querySelectorAll("[data-i18n]").forEach((el) => {

        el.textContent = t(el.dataset.i18n);

    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {

        el.placeholder = t(el.dataset.i18nPlaceholder);

    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {

        el.setAttribute("aria-label", t(el.dataset.i18nAria));

    });

    if (document.documentElement) {

        document.documentElement.lang = idiomaActual;

    }

    if (selectorIdioma) {

        selectorIdioma.value = idiomaActual;

    }

}

function cambiarIdioma(codigo) {

    if (!idiomaValido(codigo) || codigo === idiomaActual) {

        return;

    }

    idiomaActual = codigo;

    try {

        localStorage.setItem("ants_idioma", codigo);

    } catch (e) {}

    if (reconocimiento) {

        reconocimiento.lang = idiomaConfig().vozLang;

    }

    aplicarTraducciones();

    // Las leyendas y los meses de los gráficos se fijan al crear el
    // gráfico: si cambia el idioma no alcanza con actualizar los
    // datos, hay que recrearlos.
    if (graficoTorta) {

        graficoTorta.destroy();
        graficoTorta = null;

    }

    if (graficoBarras) {

        graficoBarras.destroy();
        graficoBarras = null;

    }

    actualizarPantalla();

}

if (selectorIdioma) {

    selectorIdioma.addEventListener("change", () => {

        cambiarIdioma(selectorIdioma.value);

    });

}

// Historial

// Cuántos gastos se dibujan de una. No es un límite:
// el botón "Ver más" sigue sumando de a tandas hasta el final.
const TAMANIO_TANDA = 20;

let mostrando = TAMANIO_TANDA;

// Estado del filtro de período: "todo" | "semana" | "mes" | "rango".
// Se declara acá arriba porque el bloque "Inicio" dibuja la pantalla
// antes de llegar a la sección de filtros.
let filtroActivo = "todo";

let desdeElegido = null;
let hastaElegido = null;

// Qué pestaña se está viendo: "gastos" | "estadisticas".
let vistaActual = "gastos";

// Colores de cada tipo de gasto, reutilizados en los gráficos.
const COLORES_TIPO = {
    necesario:   "#2e7d32",
    evitable:    "#ef6c00",
    innecesario: "#c62828"
};

let graficoTorta = null;
let graficoBarras = null;

let historial = leerHistorial();

function leerHistorial() {

    let guardado;

    try {

        guardado = JSON.parse(
            localStorage.getItem("ants_historial")
        );

    } catch (e) {

        console.error("Historial corrupto en localStorage", e);

        return [];

    }

    if (!Array.isArray(guardado)) {

        return [];

    }

    // Los gastos viejos podrían no tener id: se lo asignamos
    // para poder borrarlos por id y no por posición.
    return guardado.map((gasto, i) => (

        gasto && gasto.id != null
            ? gasto
            : { ...gasto, id: `legacy-${i}` }

    ));

}

function guardarHistorial() {

    try {

        localStorage.setItem(
            "ants_historial",
            JSON.stringify(historial)
        );

        return true;

    } catch (e) {

        console.error("No se pudo guardar el historial", e);

        mostrar(t("msj.sinEspacio"), "#d32f2f");

        return false;

    }

}

// Splash

setTimeout(() => {

    splash.style.display = "none";

    app.classList.remove("oculto");

    entrada.focus();

}, 1800);

// Inicio

aplicarTraducciones();

// Pinta de una con lo que ya haya en localStorage (rápido, sin
// esperar nada async); si estamos en una TWA de verdad, esto se
// reconcilia con Play un instante después.
actualizarEstadoPremium();

sincronizarPremiumConPlay().then(actualizarEstadoPremium);

actualizarPantalla();

botonesGuardar.forEach((boton) => {

    boton.addEventListener("click", () => guardar(boton.dataset.tipo));

});

exportarBtn.addEventListener("click", exportarExcel);

borrarTodoBtn.addEventListener("click", borrarTodo);

entrada.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        // Ya no alcanza con Enter: el tipo lo elige el botón,
        // así que no adivinamos por el usuario.
        mostrar(t("msj.elegirTipo"), "#ef6c00");

    }

});

function interpretarGasto(texto){

    texto = texto.toLowerCase().trim();

    const idioma = idiomaConfig();

    // Elimina la palabra de moneda propia del idioma ("pesos", "dollars"...)
    texto = texto.replace(idioma.patronMoneda,"");

    // Convierte "58 mil" / "58 thousand" / "58 mila" en "58000"
    texto = texto.replace(idioma.patronMillar,(m,n)=>Number(n)*1000);

    // Elimina puntos, comas y espacios del número
    texto = texto.replace(/(\d)[., ](?=\d)/g,"$1");

    const numeros = texto.match(/\d+/g);

    if(!numeros){

        return null;

 }

const monto = Number(numeros[numeros.length - 1]);

const concepto = texto
    .replace(numeros[numeros.length - 1], "")
    .replace(/\s+/g, " ")
    .trim();

return {
    concepto:
        concepto.charAt(0).toUpperCase() +
        concepto.slice(1),

    monto
};

}

function guardar(tipo) {

    if (!esTipoValido(tipo)) {

        mostrar(t("msj.elegirTipo"), "#ef6c00");

        return;

    }

    const texto = entrada.value.trim();

    if (texto === "") {

        mostrar(t("msj.escribirGasto"), "#d32f2f");

        return;

    }

    const gastoInterpretado = interpretarGasto(texto);

if(!gastoInterpretado){

    mostrar(t("msj.noEntendi"), "#d32f2f");

    return;

}

const concepto = gastoInterpretado.concepto;

const monto = gastoInterpretado.monto;

    botonesGuardar.forEach((boton) => {

        boton.disabled = true;

    });

    const ahora = new Date();

    const gasto = {

        id: Date.now(),

        concepto,

        monto,

        tipo,

        // Guardado siempre en es-AR (DD/MM/AAAA, HH:MM:SS 24hs) sin
        // importar el idioma de la interfaz: es el formato "canónico"
        // que después parsean fechaDeGasto() y los filtros. Lo que
        // varía por idioma es solo cómo se MUESTRA (fechaParaMostrar/
        // horaParaMostrar), no cómo se guarda.
        fecha: ahora.toLocaleDateString("es-AR"),

        hora: ahora.toLocaleTimeString("es-AR")

    };

    historial.unshift(gasto);

    guardarHistorial();

    if (filtroActivo === "todo") {

        // Sin filtro no hace falta reiniciar nada:
        // así no se pierde el "Ver más" que ya hayas abierto.
        actualizarPantalla();

    } else {

        // Con un filtro activo el gasto nuevo podría no pertenecer
        // al período, así que volvemos a "Todo" para que se vea.
        aplicarFiltro("todo");

    }

    sonidoGuardar.currentTime = 0;

    sonidoGuardar.play().catch(() => {});

    entrada.value = "";

    botonesGuardar.forEach((boton) => {

        boton.disabled = false;

    });

    entrada.focus();

    mostrar(
        t("msj.guardadoComo", { tipo: t("tipos." + tipo).toLowerCase() }),
        "#2e7d32"
    );

}
// =====================================
// Filtro por período
// =====================================

function inicioDelDia(fecha) {

    return new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate()
    );

}

// Devuelve la fecha de un gasto a medianoche, para comparar por día.
function fechaDeGasto(gasto) {

    // "15/08/2026" (formato canónico, siempre es-AR sin importar
    // el idioma de la interfaz; ver el comentario en guardar()).
    const partes = String(gasto.fecha || "").split("/");

    if (partes.length === 3) {

        const dia = Number(partes[0]);
        const mes = Number(partes[1]);
        const anio = Number(partes[2]);

        if (dia && mes && anio) {

            return new Date(anio, mes - 1, dia);

        }

    }

    // Respaldo: el id se creó con Date.now(), así que
    // los gastos viejos también se pueden filtrar.
    const marca = Number(gasto.id);

    if (Number.isFinite(marca) && marca > 0) {

        return inicioDelDia(new Date(marca));

    }

    return null;

}

// Convierte la fecha canónica guardada al orden que corresponda
// para mostrarla (DD/MM/AAAA o MM/DD/AAAA según el idioma).
function fechaParaMostrar(gasto) {

    const fecha = fechaDeGasto(gasto);

    if (!fecha) {

        return gasto.fecha || "";

    }

    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();

    return idiomaConfig().ordenFecha === "MDY"
        ? mes + "/" + dia + "/" + anio
        : dia + "/" + mes + "/" + anio;

}

// La hora también se guarda siempre en 24hs (HH:MM:SS); acá se
// adapta a 12hs con AM/PM si el idioma lo usa.
function horaParaMostrar(gasto) {

    const partes = String(gasto.hora || "").split(":");

    if (partes.length < 3) {

        return gasto.hora || "";

    }

    const horas = Number(partes[0]) || 0;
    const minutos = partes[1].padStart(2, "0");
    const segundos = partes[2].padStart(2, "0");

    if (!idiomaConfig().hora12) {

        return String(horas).padStart(2, "0") + ":" + minutos + ":" + segundos;

    }

    const sufijo = horas >= 12 ? "PM" : "AM";

    let horas12 = horas % 12;

    if (horas12 === 0) {

        horas12 = 12;

    }

    return horas12 + ":" + minutos + ":" + segundos + " " + sufijo;

}

// Un <input type="date"> devuelve "2026-08-15". Lo armamos a mano
// porque new Date("2026-08-15") lo interpreta como UTC y se corre un día.
function fechaDesdeInput(valor) {

    if (!valor) {

        return null;

    }

    const partes = valor.split("-");

    const anio = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    if (!anio || !mes || !dia) {

        return null;

    }

    return new Date(anio, mes - 1, dia);

}

// Lo armamos a mano: toLocaleDateString con "2-digit" no
// devuelve lo mismo en todos los navegadores. El orden (DD/MM o
// MM/DD) sale del idioma actual.
function formatoCorto(fecha) {

    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");

    return idiomaConfig().ordenFecha === "MDY"
        ? mes + "/" + dia
        : dia + "/" + mes;

}

function rangoDelFiltro() {

    const hoy = inicioDelDia(new Date());

    if (filtroActivo === "semana") {

        const desde = new Date(hoy);

        // Últimos 7 días, incluyendo hoy.
        desde.setDate(desde.getDate() - 6);

        return {
            desde,
            hasta: hoy,
            etiqueta: t("resumen.ultimaSemana")
        };

    }

    if (filtroActivo === "mes") {

        return {
            desde: new Date(hoy.getFullYear(), hoy.getMonth(), 1),
            hasta: hoy,
            etiqueta: t("resumen.esteMes")
        };

    }

    if (filtroActivo === "rango" && (desdeElegido || hastaElegido)) {

        let desde = desdeElegido;
        let hasta = hastaElegido;

        // Si las cargó al revés, las damos vuelta.
        if (desde && hasta && desde > hasta) {

            const aux = desde;
            desde = hasta;
            hasta = aux;

        }

        const etiqueta =
            desde && hasta
                ? formatoCorto(desde) + " – " + formatoCorto(hasta)
                : desde
                    ? t("resumen.desdeCorto", { fecha: formatoCorto(desde) })
                    : t("resumen.hastaCorto", { fecha: formatoCorto(hasta) });

        return { desde, hasta, etiqueta };

    }

    return {
        desde: null,
        hasta: null,
        etiqueta: t("resumen.acumulado")
    };

}

function gastosFiltrados() {

    const { desde, hasta } = rangoDelFiltro();

    if (!desde && !hasta) {

        return historial;

    }

    return historial.filter((gasto) => {

        const fecha = fechaDeGasto(gasto);

        if (!fecha) {

            return false;

        }

        if (desde && fecha < desde) {

            return false;

        }

        if (hasta && fecha > hasta) {

            return false;

        }

        return true;

    });

}

function aplicarFiltro(nuevoFiltro) {

    // El filtro por rango de fechas es premium. Si todavía no se
    // compró, no se aplica: se avisa y se mantiene el filtro anterior.
    if (nuevoFiltro === "rango" && !esPremium()) {

        mostrar(t("premium.filtroRangoBloqueado"), "#ef6c00");

        return;

    }

    filtroActivo = nuevoFiltro;

    // Al cambiar de período volvemos a la primera tanda.
    mostrando = TAMANIO_TANDA;

    chips.forEach((chip) => {

        chip.classList.toggle(
            "activo",
            chip.dataset.filtro === filtroActivo
        );

    });

    rangoFechas.classList.toggle("oculto", filtroActivo !== "rango");

    actualizarPantalla();

}

chips.forEach((chip) => {

    chip.addEventListener("click", () => {

        aplicarFiltro(chip.dataset.filtro);

    });

});

[fechaDesde, fechaHasta].forEach((input) => {

    input.addEventListener("change", () => {

        desdeElegido = fechaDesdeInput(fechaDesde.value);
        hastaElegido = fechaDesdeInput(fechaHasta.value);

        aplicarFiltro("rango");

    });

});

// =====================================
// Pestañas: Gastos / Estadísticas / Metas
// =====================================

function activarVista(vista) {

    vistaActual = vista;

    tabs.forEach((tab) => {

        tab.classList.toggle("activo", tab.dataset.vista === vista);

    });

    vistaGastosEls.forEach((el) => {

        el.classList.toggle("oculto", vista !== "gastos");

    });

    vistaEstadisticas.classList.toggle("oculto", vista !== "estadisticas");
    vistaMetas.classList.toggle("oculto", vista !== "metas");

    sincronizarBannerPremium();

    // Si la función es premium y todavía no se compró, lo que se ve
    // es el candado (ver actualizarEstadoPremium): no tiene sentido
    // dibujar gráficos ni la meta detrás de él.
    if (vista === "estadisticas" && esPremium()) {

        // Recién acá tiene sentido dibujar: si los gráficos se crean
        // con el canvas oculto, Chart.js los mide en 0x0 y quedan rotos.
        actualizarGraficos();

    }

    if (vista === "metas" && esPremium()) {

        actualizarVistaMetas();

    }

}

tabs.forEach((tab) => {

    tab.addEventListener("click", () => activarVista(tab.dataset.vista));

});

// =====================================
// Premium: banner, candados y compra
// =====================================

// El banner de upgrade solo tiene sentido en la pestaña de Gastos
// (en Estadísticas/Metas ya está el candado con su propio botón) y
// solo si todavía no es premium.
function sincronizarBannerPremium() {

    const mostrarBanner = vistaActual === "gastos" && !esPremium();

    bannerPremium.classList.toggle("oculto", !mostrarBanner);

}

// Se llama al arrancar, después de comprar, después de sincronizar
// con Play, y desde el modo de prueba (antsDevPremium). Es la única
// función que decide qué se ve bloqueado y qué no.
function actualizarEstadoPremium() {

    const premium = esPremium();

    badgePremium.classList.toggle("oculto", !premium);

    candadoEstadisticas.classList.toggle("oculto", premium);
    contenidoEstadisticas.classList.toggle("oculto", !premium);

    candadoMetas.classList.toggle("oculto", premium);
    contenidoMetas.classList.toggle("oculto", !premium);

    chipRango.classList.toggle("bloqueado", !premium);

    // Si se pierde el premium (solo pasa en modo de prueba) con el
    // filtro por rango activo, volvemos a "todo" en vez de dejar
    // aplicado un filtro que ya no debería estar disponible.
    if (!premium && filtroActivo === "rango") {

        aplicarFiltro("todo");

    }

    sincronizarBannerPremium();

    if (premium) {

        if (vistaActual === "estadisticas") {

            actualizarGraficos();

        }

        if (vistaActual === "metas") {

            actualizarVistaMetas();

        }

    }

}

async function iniciarCompraPremium() {

    if (!digitalGoodsDisponible()) {

        mostrar(t("premium.noDisponible"), "#ef6c00");

        return;

    }

    botonesComprarPremium.forEach((boton) => { boton.disabled = true; });

    mostrar(t("premium.comprando"), "#5c3dd6");

    const resultado = await comprarPremium();

    botonesComprarPremium.forEach((boton) => { boton.disabled = false; });

    if (resultado === "ok") {

        guardarPremiumLocal("compra");

        actualizarEstadoPremium();

        mostrar(t("premium.gracias"), "#2e7d32");

    } else if (resultado === "cancelado") {

        mostrar(t("premium.cancelada"), "#ef6c00");

    } else {

        mostrar(t("premium.errorCompra"), "#d32f2f");

    }

}

botonesComprarPremium.forEach((boton) => {

    boton.addEventListener("click", iniciarCompraPremium);

});

// =====================================
// Metas de gasto
// =====================================

function leerMeta() {

    try {

        const guardado = JSON.parse(localStorage.getItem("ants_meta"));

        if (guardado && Number(guardado.monto) > 0) {

            return { monto: Number(guardado.monto) };

        }

    } catch (e) {}

    return null;

}

function guardarMetaLocal(monto) {

    localStorage.setItem("ants_meta", JSON.stringify({ monto }));

}

// El gasto del mes en curso, sin importar el filtro de período
// elegido (igual que "Hoy" en el resumen).
function gastadoDelMesActual() {

    const hoy = inicioDelDia(new Date());
    const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    return sumar(historial.filter((gasto) => {

        const fecha = fechaDeGasto(gasto);

        return fecha && fecha >= desde && fecha <= hoy;

    }));

}

function actualizarVistaMetas() {

    const meta = leerMeta();

    metaInput.value = meta ? meta.monto : "";

    if (!meta) {

        metaSinDefinir.classList.remove("oculto");
        metaDefinida.classList.add("oculto");

        return;

    }

    metaSinDefinir.classList.add("oculto");
    metaDefinida.classList.remove("oculto");

    const gastado = gastadoDelMesActual();
    const porcentaje = Math.min(100, Math.round((gastado / meta.monto) * 100));

    barraMetaProgreso.style.width = porcentaje + "%";
    barraMetaProgreso.className = "barraMetaProgreso " +
        (gastado > meta.monto ? "superada" : porcentaje >= 80 ? "cerca" : "");

    metaTexto.textContent = t("metas.gastadoDe", {
        gastado: "$ " + gastado.toLocaleString(localeActual()),
        meta: "$ " + meta.monto.toLocaleString(localeActual())
    });

    if (gastado > meta.monto) {

        metaAlerta.textContent = t("metas.alertaSuperada");
        metaAlerta.className = "metaAlerta superada";

    } else if (porcentaje >= 80) {

        metaAlerta.textContent = t("metas.alertaCerca");
        metaAlerta.className = "metaAlerta cerca";

    } else {

        metaAlerta.classList.add("oculto");

        return;

    }

    metaAlerta.classList.remove("oculto");

}

guardarMetaBtn.addEventListener("click", () => {

    const valor = Number(metaInput.value);

    if (!valor || valor <= 0) {

        mostrar(t("metas.montoInvalido"), "#d32f2f");

        return;

    }

    guardarMetaLocal(valor);

    actualizarVistaMetas();

    mostrar(t("metas.metaGuardada"), "#2e7d32");

});

// =====================================
// Actualizar pantalla
// =====================================

function actualizarPantalla() {

    const filtrados = gastosFiltrados();

    actualizarTotales(filtrados);

    renderizarLista(filtrados);

    if (vistaActual === "estadisticas" && esPremium()) {

        actualizarGraficos();

    }

    if (vistaActual === "metas" && esPremium()) {

        actualizarVistaMetas();

    }

}

// -------------------------------------
// Totales: recorren TODO el historial,
// no solo lo que está dibujado en pantalla.
// -------------------------------------

// "3 gastos" / "1 gasto" (o su equivalente traducido).
function textoCantidad(n) {

    return n + " " + (n === 1 ? t("resumen.gasto") : t("resumen.gastos"));

}

function actualizarTotales(filtrados) {

    const hoy = inicioDelDia(new Date()).getTime();

    // "Hoy" siempre mira el historial completo,
    // no lo afecta el filtro elegido.
    const gastosDeHoy = historial.filter((gasto) => {

        const fecha = fechaDeGasto(gasto);

        return fecha && fecha.getTime() === hoy;

    });

    totalHoy.textContent = "$ " + sumar(gastosDeHoy).toLocaleString(localeActual());

    cantidadHoy.textContent = textoCantidad(gastosDeHoy.length);

    renderDesglose(desgloseHoy, gastosDeHoy);

    // El segundo bloque sí responde al filtro.
    etiquetaPeriodo.textContent = rangoDelFiltro().etiqueta;

    totalGeneral.textContent = "$ " + sumar(filtrados).toLocaleString(localeActual());

    cantidadGeneral.textContent = textoCantidad(filtrados.length);

    renderDesglose(desglosePeriodo, filtrados);

}

function sumar(gastos) {

    return gastos.reduce(
        (total, gasto) => total + (Number(gasto.monto) || 0),
        0
    );

}

// Tres líneas por tipo (verde / naranja / rojo) debajo del total.
// "Sin clasificar" solo aparece si hay gastos viejos sin tipo.
function renderDesglose(contenedor, gastos) {

    contenedor.innerHTML = "";

    const sumas = {
        necesario: 0,
        evitable: 0,
        innecesario: 0,
        sin: 0
    };

    gastos.forEach((gasto) => {

        const clave = esTipoValido(gasto.tipo) ? gasto.tipo : "sin";

        sumas[clave] += Number(gasto.monto) || 0;

    });

    Object.keys(sumas).forEach((clave) => {

        if (clave === "sin" && sumas.sin === 0) {

            return;

        }

        const fila = document.createElement("li");

        const punto = document.createElement("span");
        punto.className = "punto tipo-" + clave;

        const nombre = document.createElement("span");
        nombre.className = "desgloseNombre";
        nombre.textContent = clave === "sin" ? t("tipos.sin") : t("tipos." + clave);

        const monto = document.createElement("strong");
        monto.textContent = "$ " + sumas[clave].toLocaleString(localeActual());

        fila.append(punto, nombre, monto);

        contenedor.appendChild(fila);

    });

}

// =====================================
// Gráficos de estadísticas
// =====================================

// Suma del período filtrado, por tipo. Solo las tres categorías
// pedidas: los gastos "Sin clasificar" no entran en la torta.
function datosTorta() {

    const sumas = { necesario: 0, evitable: 0, innecesario: 0 };

    gastosFiltrados().forEach((gasto) => {

        if (sumas.hasOwnProperty(gasto.tipo)) {

            sumas[gasto.tipo] += Number(gasto.monto) || 0;

        }

    });

    return sumas;

}

// Los 6 meses hasta el actual, más viejo primero. No depende
// del filtro de período: siempre mira el historial completo.
function ultimosSeisMeses() {

    const ahora = new Date();
    const meses = [];
    const mesesCortos = idiomaConfig().mesesCortos;

    for (let i = 5; i >= 0; i--) {

        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);

        meses.push({
            anio: fecha.getFullYear(),
            mes: fecha.getMonth(),
            etiqueta: mesesCortos[fecha.getMonth()]
        });

    }

    return meses;

}

function datosBarras() {

    const meses = ultimosSeisMeses();

    const sumas = meses.map(() => ({
        necesario: 0,
        evitable: 0,
        innecesario: 0
    }));

    historial.forEach((gasto) => {

        const fecha = fechaDeGasto(gasto);

        if (!fecha) {

            return;

        }

        const indice = meses.findIndex((mes) =>
            mes.anio === fecha.getFullYear() && mes.mes === fecha.getMonth()
        );

        if (indice === -1 || !sumas[indice].hasOwnProperty(gasto.tipo)) {

            return;

        }

        sumas[indice][gasto.tipo] += Number(gasto.monto) || 0;

    });

    return {
        etiquetas: meses.map((mes) => mes.etiqueta),
        sumas
    };

}

function actualizarGraficos() {

    actualizarGraficoTorta();

    actualizarGraficoBarras();

}

function actualizarGraficoTorta() {

    const sumas = datosTorta();

    const total = sumas.necesario + sumas.evitable + sumas.innecesario;

    tituloTorta.textContent = rangoDelFiltro().etiqueta;

    // Sin gastos en el período, una torta vacía no dice nada:
    // mostramos un aviso en su lugar.
    if (total === 0) {

        canvasTorta.classList.add("oculto");
        tortaVacio.classList.remove("oculto");

        if (graficoTorta) {

            graficoTorta.destroy();
            graficoTorta = null;

        }

        return;

    }

    canvasTorta.classList.remove("oculto");
    tortaVacio.classList.add("oculto");

    const datos = [sumas.necesario, sumas.evitable, sumas.innecesario];

    if (graficoTorta) {

        graficoTorta.data.datasets[0].data = datos;

        graficoTorta.update();

        return;

    }

    graficoTorta = new Chart(canvasTorta, {

        type: "pie",

        data: {

            labels: [t("tipos.necesario"), t("tipos.evitable"), t("tipos.innecesario")],

            datasets: [{

                data: datos,

                backgroundColor: [
                    COLORES_TIPO.necesario,
                    COLORES_TIPO.evitable,
                    COLORES_TIPO.innecesario
                ],

                borderColor: "#fff",
                borderWidth: 2

            }]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {

                legend: {
                    position: "bottom",
                    labels: { boxWidth: 12, padding: 14, font: { size: 12 } }
                },

                tooltip: {
                    callbacks: {
                        label: (ctx) =>
                            ctx.label + ": $ " +
                            ctx.parsed.toLocaleString(localeActual())
                    }
                }

            }

        }

    });

}

function actualizarGraficoBarras() {

    const { etiquetas, sumas } = datosBarras();

    const dataNecesario = sumas.map((s) => s.necesario);
    const dataEvitable = sumas.map((s) => s.evitable);
    const dataInnecesario = sumas.map((s) => s.innecesario);

    if (graficoBarras) {

        graficoBarras.data.labels = etiquetas;
        graficoBarras.data.datasets[0].data = dataNecesario;
        graficoBarras.data.datasets[1].data = dataEvitable;
        graficoBarras.data.datasets[2].data = dataInnecesario;

        graficoBarras.update();

        return;

    }

    graficoBarras = new Chart(canvasBarras, {

        type: "bar",

        data: {

            labels: etiquetas,

            datasets: [
                {
                    label: t("tipos.necesario"),
                    data: dataNecesario,
                    backgroundColor: COLORES_TIPO.necesario
                },
                {
                    label: t("tipos.evitable"),
                    data: dataEvitable,
                    backgroundColor: COLORES_TIPO.evitable
                },
                {
                    label: t("tipos.innecesario"),
                    data: dataInnecesario,
                    backgroundColor: COLORES_TIPO.innecesario
                }
            ]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            scales: {

                x: { stacked: true, grid: { display: false } },

                y: {
                    stacked: true,
                    ticks: {
                        callback: (valor) =>
                            "$" + Number(valor).toLocaleString(localeActual())
                    }
                }

            },

            plugins: {

                legend: {
                    position: "bottom",
                    labels: { boxWidth: 12, padding: 14, font: { size: 12 } }
                },

                tooltip: {
                    callbacks: {
                        label: (ctx) =>
                            ctx.dataset.label + ": $ " +
                            ctx.parsed.y.toLocaleString(localeActual())
                    }
                }

            }

        }

    });

}

// -------------------------------------
// Lista
// -------------------------------------

function renderizarLista(filtrados) {

    lista.innerHTML = "";

    tituloHistorial.textContent =
        filtroActivo === "todo"
            ? t("historial.ultimosGastos")
            : t("historial.gastosPeriodo");

    if (filtrados.length === 0) {

        const vacio = document.createElement("li");

        vacio.className = "vacio";

        vacio.textContent =
            historial.length === 0
                ? t("historial.vacioTotal")
                : t("historial.vacioPeriodo");

        lista.appendChild(vacio);

        verMasBtn.classList.add("oculto");
        contadorHistorial.textContent = "";

        return;

    }

    // No dejamos que "mostrando" quede colgado por encima
    // del total tras borrar gastos o cambiar de filtro.
    mostrando = Math.min(
        Math.max(mostrando, TAMANIO_TANDA),
        filtrados.length
    );

    filtrados
        .slice(0, mostrando)
        .forEach((gasto) => lista.appendChild(crearItem(gasto)));

    const quedan = filtrados.length - mostrando;

    verMasBtn.classList.toggle("oculto", quedan <= 0);

    if (quedan > 0) {

        verMasBtn.textContent = t("historial.verMas", { n: quedan });

    }

    contadorHistorial.textContent =
        t("historial.mostrando", { n: mostrando, total: filtrados.length });

}

function crearItem(gasto) {

    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "itemInfo";

    const concepto = document.createElement("strong");
    concepto.textContent = gasto.concepto;

    const cuando = document.createElement("small");
    cuando.textContent = fechaParaMostrar(gasto) + " " + horaParaMostrar(gasto);

    const etiqueta = document.createElement("span");
    etiqueta.className =
        "etiquetaTipo tipo-" + (esTipoValido(gasto.tipo) ? gasto.tipo : "sin");
    etiqueta.textContent = nombreTipo(gasto.tipo);

    info.append(
        concepto,
        document.createElement("br"),
        cuando,
        etiqueta
    );

    const monto = document.createElement("strong");
    monto.textContent =
        "$ " + (Number(gasto.monto) || 0).toLocaleString(localeActual());

    const borrar = document.createElement("button");
    borrar.className = "eliminar";
    borrar.textContent = "🗑️";
    borrar.setAttribute("aria-label", t("historial.eliminarAria", { concepto: gasto.concepto }));
    borrar.addEventListener("click", () => eliminarGasto(gasto.id));

    li.append(info, monto, borrar);

    return li;

}

verMasBtn.addEventListener("click", () => {

    mostrando += TAMANIO_TANDA;

    renderizarLista(gastosFiltrados());

});

// =====================================
// Eliminar gasto
// =====================================

function eliminarGasto(id) {

    const indice = historial.findIndex((gasto) => gasto.id === id);

    if (indice === -1) {

        return;

    }

    if (!confirm(t("msj.confirmEliminarGasto"))) {

        return;

    }

    historial.splice(indice, 1);

    guardarHistorial();

    actualizarPantalla();

    mostrar(t("msj.gastoEliminado"), "#d32f2f");

}

// =====================================
// Mensajes
// =====================================

function mostrar(texto, color) {

    mensaje.textContent = texto;

    mensaje.style.color = color;

    setTimeout(() => {

        mensaje.textContent = "";

    }, 3000);

}
// =====================================
// Reconocimiento de voz
// =====================================

let reconocimiento = null;

if ("webkitSpeechRecognition" in window) {

    reconocimiento = new webkitSpeechRecognition();

    reconocimiento.lang = idiomaConfig().vozLang;
    reconocimiento.interimResults = false;
    reconocimiento.continuous = false;
    reconocimiento.maxAlternatives = 5;

    vozBtn.addEventListener("click", () => {

        reconocimiento.start();

    });

    reconocimiento.onresult = (e) => {

        entrada.value = e.results[0][0].transcript;
        entrada.focus();

    };

    reconocimiento.onerror = () => {

        mostrar(t("msj.vozError"), "#ef6c00");

    };

} else {

    vozBtn.style.display = "none";

}

// =====================================
// Marca personal
// =====================================

// Mientras no exista el archivo del logo, escondemos sus contenedores
// para que no quede el ícono de imagen rota.
document.querySelectorAll(".logoMarca").forEach((logo) => {

    logo.addEventListener("error", () => {

        logo.parentElement.style.display = "none";

    });

});

// =====================================
// Refrescar pantalla
// =====================================

window.addEventListener("focus", () => {

    historial = leerHistorial();

    actualizarPantalla();

    // Barato: si no hay Digital Goods API (no estamos en una TWA)
    // esto no hace nada. Si la hay, reconcilia con Play por si hubo
    // un reembolso u otro cambio mientras la app no tenía foco.
    sincronizarPremiumConPlay().then(actualizarEstadoPremium);

});

// =====================================
// Inicio
// =====================================

console.log("🐜 Ants 3.0 iniciado correctamente");

// =====================================
// Borrar todo
// =====================================

function borrarTodo() {

    if (historial.length === 0) {

        mostrar(t("msj.noHayGastos"), "#ef6c00");

        return;

    }

    // Ojo: borra todo, no solo el período filtrado.
    const aviso =
        filtroActivo === "todo"
            ? t("msj.confirmBorrarTodo")
            : t("msj.confirmBorrarTodoFiltrado", { n: historial.length });

    if (!confirm(aviso)) {

        return;

    }

    historial = [];

    mostrando = TAMANIO_TANDA;

    localStorage.removeItem("ants_historial");

    actualizarPantalla();

    mostrar(t("msj.historialEliminado"), "#d32f2f");

}
function exportarExcel(){

    // Se exporta lo que estás viendo: si hay un filtro activo,
    // el Excel sale con ese período.
    const aExportar = gastosFiltrados();

    if(aExportar.length===0){

        mostrar(t("msj.noHayParaExportar"), "#ef6c00");
        return;

    }

    const datos = aExportar.map(gasto => ({

        [t("excel.fecha")]: fechaParaMostrar(gasto),
        [t("excel.hora")]: horaParaMostrar(gasto),
        [t("excel.concepto")]: gasto.concepto,
        [t("excel.tipo")]: nombreTipo(gasto.tipo),
        [t("excel.monto")]: gasto.monto

    }));

    const hoja = XLSX.utils.json_to_sheet(datos);

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hoja, t("excel.hoja"));

    const hoy = new Date();

    const nombre =
        "Ants_" +
        hoy.toISOString().slice(0,10) +
        ".xlsx";

    XLSX.writeFile(libro, nombre);

    mostrar(t("msj.excelExportado"), "#2e7d32");

}
