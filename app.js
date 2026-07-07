// =====================================
// ANTS 1.0
// =====================================

const WEBHOOK = "https://hook.us2.make.com/ecky1ftg71ist2i2j3pgmvqcxk7ig77j";

// Elementos
const entrada = document.getElementById("entrada");
const guardarBtn = document.getElementById("guardar");
const vozBtn = document.getElementById("voz");
const exportarBtn = document.getElementById("exportar");
const borrarTodoBtn = document.getElementById("borrarTodo");
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

exportarBtn.addEventListener("click", exportarExcel);

borrarTodoBtn.addEventListener("click", borrarTodo);

entrada.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        
        guardar();

    }

});

function interpretarGasto(texto){

    texto = texto.toLowerCase().trim();

    // Elimina "pesos"
    texto = texto.replace(/\bpesos?\b/g,"");

    // Convierte "58 mil" en "58000"
    texto = texto.replace(/(\d+)\s*mil\b/g,(m,n)=>Number(n)*1000);

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
    
async function guardar() {

    const texto = entrada.value.trim();

    if (texto === "") {

        mostrar("Escribí un gasto.", "#d32f2f");

        return;

    }

    const gastoInterpretado = interpretarGasto(texto);

if(!gastoInterpretado){

    mostrar("No entendí el gasto.", "#d32f2f");

    return;

}

const concepto = gastoInterpretado.concepto;

const monto = gastoInterpretado.monto;

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
    reconocimiento.maxAlternatives = 5;

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
function exportarExcel(){

    if(historial.length===0){

        mostrar("No hay gastos para exportar.", "#ef6c00");
        return;

    }

    const datos = historial.map(gasto => ({

        Fecha: gasto.fecha,
        Hora: gasto.hora,
        Concepto: gasto.concepto,
        Monto: gasto.monto

    }));

    const hoja = XLSX.utils.json_to_sheet(datos);

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hoja, "Gastos");

    const hoy = new Date();

    const nombre =
        "Ants_" +
        hoy.toISOString().slice(0,10) +
        ".xlsx";

    XLSX.writeFile(libro, nombre);

    mostrar("📄 Excel exportado", "#2e7d32");

}
