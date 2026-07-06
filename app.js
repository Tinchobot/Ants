// =====================================
// ANTS 1.0
// =====================================

const WEBHOOK = "https://hook.us2.make.com/ecky1ftg71ist2i2j3pgmvqcxk7ig77j";

// Elementos
const entrada = document.getElementById("entrada");
const guardarBtn = document.getElementById("guardar");
const vozBtn = document.getElementById("voz");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("listaHistorial");
const totalHoy = document.getElementById("totalHoy");
const cantidadHoy = document.getElementById("cantidadHoy");
const splash = document.getElementById("splash");
const app = document.getElementById("app");

const sonidoGuardar = new Audio("guardar.mp3");

// Historial

let historial =
JSON.parse(localStorage.getItem("ants_historial")) || [];

// Splash

setTimeout(() => {

    splash.style.display = "none";

    app.classList.remove("oculto");

    entrada.focus();

}, 1800);

// Inicio

actualizarPantalla();

guardarBtn.addEventListener("click", guardar);

entrada.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        guardar();

    }

});
async function guardar() {

    const texto = entrada.value.trim();

    if (texto === "") {

        mostrar("Escribí un gasto.", "#d32f2f");

        return;

    }

    const partes = texto.split(/\s+/);

    if (partes.length < 2) {

        mostrar("Formato: Nafta 58000", "#d32f2f");

        return;

    }

    let montoTexto = partes.pop();

    const concepto = partes.join(" ");

    if (montoTexto.includes(",")) {

        montoTexto = montoTexto
            .replace(/\./g, "")
            .replace(",", ".");

    } else {

        montoTexto = montoTexto.replace(/\./g, "");

    }

    const monto = Number(montoTexto);

    if (isNaN(monto)) {

        mostrar("Monto inválido", "#d32f2f");

        return;

    }

    guardarBtn.disabled = true;

    guardarBtn.textContent = "Guardando...";

    const ahora = new Date();

    const gasto = {

        id: Date.now(),

        concepto,

        monto,

        fecha: ahora.toLocaleDateString("es-AR"),

        hora: ahora.toLocaleTimeString("es-AR")

    };

    historial.unshift(gasto);

    localStorage.setItem(
        "ants_historial",
        JSON.stringify(historial)
    );

    actualizarPantalla();

    try {

        await fetch(WEBHOOK, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(gasto)

        });

    } catch (e) {

        console.log(e);

    }

    sonidoGuardar.currentTime = 0;

    sonidoGuardar.play().catch(() => {});

    entrada.value = "";

    guardarBtn.disabled = false;

    guardarBtn.textContent = "💾 Guardar";

    entrada.focus();

    mostrar("✅ Guardado", "#2e7d32");

}
// =====================================
// Actualizar pantalla
// =====================================

function actualizarPantalla() {

    lista.innerHTML = "";

    const hoy = new Date().toLocaleDateString("es-AR");

    let total = 0;
    let cantidad = 0;

    if (historial.length === 0) {

        lista.innerHTML =
            "<li class='vacio'>Todavía no hay gastos.</li>";

    } else {

        historial.slice(0, 10).forEach((gasto, indice) => {

            if (gasto.fecha === hoy) {

                total += Number(gasto.monto);
                cantidad++;

            }

            const li = document.createElement("li");

            li.innerHTML = `
                <div style="flex:1">
                    <strong>${gasto.concepto}</strong><br>
                    <small>${gasto.fecha} ${gasto.hora}</small>
                </div>

                <strong>
                    $ ${Number(gasto.monto).toLocaleString("es-AR")}
                </strong>

                <button
                    class="eliminar"
                    onclick="eliminarGasto(${indice})">
                    🗑️
                </button>
            `;

            lista.appendChild(li);

        });

    }

    totalHoy.textContent =
        "$ " + total.toLocaleString("es-AR");

    cantidadHoy.textContent =
        cantidad + (cantidad === 1 ? " gasto" : " gastos");

}

// =====================================
// Eliminar gasto
// =====================================

function eliminarGasto(indice) {

    if (!confirm("¿Eliminar este gasto?")) {

        return;

    }

    historial.splice(indice, 1);

    localStorage.setItem(
        "ants_historial",
        JSON.stringify(historial)
    );

    actualizarPantalla();

    mostrar("🗑️ Gasto eliminado", "#d32f2f");

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

if ("webkitSpeechRecognition" in window) {

    const reconocimiento = new webkitSpeechRecognition();

    reconocimiento.lang = "es-AR";
    reconocimiento.interimResults = false;
    reconocimiento.continuous = false;
    reconocimiento.maxAlternatives = 1;

    vozBtn.addEventListener("click", () => {

        reconocimiento.start();

    });

    reconocimiento.onresult = (e) => {

        entrada.value = e.results[0][0].transcript;
        entrada.focus();

    };

    reconocimiento.onerror = () => {

        mostrar("No pude reconocer la voz.", "#ef6c00");

    };

} else {

    vozBtn.style.display = "none";

}

// =====================================
// Eventos de conexión
// =====================================

window.addEventListener("online", () => {

    mostrar("🌐 Conexión restablecida", "#2e7d32");

});

window.addEventListener("offline", () => {

    mostrar("📡 Sin conexión", "#ef6c00");

});

// =====================================
// Refrescar pantalla
// =====================================

window.addEventListener("focus", () => {

    historial = JSON.parse(
        localStorage.getItem("ants_historial")
    ) || [];

    actualizarPantalla();

});

// =====================================
// Inicio
// =====================================

console.log("🐜 Ants 1.0 iniciado correctamente");

// =====================================
// Borrar todo
// =====================================

function borrarTodo() {

    if (historial.length === 0) {

        mostrar("No hay gastos.", "#ef6c00");

        return;

    }

    if (!confirm("¿Eliminar TODOS los gastos?")) {

        return;

    }

    historial = [];

    localStorage.removeItem("ants_historial");

    actualizarPantalla();

    mostrar("🗑️ Historial eliminado", "#d32f2f");

}
