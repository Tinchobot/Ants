// =====================================
// ANTS 3.0
// =====================================

const WEBHOOK = "https://hook.us2.make.com/ecky1ftg71ist2i2j3pgmvqcxk7ig77j";

const entrada = document.getElementById("entrada");
const guardarBtn = document.getElementById("guardar");
const vozBtn = document.getElementById("voz");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("listaHistorial");
const totalHoy = document.getElementById("totalHoy");
const cantidadHoy = document.getElementById("cantidadHoy");
const splash = document.getElementById("splash");
const app = document.getElementById("app");

let historial = JSON.parse(localStorage.getItem("ants_historial")) || [];

// Mostrar la app después del splash
setTimeout(() => {
    splash.style.display = "none";
    app.classList.remove("oculto");
    entrada.focus();
}, 2000);

// Cargar historial al iniciar
actualizarPantalla();

guardarBtn.addEventListener("click", guardar);

entrada.addEventListener("keydown", e => {
    if (e.key === "Enter") guardar();
});

// ---------------------------
// Guardar gasto
// ---------------------------
async function guardar() {

    const texto = entrada.value.trim();

    if (texto === "") {
        mostrar("Escribí un gasto.", "#d32f2f");
        return;
    }

    const partes = texto.split(" ");

    const monto = parseFloat(partes.pop().replace(",", "."));

    const concepto = partes.join(" ");

    if (!concepto || isNaN(monto)) {
        mostrar("Formato: Nafta 58000", "#d32f2f");
        return;
    }

    guardarBtn.disabled = true;
    guardarBtn.innerHTML = "⏳ Guardando...";

    const ahora = new Date();

    const gasto = {
        concepto,
        monto,
        fecha: ahora.toLocaleDateString("es-AR"),
        hora: ahora.toLocaleTimeString("es-AR")
    };

    historial.unshift(gasto);

    if (historial.length > 50)
        historial.pop();

    localStorage.setItem("ants_historial", JSON.stringify(historial));

    actualizarPantalla();

    try {

        await fetch(WEBHOOK, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                fecha: gasto.fecha,
                hora: gasto.hora,
                gasto: gasto.concepto,
                monto: gasto.monto
            })

        });

        mostrar("✅ Guardado correctamente", "#2e7d32");

    } catch {

        mostrar("📡 Sin conexión. Quedó guardado localmente.", "#ef6c00");

    }

    entrada.value = "";

    guardarBtn.disabled = false;
    guardarBtn.innerHTML = "💾 Guardar";

    entrada.focus();

}

// ---------------------------
// Historial
// ---------------------------

function actualizarPantalla() {

    lista.innerHTML = "";

    const hoy = new Date().toLocaleDateString("es-AR");

    let total = 0;
    let cantidad = 0;

    historial.slice(0, 10).forEach((item, index) => {

        if (item.fecha === hoy) {
            total += Number(item.monto);
            cantidad++;
        }

        const li = document.createElement("li");

        li.innerHTML = `
<div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
    <div>
        <span>${item.concepto}</span><br>
        <strong>$ ${Number(item.monto).toLocaleString("es-AR")}</strong>
    </div>

    <button class="eliminar" onclick="eliminarGasto(${index})">
        🗑️
    </button>
</div>
`;

        lista.appendChild(li);

    });

    if (historial.length === 0) {

        lista.innerHTML =
            "<li class='vacio'>Todavía no hay gastos.</li>";

    }

    totalHoy.innerHTML =
        "$ " + total.toLocaleString("es-AR");

    cantidadHoy.innerHTML =
        cantidad + (cantidad === 1 ? " gasto" : " gastos");

}

// ---------------------------
// Mensajes
// ---------------------------

function mostrar(texto, color) {

    mensaje.innerHTML = texto;

    mensaje.style.color = color;

    setTimeout(() => {

        mensaje.innerHTML = "";

    }, 3000);

}

// ---------------------------
// Reconocimiento de voz
// ---------------------------

if ("webkitSpeechRecognition" in window) {

    const reconocimiento = new webkitSpeechRecognition();

    reconocimiento.lang = "es-AR";

    reconocimiento.interimResults = false;

    reconocimiento.maxAlternatives = 1;

    vozBtn.addEventListener("click", () => {

        reconocimiento.start();

    });

    reconocimiento.onresult = e => {

        entrada.value =
            e.results[0][0].transcript;

    };

} else {

    vozBtn.style.display = "none";

}
function eliminarGasto(indice){

    if(!confirm("¿Eliminar este gasto?")) return;

    historial.splice(indice,1);

    localStorage.setItem(
        "ants_historial",
        JSON.stringify(historial)
    );

    actualizarPantalla();

}
