// =====================================
// sync.js
// Sincronización con Make
// =====================================

const WEBHOOK =
"https://hook.us2.make.com/ecky1ftg71ist2i2j3pgmvqcxk7ig77j";

async function enviarGasto(gasto){

    try{

        const respuesta = await fetch(WEBHOOK,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(gasto)

        });

        return respuesta.ok;

    }catch(e){

        console.log(e);

        return false;

    }

}
