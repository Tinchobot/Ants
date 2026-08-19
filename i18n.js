// =====================================
// Traducciones (i18n)
//
// Todo lo que depende del idioma vive acá: los textos de la
// interfaz, el orden de la fecha y si la hora es de 12 o 24hs, los
// meses cortos de las barras, el idioma del reconocimiento de voz,
// y las palabras que interpretarGasto() reconoce como "mil" o
// como moneda.
// =====================================

const IDIOMA_POR_DEFECTO = "es";

const IDIOMAS = {

    es: {

        nombre: "Español",
        bandera: "🇦🇷",
        locale: "es-AR",
        vozLang: "es-AR",
        ordenFecha: "DMY",
        hora12: false,
        mesesCortos: [
            "ene", "feb", "mar", "abr", "may", "jun",
            "jul", "ago", "sep", "oct", "nov", "dic"
        ],
        patronMoneda: /\bpesos?\b/g,
        patronMillar: /(\d+)\s*mil\b/g,

        textos: {

            "app.tagline": "Cada peso cuenta.",
            "app.pregunta": "¿En qué gastamos ahora?",
            "app.placeholder": "Ej: Nafta 58000",
            "app.vozAria": "Dictar gasto",
            "app.ayudaGuardar": "¿Qué tipo de gasto fue?",

            "tabs.gastos": "💰 Gastos",
            "tabs.estadisticas": "📊 Estadísticas",
            "tabs.metas": "🎯 Metas",

            "tipos.necesario": "Necesario",
            "tipos.evitable": "Evitable",
            "tipos.innecesario": "Innecesario",
            "tipos.sin": "Sin clasificar",

            "filtros.todo": "Todo",
            "filtros.semana": "Semana",
            "filtros.mes": "Mes",
            "filtros.rango": "Rango",
            "filtros.desde": "Desde",
            "filtros.hasta": "Hasta",

            "resumen.hoy": "Hoy",
            "resumen.acumulado": "Acumulado",
            "resumen.ultimaSemana": "Última semana",
            "resumen.esteMes": "Este mes",
            "resumen.gasto": "gasto",
            "resumen.gastos": "gastos",
            "resumen.desdeCorto": "Desde {fecha}",
            "resumen.hastaCorto": "Hasta {fecha}",
            "resumen.exportar": "📄 Exportar",
            "resumen.borrarTodo": "🗑️ Borrar todo",

            "historial.ultimosGastos": "Últimos gastos",
            "historial.gastosPeriodo": "Gastos del período",
            "historial.vacioTotal": "Todavía no hay gastos.",
            "historial.vacioPeriodo": "No hay gastos en este período.",
            "historial.verMas": "Ver más ({n} restantes)",
            "historial.mostrando": "Mostrando {n} de {total}",
            "historial.eliminarAria": "Eliminar {concepto}",

            "estadisticas.ultimos6Meses": "Últimos 6 meses",

            "msj.elegirTipo": "Elegí el tipo de gasto 👇",
            "msj.escribirGasto": "Escribí un gasto.",
            "msj.noEntendi": "No entendí el gasto.",
            "msj.guardadoComo": "✅ Guardado como {tipo}",
            "msj.sinEspacio": "⚠️ No hay espacio para guardar. Exportá a Excel.",
            "msj.gastoEliminado": "🗑️ Gasto eliminado",
            "msj.vozError": "No pude reconocer la voz.",
            "msj.historialEliminado": "🗑️ Historial eliminado",
            "msj.noHayGastos": "No hay gastos.",
            "msj.noHayParaExportar": "No hay gastos para exportar.",
            "msj.excelExportado": "📄 Excel exportado",
            "msj.confirmEliminarGasto": "¿Eliminar este gasto?",
            "msj.confirmBorrarTodo": "¿Eliminar TODOS los gastos?",
            "msj.confirmBorrarTodoFiltrado": "Esto elimina los {n} gastos del historial completo, no solo los del período que estás viendo. ¿Continuar?",

            "excel.fecha": "Fecha",
            "excel.hora": "Hora",
            "excel.concepto": "Concepto",
            "excel.tipo": "Tipo",
            "excel.monto": "Monto",
            "excel.hoja": "Gastos",

            "idioma.etiqueta": "Idioma",

            "premium.bannerTitulo": "Versión gratuita",
            "premium.bannerTexto": "Desbloqueá estadísticas, metas de gasto y filtrar por períodos específicos.",
            "premium.boton": "🔓 Desbloquear versión completa",
            "premium.precioMonto": "Pago único de US$3.99",
            "premium.sinSuscripcion": "SIN SUSCRIPCIONES",
            "premium.comprando": "Procesando compra…",
            "premium.activoBadge": "✨ Premium activo",
            "premium.candadoTitulo": "Función premium",
            "premium.candadoTexto": "Desbloqueá esta función con el pago único de Ants Premium.",
            "premium.candadoBoton": "🔓 Desbloquear",
            "premium.filtroRangoBloqueado": "🔒 El filtro por rango de fechas es una función premium.",
            "premium.noDisponible": "Esta función solo está disponible en la versión instalada desde Google Play.",
            "premium.errorCompra": "No se pudo completar la compra. Probá de nuevo.",
            "premium.cancelada": "Compra cancelada.",
            "premium.gracias": "🎉 ¡Gracias! Ya tenés la versión completa.",

            "metas.titulo": "Meta de gasto mensual",
            "metas.placeholder": "Ej: 50000",
            "metas.guardar": "Guardar meta",
            "metas.sinMeta": "Todavía no configuraste una meta. Definí cuánto querés gastar como máximo este mes.",
            "metas.gastadoDe": "Gastaste {gastado} de {meta}",
            "metas.alertaCerca": "⚠️ Te estás acercando al límite.",
            "metas.alertaSuperada": "🚨 Superaste tu meta del mes.",
            "metas.metaGuardada": "✅ Meta guardada",
            "metas.montoInvalido": "Ingresá un monto válido."

        }

    },

    en: {

        nombre: "English",
        bandera: "🇺🇸",
        locale: "en-US",
        vozLang: "en-US",
        ordenFecha: "MDY",
        hora12: true,
        mesesCortos: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        patronMoneda: /\b(dollars?|bucks?)\b/g,
        patronMillar: /(\d+)\s*(k|thousand)\b/g,

        textos: {

            "app.tagline": "Every penny counts.",
            "app.pregunta": "What did we spend on now?",
            "app.placeholder": "E.g.: Coffee 3500",
            "app.vozAria": "Dictate expense",
            "app.ayudaGuardar": "What kind of expense was it?",

            "tabs.gastos": "💰 Expenses",
            "tabs.estadisticas": "📊 Statistics",
            "tabs.metas": "🎯 Goals",

            "tipos.necesario": "Necessary",
            "tipos.evitable": "Avoidable",
            "tipos.innecesario": "Unnecessary",
            "tipos.sin": "Unclassified",

            "filtros.todo": "All",
            "filtros.semana": "Week",
            "filtros.mes": "Month",
            "filtros.rango": "Range",
            "filtros.desde": "From",
            "filtros.hasta": "To",

            "resumen.hoy": "Today",
            "resumen.acumulado": "Total",
            "resumen.ultimaSemana": "Last week",
            "resumen.esteMes": "This month",
            "resumen.gasto": "expense",
            "resumen.gastos": "expenses",
            "resumen.desdeCorto": "From {fecha}",
            "resumen.hastaCorto": "To {fecha}",
            "resumen.exportar": "📄 Export",
            "resumen.borrarTodo": "🗑️ Delete all",

            "historial.ultimosGastos": "Latest expenses",
            "historial.gastosPeriodo": "Expenses for this period",
            "historial.vacioTotal": "No expenses yet.",
            "historial.vacioPeriodo": "No expenses in this period.",
            "historial.verMas": "Show more ({n} left)",
            "historial.mostrando": "Showing {n} of {total}",
            "historial.eliminarAria": "Delete {concepto}",

            "estadisticas.ultimos6Meses": "Last 6 months",

            "msj.elegirTipo": "Choose the expense type 👇",
            "msj.escribirGasto": "Type an expense.",
            "msj.noEntendi": "I didn't understand that expense.",
            "msj.guardadoComo": "✅ Saved as {tipo}",
            "msj.sinEspacio": "⚠️ Not enough space to save. Export to Excel.",
            "msj.gastoEliminado": "🗑️ Expense deleted",
            "msj.vozError": "I couldn't recognize your voice.",
            "msj.historialEliminado": "🗑️ History deleted",
            "msj.noHayGastos": "No expenses.",
            "msj.noHayParaExportar": "No expenses to export.",
            "msj.excelExportado": "📄 Excel exported",
            "msj.confirmEliminarGasto": "Delete this expense?",
            "msj.confirmBorrarTodo": "Delete ALL expenses?",
            "msj.confirmBorrarTodoFiltrado": "This deletes all {n} expenses in your history, not just the ones from the period you're viewing. Continue?",

            "excel.fecha": "Date",
            "excel.hora": "Time",
            "excel.concepto": "Item",
            "excel.tipo": "Type",
            "excel.monto": "Amount",
            "excel.hoja": "Expenses",

            "idioma.etiqueta": "Language",

            "premium.bannerTitulo": "Free version",
            "premium.bannerTexto": "Unlock statistics, spending goals, and filtering by specific periods.",
            "premium.boton": "🔓 Unlock full version",
            "premium.precioMonto": "One-time payment of US$3.99",
            "premium.sinSuscripcion": "NO SUBSCRIPTIONS",
            "premium.comprando": "Processing purchase…",
            "premium.activoBadge": "✨ Premium active",
            "premium.candadoTitulo": "Premium feature",
            "premium.candadoTexto": "Unlock this feature with a one-time payment for Ants Premium.",
            "premium.candadoBoton": "🔓 Unlock",
            "premium.filtroRangoBloqueado": "🔒 The date-range filter is a premium feature.",
            "premium.noDisponible": "This feature is only available in the version installed from Google Play.",
            "premium.errorCompra": "The purchase couldn't be completed. Please try again.",
            "premium.cancelada": "Purchase cancelled.",
            "premium.gracias": "🎉 Thanks! You now have the full version.",

            "metas.titulo": "Monthly spending goal",
            "metas.placeholder": "E.g.: 50000",
            "metas.guardar": "Save goal",
            "metas.sinMeta": "You haven't set a goal yet. Set the most you want to spend this month.",
            "metas.gastadoDe": "You spent {gastado} of {meta}",
            "metas.alertaCerca": "⚠️ You're getting close to the limit.",
            "metas.alertaSuperada": "🚨 You went over your goal this month.",
            "metas.metaGuardada": "✅ Goal saved",
            "metas.montoInvalido": "Enter a valid amount."

        }

    },

    pt: {

        nombre: "Português",
        bandera: "🇧🇷",
        locale: "pt-BR",
        vozLang: "pt-BR",
        ordenFecha: "DMY",
        hora12: false,
        mesesCortos: [
            "jan", "fev", "mar", "abr", "mai", "jun",
            "jul", "ago", "set", "out", "nov", "dez"
        ],
        patronMoneda: /\b(reais|real)\b/g,
        patronMillar: /(\d+)\s*mil\b/g,

        textos: {

            "app.tagline": "Cada centavo conta.",
            "app.pregunta": "Com que gastamos agora?",
            "app.placeholder": "Ex: Gasolina 58000",
            "app.vozAria": "Ditar gasto",
            "app.ayudaGuardar": "Que tipo de gasto foi?",

            "tabs.gastos": "💰 Gastos",
            "tabs.estadisticas": "📊 Estatísticas",
            "tabs.metas": "🎯 Metas",

            "tipos.necesario": "Necessário",
            "tipos.evitable": "Evitável",
            "tipos.innecesario": "Desnecessário",
            "tipos.sin": "Sem classificar",

            "filtros.todo": "Tudo",
            "filtros.semana": "Semana",
            "filtros.mes": "Mês",
            "filtros.rango": "Período",
            "filtros.desde": "De",
            "filtros.hasta": "Até",

            "resumen.hoy": "Hoje",
            "resumen.acumulado": "Acumulado",
            "resumen.ultimaSemana": "Última semana",
            "resumen.esteMes": "Este mês",
            "resumen.gasto": "gasto",
            "resumen.gastos": "gastos",
            "resumen.desdeCorto": "De {fecha}",
            "resumen.hastaCorto": "Até {fecha}",
            "resumen.exportar": "📄 Exportar",
            "resumen.borrarTodo": "🗑️ Apagar tudo",

            "historial.ultimosGastos": "Últimos gastos",
            "historial.gastosPeriodo": "Gastos do período",
            "historial.vacioTotal": "Ainda não há gastos.",
            "historial.vacioPeriodo": "Nenhum gasto neste período.",
            "historial.verMas": "Ver mais ({n} restantes)",
            "historial.mostrando": "Mostrando {n} de {total}",
            "historial.eliminarAria": "Excluir {concepto}",

            "estadisticas.ultimos6Meses": "Últimos 6 meses",

            "msj.elegirTipo": "Escolha o tipo de gasto 👇",
            "msj.escribirGasto": "Digite um gasto.",
            "msj.noEntendi": "Não entendi esse gasto.",
            "msj.guardadoComo": "✅ Salvo como {tipo}",
            "msj.sinEspacio": "⚠️ Sem espaço para salvar. Exporte para o Excel.",
            "msj.gastoEliminado": "🗑️ Gasto excluído",
            "msj.vozError": "Não consegui reconhecer a voz.",
            "msj.historialEliminado": "🗑️ Histórico apagado",
            "msj.noHayGastos": "Não há gastos.",
            "msj.noHayParaExportar": "Não há gastos para exportar.",
            "msj.excelExportado": "📄 Excel exportado",
            "msj.confirmEliminarGasto": "Excluir este gasto?",
            "msj.confirmBorrarTodo": "Excluir TODOS os gastos?",
            "msj.confirmBorrarTodoFiltrado": "Isso exclui os {n} gastos de todo o histórico, não só os do período que você está vendo. Continuar?",

            "excel.fecha": "Data",
            "excel.hora": "Hora",
            "excel.concepto": "Item",
            "excel.tipo": "Tipo",
            "excel.monto": "Valor",
            "excel.hoja": "Gastos",

            "idioma.etiqueta": "Idioma",

            "premium.bannerTitulo": "Versão gratuita",
            "premium.bannerTexto": "Desbloqueie estatísticas, metas de gastos e filtro por períodos específicos.",
            "premium.boton": "🔓 Desbloquear versão completa",
            "premium.precioMonto": "Pagamento único de US$3.99",
            "premium.sinSuscripcion": "SEM ASSINATURAS",
            "premium.comprando": "Processando compra…",
            "premium.activoBadge": "✨ Premium ativo",
            "premium.candadoTitulo": "Função premium",
            "premium.candadoTexto": "Desbloqueie esta função com o pagamento único do Ants Premium.",
            "premium.candadoBoton": "🔓 Desbloquear",
            "premium.filtroRangoBloqueado": "🔒 O filtro por período de datas é uma função premium.",
            "premium.noDisponible": "Essa função só está disponível na versão instalada pelo Google Play.",
            "premium.errorCompra": "Não foi possível concluir a compra. Tente novamente.",
            "premium.cancelada": "Compra cancelada.",
            "premium.gracias": "🎉 Obrigado! Agora você tem a versão completa.",

            "metas.titulo": "Meta de gasto mensal",
            "metas.placeholder": "Ex: 50000",
            "metas.guardar": "Salvar meta",
            "metas.sinMeta": "Você ainda não definiu uma meta. Defina o máximo que quer gastar este mês.",
            "metas.gastadoDe": "Você gastou {gastado} de {meta}",
            "metas.alertaCerca": "⚠️ Você está perto do limite.",
            "metas.alertaSuperada": "🚨 Você ultrapassou a meta deste mês.",
            "metas.metaGuardada": "✅ Meta salva",
            "metas.montoInvalido": "Digite um valor válido."

        }

    },

    it: {

        nombre: "Italiano",
        bandera: "🇮🇹",
        locale: "it-IT",
        vozLang: "it-IT",
        ordenFecha: "DMY",
        hora12: false,
        mesesCortos: [
            "gen", "feb", "mar", "apr", "mag", "giu",
            "lug", "ago", "set", "ott", "nov", "dic"
        ],
        patronMoneda: /\beuro\b/g,
        patronMillar: /(\d+)\s*mila\b/g,

        textos: {

            "app.tagline": "Ogni centesimo conta.",
            "app.pregunta": "In cosa abbiamo speso adesso?",
            "app.placeholder": "Es: Benzina 58000",
            "app.vozAria": "Detta spesa",
            "app.ayudaGuardar": "Che tipo di spesa era?",

            "tabs.gastos": "💰 Spese",
            "tabs.estadisticas": "📊 Statistiche",

            "tipos.necesario": "Necessaria",
            "tipos.evitable": "Evitabile",
            "tipos.innecesario": "Superflua",
            "tipos.sin": "Non classificata",

            "filtros.todo": "Tutto",
            "filtros.semana": "Settimana",
            "filtros.mes": "Mese",
            "filtros.rango": "Intervallo",
            "filtros.desde": "Da",
            "filtros.hasta": "A",

            "resumen.hoy": "Oggi",
            "resumen.acumulado": "Totale",
            "resumen.ultimaSemana": "Ultima settimana",
            "resumen.esteMes": "Questo mese",
            "resumen.gasto": "spesa",
            "resumen.gastos": "spese",
            "resumen.desdeCorto": "Da {fecha}",
            "resumen.hastaCorto": "A {fecha}",
            "resumen.exportar": "📄 Esporta",
            "resumen.borrarTodo": "🗑️ Cancella tutto",

            "historial.ultimosGastos": "Ultime spese",
            "historial.gastosPeriodo": "Spese del periodo",
            "historial.vacioTotal": "Ancora nessuna spesa.",
            "historial.vacioPeriodo": "Nessuna spesa in questo periodo.",
            "historial.verMas": "Mostra altro ({n} restanti)",
            "historial.mostrando": "Visualizzate {n} di {total}",
            "historial.eliminarAria": "Elimina {concepto}",

            "estadisticas.ultimos6Meses": "Ultimi 6 mesi",

            "msj.elegirTipo": "Scegli il tipo di spesa 👇",
            "msj.escribirGasto": "Scrivi una spesa.",
            "msj.noEntendi": "Non ho capito la spesa.",
            "msj.guardadoComo": "✅ Salvata come {tipo}",
            "msj.sinEspacio": "⚠️ Spazio esaurito per salvare. Esporta in Excel.",
            "msj.gastoEliminado": "🗑️ Spesa eliminata",
            "msj.vozError": "Non sono riuscito a riconoscere la voce.",
            "msj.historialEliminado": "🗑️ Cronologia eliminata",
            "msj.noHayGastos": "Nessuna spesa.",
            "msj.noHayParaExportar": "Nessuna spesa da esportare.",
            "msj.excelExportado": "📄 Excel esportato",
            "msj.confirmEliminarGasto": "Eliminare questa spesa?",
            "msj.confirmBorrarTodo": "Eliminare TUTTE le spese?",
            "msj.confirmBorrarTodoFiltrado": "Questo elimina tutte le {n} spese della cronologia, non solo quelle del periodo che stai visualizzando. Continuare?",

            "excel.fecha": "Data",
            "excel.hora": "Ora",
            "excel.concepto": "Voce",
            "excel.tipo": "Tipo",
            "excel.monto": "Importo",
            "excel.hoja": "Spese",

            "idioma.etiqueta": "Lingua",

            "premium.bannerTitulo": "Versione gratuita",
            "premium.bannerTexto": "Sblocca statistiche, obiettivi di spesa e filtro per periodi specifici.",
            "premium.boton": "🔓 Sblocca versione completa",
            "premium.precioMonto": "Pagamento una tantum di US$3.99",
            "premium.sinSuscripcion": "NESSUN ABBONAMENTO",
            "premium.comprando": "Elaborazione dell'acquisto…",
            "premium.activoBadge": "✨ Premium attivo",
            "premium.candadoTitulo": "Funzione premium",
            "premium.candadoTexto": "Sblocca questa funzione con il pagamento unico di Ants Premium.",
            "premium.candadoBoton": "🔓 Sblocca",
            "premium.filtroRangoBloqueado": "🔒 Il filtro per intervallo di date è una funzione premium.",
            "premium.noDisponible": "Questa funzione è disponibile solo nella versione installata da Google Play.",
            "premium.errorCompra": "Impossibile completare l'acquisto. Riprova.",
            "premium.cancelada": "Acquisto annullato.",
            "premium.gracias": "🎉 Grazie! Ora hai la versione completa.",

            "metas.titulo": "Obiettivo di spesa mensile",
            "metas.placeholder": "Es: 50000",
            "metas.guardar": "Salva obiettivo",
            "metas.sinMeta": "Non hai ancora impostato un obiettivo. Imposta il massimo che vuoi spendere questo mese.",
            "metas.gastadoDe": "Hai speso {gastado} di {meta}",
            "metas.alertaCerca": "⚠️ Ti stai avvicinando al limite.",
            "metas.alertaSuperada": "🚨 Hai superato l'obiettivo di questo mese.",
            "metas.metaGuardada": "✅ Obiettivo salvato",
            "metas.montoInvalido": "Inserisci un importo valido."

        }

    }

};

function idiomaValido(codigo) {

    return Object.prototype.hasOwnProperty.call(IDIOMAS, codigo);

}

// El idioma que eligió el usuario la última vez, si lo guardó.
function idiomaGuardado() {

    try {

        const guardado = localStorage.getItem("ants_idioma");

        if (guardado && idiomaValido(guardado)) {

            return guardado;

        }

    } catch (e) {}

    return null;

}

// Si nunca eligió nada, probamos con el idioma del navegador.
function idiomaDelNavegador() {

    if (typeof navigator === "undefined" || !navigator.language) {

        return null;

    }

    const base = navigator.language.slice(0, 2).toLowerCase();

    return idiomaValido(base) ? base : null;

}
