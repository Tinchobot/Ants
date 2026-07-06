// =====================================
// parser.js
// Interpreta montos escritos en español
// =====================================

function parsearMonto(texto) {

    texto = texto.trim().toLowerCase();

    const match = texto.match(/^(.*)\s+(.+)$/);

    if (!match) {
        return null;
    }

    const concepto = match[1].trim();

    let montoTexto = match[2]
        .trim()
        .toLowerCase();

    // millones
    if (montoTexto.endsWith(" millones")) {

        montoTexto = montoTexto
            .replace(" millones", "")
            .replace(/\./g, "")
            .replace(",", ".");

        return {
            concepto,
            monto: Number(montoTexto) * 1000000
        };
    }

    // millón
    if (montoTexto.endsWith(" millón")) {

        montoTexto = montoTexto
            .replace(" millón", "")
            .replace(/\./g, "")
            .replace(",", ".");

        return {
            concepto,
            monto: Number(montoTexto) * 1000000
        };
    }

    // mil
    if (montoTexto.endsWith(" mil")) {

        montoTexto = montoTexto
            .replace(" mil", "")
            .replace(/\./g, "")
            .replace(",", ".");

        return {
            concepto,
            monto: Number(montoTexto) * 1000
        };
    }

    // lucas
    if (montoTexto.endsWith(" lucas")) {

        montoTexto = montoTexto
            .replace(" lucas", "")
            .replace(/\./g, "")
            .replace(",", ".");

        return {
            concepto,
            monto: Number(montoTexto) * 1000
        };
    }

    // formato argentino

    if (montoTexto.includes(",")) {

        montoTexto = montoTexto
            .replace(/\./g, "")
            .replace(",", ".");

    } else {

        montoTexto = montoTexto
            .replace(/\./g, "");

    }

    const monto = Number(montoTexto);

    if (Number.isNaN(monto)) {

        return null;

    }

    return {

        concepto,
        monto

    };

}
