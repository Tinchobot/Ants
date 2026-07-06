// =====================================
// ANTS 3.1
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

const sonidoGuardar = new Audio("guardar.mp3");

let historial =
JSON.parse(localStorage.getItem("ants_historial")) || [];

// ---------------------------
// Splash
// ---------------------------

setTimeout(() => {

    splash.style.display = "none";

    app.classList.remove("oculto");

    entrada.focus();

},2000);

// ---------------------------
// Inicio
// ---------------------------

actualizarPantalla();

guardarBtn.addEventListener("click",guardar);

entrada.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        guardar();

    }

});

// ---------------------------
// Guardar
// ---------------------------

async function guardar(){

    const texto=entrada.value.trim();

    if(texto===""){

        mostrar("Escribí un gasto","#d32f2f");

        return;

    }

   // Interpretar concepto y monto

const partes = texto.trim().split(/\s+/);

if (partes.length < 2) {

    mostrar("Formato: Nafta 58000", "#d32f2f");

    return;

}

let montoTexto = partes.pop();

const concepto = partes.join(" ");

// Argentina:
// 100.000 -> 100000
// 100 000 -> 100000
// 1.250.000 -> 1250000
// 100,50 -> 100.50

if (montoTexto.includes(",")) {

    montoTexto = montoTexto
        .replace(/\./g, "")
        .replace(",", ".");

} else {

    montoTexto = montoTexto.replace(/\./g, "");

}

const monto = Number(montoTexto);

if (!Number.isFinite(monto)) {

    mostrar("Monto inválido", "#d32f2f");

    return;

}

    }

    guardarBtn.disabled=true;

    guardarBtn.innerHTML="⏳ Guardando...";

    const ahora=new Date();

    const gasto={

        id:Date.now(),

        concepto,

        monto,

        fecha:ahora.toLocaleDateString("es-AR"),

        hora:ahora.toLocaleTimeString("es-AR")

    };

    historial.unshift(gasto);

    if(historial.length>100){

        historial.pop();

    }

    localStorage.setItem(

        "ants_historial",

        JSON.stringify(historial)

    );

    actualizarPantalla();

    try{

        const respuesta=await fetch(

            WEBHOOK,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    id:gasto.id,

                    fecha:gasto.fecha,

                    hora:gasto.hora,

                    gasto:gasto.concepto,

                    monto:gasto.monto

                })

            }

        );

        if(!respuesta.ok){

            throw new Error();

        }

        sonidoGuardar.currentTime=0;

        sonidoGuardar.play().catch(()=>{});

        mostrar(

            "✅ Guardado correctamente",

            "#2e7d32"

        );

    }catch{

        mostrar(

            "📡 Guardado localmente",

            "#ef6c00"

        );

    }

    entrada.value="";

    guardarBtn.disabled=false;

    guardarBtn.innerHTML="💾 Guardar";

    entrada.focus();

}
// ---------------------------
// Actualizar pantalla
// ---------------------------

function actualizarPantalla(){

    lista.innerHTML="";

    const hoy=new Date().toLocaleDateString("es-AR");

    let totalHoyCalculado=0;
    let cantidadHoyCalculada=0;

    historial.forEach((item,index)=>{

        if(item.fecha===hoy){

            totalHoyCalculado+=Number(item.monto);
            cantidadHoyCalculada++;

        }

    });

    historial.slice(0,10).forEach((item,index)=>{

        const li=document.createElement("li");

        li.innerHTML=`

        <div class="infoGasto">

            <span>${item.concepto}</span><br>

            <strong>$ ${Number(item.monto).toLocaleString("es-AR")}</strong>

            <br>

            <small>${item.fecha}</small>

        </div>

        <button class="eliminar"

        onclick="eliminarGasto(${index})">

        🗑️

        </button>

        `;

        lista.appendChild(li);

    });

    if(historial.length===0){

        lista.innerHTML=

        "<li class='vacio'>Todavía no hay gastos.</li>";

    }

    totalHoy.innerHTML=

    "$ "+totalHoyCalculado.toLocaleString("es-AR");

    cantidadHoy.innerHTML=

    cantidadHoyCalculada+

    (cantidadHoyCalculada===1?" gasto":" gastos");

}

// ---------------------------
// Eliminar gasto
// ---------------------------

function eliminarGasto(indice){

    if(!confirm("¿Eliminar este gasto?")){

        return;

    }

    historial.splice(indice,1);

    localStorage.setItem(

        "ants_historial",

        JSON.stringify(historial)

    );

    actualizarPantalla();

    mostrar(

        "🗑️ Gasto eliminado",

        "#d32f2f"

    );

}

// ---------------------------
// Mensajes
// ---------------------------

function mostrar(texto,color){

    mensaje.innerHTML=texto;

    mensaje.style.color=color;

    setTimeout(()=>{

        mensaje.innerHTML="";

    },3000);

}
// ---------------------------
// Reconocimiento de voz
// ---------------------------

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

// ---------------------------
// Sincronizar cuando vuelve Internet
// ---------------------------

window.addEventListener("online", () => {

    mostrar("🌐 Conexión restablecida", "#2e7d32");

});

// ---------------------------
// Refrescar pantalla al volver
// ---------------------------

window.addEventListener("focus", () => {

    actualizarPantalla();

});

// ---------------------------
// Fin
// ---------------------------

console.log("🐜 Ants 3.1 iniciado correctamente");
