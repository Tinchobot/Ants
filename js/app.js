// =====================================
// ANTS 4.0
// app.js
// =====================================

// Elementos de la interfaz
const entrada = document.getElementById("entrada");
const guardarBtn = document.getElementById("guardar");
const vozBtn = document.getElementById("voz");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("listaHistorial");
const totalHoy = document.getElementById("totalHoy");
const cantidadHoy = document.getElementById("cantidadHoy");
const splash = document.getElementById("splash");
const app = document.getElementById("app");

const sonidoGuardar = new Audio("audio/guardar.mp3");

// Historial en memoria
let historial = obtenerHistorial();

// ----------------------------
// Inicio
// ----------------------------

window.addEventListener("load", () => {

    setTimeout(() => {

        splash.style.display = "none";

        app.classList.remove("oculto");

        entrada.focus();

    }, 1800);

    actualizarPantalla();

});

// ----------------------------
// Eventos
// ----------------------------

guardarBtn.addEventListener("click", guardar);

entrada.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        guardar();

    }

});

vozBtn.addEventListener("click", () => {

    iniciarVoz(entrada);

});
// ----------------------------
// Guardar gasto
// ----------------------------

async function guardar() {

    const texto = entrada.value.trim();

    if (texto === "") {

        mostrar("Escribí un gasto.", "#d32f2f");
        return;

    }

    const resultado = parsearMonto(texto);

    if (!resultado) {

        mostrar("No pude interpretar el monto.", "#d32f2f");
        return;

    }

    const gasto = {

        id: Date.now(),

        concepto: resultado.concepto,

        monto: resultado.monto,

        fecha: new Date().toLocaleDateString("es-AR"),

        hora: new Date().toLocaleTimeString("es-AR")

    };

    historial = agregarGasto(gasto);

    actualizarPantalla();

    entrada.value = "";

    entrada.focus();

    sonidoGuardar.currentTime = 0;
    sonidoGuardar.play().catch(() => {});

    mostrar("✅ Guardado", "#2e7d32");

    const ok = await enviarGasto(gasto);

    if (!ok) {

        mostrar(
            "📡 Sin conexión. Se sincronizará luego.",
            "#ef6c00"
        );

    }

}
// ----------------------------
// Guardar gasto
// ----------------------------

async function guardar() {

    const texto = entrada.value.trim();

    if (texto === "") {

        mostrar("Escribí un gasto.", "#d32f2f");
        return;

    }

    const resultado = parsearMonto(texto);

    if (!resultado) {

        mostrar("No pude interpretar el monto.", "#d32f2f");
        return;

    }

    const gasto = {

        id: Date.now(),

        concepto: resultado.concepto,

        monto: resultado.monto,

        fecha: new Date().toLocaleDateString("es-AR"),

        hora: new Date().toLocaleTimeString("es-AR")

    };

    historial = agregarGasto(gasto);

    actualizarPantalla();

    entrada.value = "";

    entrada.focus();

    sonidoGuardar.currentTime = 0;
    sonidoGuardar.play().catch(() => {});

    mostrar("✅ Guardado", "#2e7d32");

    const ok = await enviarGasto(gasto);

    if (!ok) {

        mostrar(
            "📡 Sin conexión. Se sincronizará luego.",
            "#ef6c00"
        );

    }

}
