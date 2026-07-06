// =====================================
// voice.js
// Reconocimiento de voz
// =====================================

let reconocimiento = null;

function iniciarVoz(campoEntrada) {

    if (!("webkitSpeechRecognition" in window)) {

        alert("Este navegador no admite reconocimiento de voz.");

        return;

    }

    reconocimiento = new webkitSpeechRecognition();

    reconocimiento.lang = "es-AR";

    reconocimiento.interimResults = false;

    reconocimiento.continuous = false;

    reconocimiento.maxAlternatives = 1;

    reconocimiento.start();

    reconocimiento.onresult = (e) => {

        campoEntrada.value = e.results[0][0].transcript;

        campoEntrada.focus();

    };

    reconocimiento.onerror = () => {

        console.log("Error en reconocimiento de voz");

    };

}
