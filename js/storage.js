// =====================================

// storage.js

// Manejo del almacenamiento local

// =====================================

const STORAGE_KEY = "ants_historial";

function obtenerHistorial() {

return JSON.parse(

localStorage.getItem(STORAGE_KEY)

) || [];

}

function guardarHistorial(historial) {

localStorage.setItem(

STORAGE_KEY,

JSON.stringify(historial)

);

}

function agregarGasto(gasto) {

const historial = obtenerHistorial();

historial.unshift(gasto);

if (historial.length > 200) {

historial.pop();

}

guardarHistorial(historial);

return historial;

}

function eliminarGasto(id) {

const historial = obtenerHistorial()

.filter(g => g.id !== id);

guardarHistorial(historial);

return historial;

}

function limpiarHistorial() {

localStorage.removeItem(STORAGE_KEY);

}
