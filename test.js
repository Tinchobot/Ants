// Prueba de humo: carga app.js con un DOM falso y verifica totales, paginado y filtros.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const I18N = path.join("C:\\Users\\marti\\desktop\\tincho\\ants-main", "i18n.js");
const PREMIUM = path.join("C:\\Users\\marti\\desktop\\tincho\\ants-main", "premium.js");
const APP = path.join("C:\\Users\\marti\\desktop\\tincho\\ants-main", "app.js");

function nuevoElemento(id) {
  const el = {
    id,
    textContent: "",
    value: "",
    disabled: false,
    hijos: [],
    style: {},
    dataset: {},
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      toggle(c, on) { on ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); },
    },
    handlers: {},
    addEventListener(ev, fn) { (this.handlers[ev] ||= []).push(fn); },
    setAttribute() {},
    appendChild(n) { this.hijos.push(n); return n; },
    append(...n) { this.hijos.push(...n); },
    focus() {},
    disparar(ev, datos) { (this.handlers[ev] || []).forEach((f) => f(datos)); },
    click() { this.disparar("click"); },
  };
  Object.defineProperty(el, "innerHTML", {
    get() { return el._html || ""; },
    set(v) { el._html = v; if (v === "") el.hijos.length = 0; },
  });
  return el;
}

const elementos = {};
const almacen = {};

// Los 4 chips de filtro que el HTML define
const chips = ["todo", "semana", "mes", "rango"].map((f) => {
  const c = nuevoElemento("chip-" + f);
  c.dataset.filtro = f;
  if (f === "todo") c.classList.add("activo");
  return c;
});
const chip = (f) => chips.find((c) => c.dataset.filtro === f);

// Los 3 botones que guardan y clasifican
const botones = ["necesario", "evitable", "innecesario"].map((t) => {
  const b = nuevoElemento("btn-" + t);
  b.dataset.tipo = t;
  return b;
});
const boton = (t) => botones.find((b) => b.dataset.tipo === t);

// Captura lo que se manda a la planilla
let exportado = null;

const ctx = {
  console,
  setTimeout: () => {},
  Audio: function () { return { play: () => Promise.resolve(), currentTime: 0 }; },
  XLSX: {
    utils: {
      json_to_sheet: (d) => { exportado = d; return {}; },
      book_new: () => ({}),
      book_append_sheet: () => {},
    },
    writeFile: () => {},
  },
  localStorage: {
    getItem: (k) => (k in almacen ? almacen[k] : null),
    setItem: (k, v) => { almacen[k] = String(v); },
    removeItem: (k) => { delete almacen[k]; },
  },
  document: {
    getElementById: (id) => (elementos[id] ||= nuevoElemento(id)),
    createElement: (t) => nuevoElemento(t),
    querySelectorAll: (sel) =>
      sel === ".chip" ? chips : sel === ".btnGuardar" ? botones : [],
  },
  window: {
    _h: {},
    addEventListener(ev, fn) { (this._h[ev] ||= []).push(fn); },
    dispatch(ev) { (this._h[ev] || []).forEach((f) => f()); },
  },
};
ctx.window.localStorage = ctx.localStorage;
vm.createContext(ctx);

// --- Utilidades de fecha para armar los datos de prueba ---
const HOY = new Date();
const enDias = (n) => {
  const f = new Date(HOY.getFullYear(), HOY.getMonth(), HOY.getDate());
  f.setDate(f.getDate() + n);
  return f;
};
const aTexto = (f) => f.toLocaleDateString("es-AR");
let contadorId = 1;
const gasto = (fecha, monto, concepto, tipo) => ({
  id: contadorId++, concepto: concepto || "G" + contadorId,
  monto, tipo, fecha: aTexto(fecha), hora: "10:00:00",
});

function sembrar(gastos) {
  almacen["ants_historial"] = JSON.stringify(gastos);
  ctx.window.dispatch("focus"); // hace que la app recargue desde localStorage
}

let fallos = 0;
function chequear(etiqueta, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) fallos++;
  console.log(`${ok ? "PASA" : "FALLA"}  ${etiqueta}: ${JSON.stringify(real)}${ok ? "" : "  (esperado " + JSON.stringify(esperado) + ")"}`);
}
const pesos = (n) => "$ " + n.toLocaleString("es-AR");

// --- Carga inicial: 25 gastos de hoy ---
almacen["ants_historial"] = JSON.stringify(
  Array.from({ length: 25 }, (_, i) => gasto(enDias(0), 100, "Gasto " + (i + 1)))
);
vm.runInContext(fs.readFileSync(I18N, "utf8"), ctx, { filename: "i18n.js" });
vm.runInContext(fs.readFileSync(PREMIUM, "utf8"), ctx, { filename: "premium.js" });
vm.runInContext(fs.readFileSync(APP, "utf8"), ctx, { filename: "app.js" });

console.log("=== Totales y paginado (25 gastos de $100, todos de hoy) ===");
chequear("Total del período", elementos.totalGeneral.textContent, pesos(2500));
chequear("Cantidad del período", elementos.cantidadGeneral.textContent, "25 gastos");
chequear("Total hoy", elementos.totalHoy.textContent, pesos(2500));
chequear("Items dibujados", elementos.listaHistorial.hijos.length, 20);
chequear("Contador", elementos.contadorHistorial.textContent, "Mostrando 20 de 25");
elementos.verMas.click();
chequear("Tras 'Ver mas'", elementos.listaHistorial.hijos.length, 25);
chequear("Boton oculto al final", elementos.verMas.classList.contains("oculto"), true);

console.log("\n=== Borrado por id (fuera de la 1er tanda) ===");
ctx.confirm = () => true;
ctx.eliminarGasto(23);
chequear("Quedan 24", elementos.cantidadGeneral.textContent, "24 gastos");
chequear("Total", elementos.totalGeneral.textContent, pesos(2400));
chequear("El id 23 ya no esta", JSON.parse(almacen["ants_historial"]).some((g) => g.id === 23), false);

console.log("\n=== Filtro: Semana (ventana de 7 dias incluyendo hoy) ===");
sembrar([
  gasto(enDias(0), 100, "hoy"),
  gasto(enDias(-3), 200, "hace 3 dias"),
  gasto(enDias(-6), 400, "hace 6 dias / borde adentro"),
  gasto(enDias(-7), 800, "hace 7 dias / borde afuera"),
  gasto(enDias(-30), 1600, "hace 30 dias"),
]);
chequear("'Todo' suma los 5", elementos.totalGeneral.textContent, pesos(3100));
chequear("Etiqueta", elementos.etiquetaPeriodo.textContent, "Acumulado");
chip("semana").click();
chequear("Etiqueta", elementos.etiquetaPeriodo.textContent, "Última semana");
chequear("Suma 100+200+400", elementos.totalGeneral.textContent, pesos(700));
chequear("Cantidad", elementos.cantidadGeneral.textContent, "3 gastos");
chequear("Lista filtrada", elementos.listaHistorial.hijos.length, 3);
chequear("Chip activo", chip("semana").classList.contains("activo"), true);
chequear("Chip 'todo' desactivado", chip("todo").classList.contains("activo"), false);
chequear("'Hoy' NO lo afecta el filtro", elementos.totalHoy.textContent, pesos(100));

console.log("\n=== Filtro: Mes (desde el dia 1 del mes actual) ===");
const primeroDeMes = new Date(HOY.getFullYear(), HOY.getMonth(), 1);
const finMesAnterior = new Date(HOY.getFullYear(), HOY.getMonth(), 0);
sembrar([
  gasto(enDias(0), 100, "hoy"),
  gasto(primeroDeMes, 50, "dia 1 / borde adentro"),
  gasto(finMesAnterior, 900, "ultimo dia del mes pasado / afuera"),
]);
chip("mes").click();
chequear("Etiqueta", elementos.etiquetaPeriodo.textContent, "Este mes");
const esperadoMes = HOY.getDate() === 1 ? 100 + 50 : 150; // el dia 1 ambos caen igual
chequear("Excluye el mes anterior", elementos.totalGeneral.textContent, pesos(esperadoMes));

console.log("\n=== Filtro: Rango es premium ===");
chequear("Chip 'rango' bloqueado sin premium", chip("rango").classList.contains("bloqueado"), true);
chip("rango").click();
chequear("El click no aplica el filtro", elementos.etiquetaPeriodo.textContent, "Este mes");
chequear("Chip 'rango' sigue apagado", chip("rango").classList.contains("activo"), false);
chequear("Campos de fecha siguen ocultos", elementos.rangoFechas.classList.contains("oculto"), true);
ctx.window.antsDevPremium(true);
chequear("Chip 'rango' desbloqueado con premium", chip("rango").classList.contains("bloqueado"), false);

console.log("\n=== Filtro: Rango a medida (bordes inclusivos) ===");
sembrar([
  gasto(new Date(2024, 2, 9), 1, "09/03 afuera"),
  gasto(new Date(2024, 2, 10), 10, "10/03 borde adentro"),
  gasto(new Date(2024, 2, 15), 100, "15/03 adentro"),
  gasto(new Date(2024, 2, 20), 1000, "20/03 borde adentro"),
  gasto(new Date(2024, 2, 21), 10000, "21/03 afuera"),
]);
elementos.fechaDesde.value = "2024-03-10";
elementos.fechaHasta.value = "2024-03-20";
elementos.fechaDesde.disparar("change");
chequear("Suma 10+100+1000", elementos.totalGeneral.textContent, pesos(1110));
chequear("Cantidad", elementos.cantidadGeneral.textContent, "3 gastos");
chequear("Etiqueta", elementos.etiquetaPeriodo.textContent, "10/03 – 20/03");
chequear("Campos de fecha visibles", elementos.rangoFechas.classList.contains("oculto"), false);

console.log("\n--- rango invertido (desde > hasta) se da vuelta solo ---");
elementos.fechaDesde.value = "2024-03-20";
elementos.fechaHasta.value = "2024-03-10";
elementos.fechaDesde.disparar("change");
chequear("Mismo resultado", elementos.totalGeneral.textContent, pesos(1110));

console.log("\n--- periodo sin gastos ---");
elementos.fechaDesde.value = "2020-01-01";
elementos.fechaHasta.value = "2020-01-31";
elementos.fechaDesde.disparar("change");
chequear("Total en cero", elementos.totalGeneral.textContent, pesos(0));
chequear("Mensaje de vacio", elementos.listaHistorial.hijos[0].textContent, "No hay gastos en este período.");

console.log("\n=== Gasto viejo sin campo 'fecha' (se filtra por el id) ===");
const haceDosDias = enDias(-2).getTime() + 36e5 * 10;
sembrar([{ id: haceDosDias, concepto: "Sin fecha", monto: 777, hora: "10:00:00" }]);
chip("semana").click();
chequear("Entra en la semana", elementos.totalGeneral.textContent, pesos(777));

console.log("\n=== Volver a 'Todo' ===");
chip("todo").click();
chequear("Etiqueta", elementos.etiquetaPeriodo.textContent, "Acumulado");
chequear("Campos de fecha ocultos", elementos.rangoFechas.classList.contains("oculto"), true);
chequear("Titulo de la lista", elementos.tituloHistorial.textContent, "Últimos gastos");

console.log("\n=== interpretarGasto ===");
chequear("'Nafta 58000'", ctx.interpretarGasto("Nafta 58000"), { concepto: "Nafta", monto: 58000 });
chequear("'nafta 58 mil'", ctx.interpretarGasto("nafta 58 mil"), { concepto: "Nafta", monto: 58000 });
chequear("'super 12.500 pesos'", ctx.interpretarGasto("super 12.500 pesos"), { concepto: "Super", monto: 12500 });
chequear("sin numero -> null", ctx.interpretarGasto("solo texto"), null);

// guardar() es async, asi que el resto va en un bloque aparte
(async () => {

  console.log("\n=== Al guardar con un filtro activo vuelve a 'Todo' ===");
  sembrar([
    gasto(enDias(0), 100, "hoy"),
    gasto(enDias(-40), 900, "hace 40 dias"),
  ]);
  elementos.fechaDesde.value = "2020-01-01";
  elementos.fechaHasta.value = "2020-12-31";
  elementos.fechaDesde.disparar("change");
  chequear("Arranca filtrado y vacio", elementos.cantidadGeneral.textContent, "0 gastos");

  elementos.entrada.value = "Cafe 500";
  await ctx.guardar("necesario");

  chequear("Volvio a 'Todo'", elementos.etiquetaPeriodo.textContent, "Acumulado");
  chequear("Chip 'todo' activo", chip("todo").classList.contains("activo"), true);
  chequear("Chip 'rango' apagado", chip("rango").classList.contains("activo"), false);
  chequear("Campos de fecha ocultos", elementos.rangoFechas.classList.contains("oculto"), true);
  chequear("El gasto nuevo se ve", elementos.listaHistorial.hijos.length, 3);
  chequear("Total con el nuevo", elementos.totalGeneral.textContent, pesos(1500));
  chequear("Suma a 'Hoy'", elementos.totalHoy.textContent, pesos(600));

  console.log("\n--- sin filtro, guardar NO colapsa el 'Ver mas' ---");
  sembrar(Array.from({ length: 45 }, () => gasto(enDias(0), 10, "x")));
  elementos.verMas.click(); // pasa a mostrar 40
  chequear("Mostrando 40", elementos.contadorHistorial.textContent, "Mostrando 40 de 45");
  elementos.entrada.value = "Otro 10";
  await ctx.guardar("necesario");
  chequear("Mantiene la vista abierta", elementos.contadorHistorial.textContent, "Mostrando 40 de 46");

  console.log("\n=== Tipos de gasto ===");
  sembrar([]);
  elementos.entrada.value = "Nafta 5000";
  await ctx.guardar("necesario");
  elementos.entrada.value = "Delivery 8000";
  await ctx.guardar("evitable");
  elementos.entrada.value = "Cripto 20000";
  await ctx.guardar("innecesario");

  const guardados = JSON.parse(almacen["ants_historial"]);
  chequear("Se guardaron los 3", guardados.length, 3);
  chequear("Tipos persistidos", guardados.map((g) => g.tipo).sort(),
    ["evitable", "innecesario", "necesario"]);
  chequear("Etiqueta en la lista",
    elementos.listaHistorial.hijos[0].hijos[0].hijos[3].textContent, "Innecesario");
  chequear("Clase de color",
    elementos.listaHistorial.hijos[0].hijos[0].hijos[3].className,
    "etiquetaTipo tipo-innecesario");

  console.log("\n--- el boton pasa su tipo al guardar ---");
  elementos.entrada.value = "Kiosco 1200";
  boton("evitable").click();
  await new Promise((r) => setImmediate(r));
  chequear("Guardado como evitable",
    JSON.parse(almacen["ants_historial"])[0].tipo, "evitable");

  console.log("\n--- sin tipo valido no guarda ---");
  const antes = JSON.parse(almacen["ants_historial"]).length;
  elementos.entrada.value = "Fantasma 999";
  await ctx.guardar();
  await ctx.guardar("cualquiera");
  chequear("No agrego nada", JSON.parse(almacen["ants_historial"]).length, antes);
  chequear("Avisa que falta el tipo", elementos.mensaje.textContent, "Elegí el tipo de gasto 👇");

  console.log("\n--- Enter ya no guarda: pide elegir el tipo ---");
  elementos.mensaje.textContent = "";
  elementos.entrada.value = "Algo 100";
  elementos.entrada.disparar("keydown", { key: "Enter" });
  chequear("Nada guardado", JSON.parse(almacen["ants_historial"]).length, antes);
  chequear("Muestra el aviso", elementos.mensaje.textContent, "Elegí el tipo de gasto 👇");

  console.log("\n=== Excel: columna Tipo ===");
  sembrar([
    gasto(enDias(0), 5000, "Nafta", "necesario"),
    gasto(enDias(-1), 8000, "Delivery", "evitable"),
    gasto(enDias(-2), 300, "Viejo sin tipo"), // cargado antes de esta version
  ]);
  ctx.exportarExcel();
  chequear("Columnas", Object.keys(exportado[0]),
    ["Fecha", "Hora", "Concepto", "Tipo", "Monto"]);
  chequear("Tipos exportados", exportado.map((f) => f.Tipo),
    ["Necesario", "Evitable", "Sin clasificar"]);

  console.log("\n--- el Excel respeta el filtro ---");
  chip("semana").click();
  elementos.fechaDesde.value = "";
  elementos.fechaHasta.value = "";
  ctx.exportarExcel();
  chequear("Exporta los 3 de la semana", exportado.length, 3);

  console.log("\n=== Desglose por tipo ===");
  // li = [punto, nombre, monto]
  const leerDesglose = (el) =>
    el.hijos.map((li) => li.hijos[1].textContent + " " + li.hijos[2].textContent);

  chip("todo").click();
  sembrar([
    gasto(enDias(0), 5000, "Nafta", "necesario"),
    gasto(enDias(0), 8000, "Delivery", "evitable"),
    gasto(enDias(0), 2000, "Cripto", "innecesario"),
    gasto(enDias(-40), 900, "Viejo", "evitable"),
  ]);
  chequear("Total hoy", elementos.totalHoy.textContent, pesos(15000));
  chequear("Desglose de hoy", leerDesglose(elementos.desgloseHoy), [
    "Necesario " + pesos(5000),
    "Evitable " + pesos(8000),
    "Innecesario " + pesos(2000),
  ]);
  chequear("Desglose del acumulado (incluye el de hace 40 dias)",
    leerDesglose(elementos.desglosePeriodo), [
      "Necesario " + pesos(5000),
      "Evitable " + pesos(8900),
      "Innecesario " + pesos(2000),
    ]);
  chequear("Las 3 sumas dan el total",
    5000 + 8900 + 2000, 15900);
  chequear("Total del periodo", elementos.totalGeneral.textContent, pesos(15900));

  console.log("\n--- el desglose del periodo sigue al filtro ---");
  chip("semana").click();
  chequear("Excluye el de hace 40 dias", leerDesglose(elementos.desglosePeriodo), [
    "Necesario " + pesos(5000),
    "Evitable " + pesos(8000),
    "Innecesario " + pesos(2000),
  ]);
  chequear("'Hoy' no cambia", leerDesglose(elementos.desgloseHoy).length, 3);

  console.log("\n--- 'Sin clasificar' solo aparece si hace falta ---");
  chip("todo").click();
  chequear("No aparece si todos tienen tipo",
    leerDesglose(elementos.desglosePeriodo).length, 3);
  sembrar([
    gasto(enDias(0), 5000, "Nafta", "necesario"),
    gasto(enDias(0), 300, "Cargado antes"), // sin tipo
  ]);
  chequear("Aparece como 4ta fila", leerDesglose(elementos.desglosePeriodo), [
    "Necesario " + pesos(5000),
    "Evitable " + pesos(0),
    "Innecesario " + pesos(0),
    "Sin clasificar " + pesos(300),
  ]);
  chequear("Y suma al total", elementos.totalGeneral.textContent, pesos(5300));

  console.log(fallos === 0 ? "\nTODO OK" : `\n${fallos} FALLO(S)`);
  process.exit(fallos === 0 ? 0 : 1);

})();
