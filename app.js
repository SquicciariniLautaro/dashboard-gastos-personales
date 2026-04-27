// Array principal

let gastos = JSON.parse(localStorage.getItem("misGastos")) || []; // Cargo los datos guardadados del formulario, caso contrario estará vacío, .parse() me devuelve lo guardado como un string

let miGrafico;

let deudas = JSON.parse(localStorage.getItem("misDeudas")) || [];

// Formulario

const formGastos = document.getElementById("formulario-gastos");  // Agarro el form por su ID para que se conecte directamente entre el html y js

const formDeudas = document.getElementById("formulario-deudas"); // Agarro el form de deudas por su ID para que se conecte como hice con el formulario de gastos

// Navegacion de la barra lateral de la pagina

const btnInicio = document.getElementById("btn-inicio");
const btnGraficos = document.getElementById("btn-graficos");
const btnDeudas = document.getElementById("btn-deudas");

// Secciones para la navegacion de la barra lateral

const seccionInicio = document.getElementById("seccion-inicio");
const seccionGrafico = document.getElementById("seccion-graficos");
const seccionDeudas = document.getElementById("seccion-deudas");

// Evento para el boton Inicio

btnInicio.addEventListener("click", () =>{
    // Aca escondo lo que no quiero que aparezca

    seccionGrafico.classList.add("oculto");
    seccionDeudas.classList.add("oculto");

    // Aca muestro lo que si quiero que se vea

    seccionInicio.classList.remove("oculto");
});

// Evento para el boton de grafico

btnGraficos.addEventListener("click", () => {
    seccionInicio.classList.add("oculto");
    seccionDeudas.classList.add("oculto");

    seccionGrafico.classList.remove("oculto");
});

// Evento para el boton deudas

btnDeudas.addEventListener("click", () =>{
    seccionInicio.classList.add("oculto");
    seccionGrafico.classList.add("oculto");

    seccionDeudas.classList.remove("oculto");
})

// Evento del formulario de la pagina

formGastos.addEventListener("submit", (e) => {
    
    // Aca hago que la pagina no se actualice cada vez que envio un formulario gracias al preventDefault
    e.preventDefault();
    
    // Aca hago que el enter no se envie automaticamente al llenar el form y espere al boton enviar
    if(document.getElementById("enviar-gastos").disabled === true){
        return;
    };
    
    const descripcion = document.getElementById("mis-gastos").value; //.value me devuelve el contenido de lo que escriba el usuario
    const monto = Number(document.getElementById("monto-del-gasto").value); // Usé Number para que me devuelva un valor y no un string
    const categoria = document.getElementById("categoria-gasto").value; // Agarro cualquier categoria que aparece en mi caja <select>
    
    // Creo el objeto con su descripcion, monto y su ID
    const nuevoGasto = {
        descripcion,
        monto,
        id: Date.now(), //Date.now() hace que el objeto tenga un ID unico
        categoria
    };

    // Agrego los datos al array principal
    gastos.push(nuevoGasto);

    mostrarGastos();
    actualizarTotal();
    dibujarGrafico();

    // Guardo los gastos que tengo en la memoria de la pagina 

    localStorage.setItem("misGastos", JSON.stringify(gastos));
    formGastos.reset();
    
    // Aca hago que si estan llenos todos los campos recien puedo enviar el formulario

    validarForm();
});

// Función que me muestra los gastos en mi HTML como una lista

function mostrarGastos(){
    const listaHTML = document.getElementById("lista-de-gastos");
    listaHTML.innerHTML = "";

    gastos.forEach((gasto) => {
        listaHTML.innerHTML +=
        `<li><span><strong>${gasto.descripcion}</strong> - $${gasto.monto} <small>(${gasto.categoria})</small></span>
            <button onclick="borrarGasto(${gasto.id})">Eliminar</button>
        </li>
        `
    });
};

// Funcion para actualizar el total de los gastos

function actualizarTotal() {
    const total = document.getElementById("total-gastos");

    const sumaTotal = gastos.reduce((acumulador, gasto) => 
    acumulador + gasto.monto, 0);

    total.innerHTML = sumaTotal;
};

// Funcion del boton eliminar cuando se agrega un gasto

function borrarGasto(idAEliminar){
    gastos = gastos.filter(gasto => gasto.id !== idAEliminar);

    localStorage.setItem("misGastos", JSON.stringify(gastos));

    mostrarGastos();
    actualizarTotal();
    dibujarGrafico();
}

// Funcion para sumar totales por categoria que será usado para el grafico de torta

function agruparPorCategoria(){
    const resumen = {};

    gastos.forEach((gasto) =>{

        if(resumen[gasto.categoria]){
            resumen[gasto.categoria] += gasto.monto;
        }else{
            resumen[gasto.categoria] = gasto.monto;
        };
    });

    return resumen;
};

// Funcion para habilitar el formulario cuando todo este lleno

function validarForm(){
    
    // Agarro las variables de mi form para que se habilite el boton de enviar

    const variableDescrp = document.getElementById("mis-gastos").value;
    const variableMonto = Number(document.getElementById("monto-del-gasto").value);
    const variableCat = document.getElementById("categoria-gasto").value;
    const btnEnviar = document.getElementById("enviar-gastos");

        if(variableDescrp.trim() !== "" && variableMonto > 0 && variableCat !== ""){ // .trim() borra los espacios que hayan colocado por error/aproposito en la pagina
            btnEnviar.disabled = false;
        }else{
            btnEnviar.disabled = true;
        };
};

// Funcion de Charts.js para el grafico de torta

function dibujarGrafico() {
    
    // 1. Traemos la info del cajero
    const resumenCategorias = agruparPorCategoria();

    // 2. Extraemos las llaves (nombres) y los valores (números)
    const etiquetas = Object.keys(resumenCategorias);
    const datos = Object.values(resumenCategorias);

    // 3. Agarramos el "lienzo" que creaste en el HTML
    const ctx = document.getElementById("mi-grafico");

    // ¡Regla de oro de Chart.js!: Si ya hay un gráfico dibujado, hay que destruirlo
    // antes de dibujar uno nuevo actualizado. Si no, se superponen y parpadean.
    if (miGrafico) {
        miGrafico.destroy();
    }

    // 4. Le damos la orden a la librería de dibujar
    miGrafico = new Chart(ctx, {
        type: 'pie', // 'pie' significa gráfico de torta en inglés
        data: {
            labels: etiquetas, // Le enchufamos el array de categorías
            datasets: [{
                label: 'Total por Categoría',
                data: datos, // Le enchufamos el array de montos
                
                // Una paleta de colores para las porciones de la torta
                backgroundColor: [
                    '#3498db', // Azul
                    '#e74c3c', // Rojo
                    '#2ecc71', // Verde
                    '#f1c40f', // Amarillo
                    '#9b59b6', // Violeta
                    '#34495e'  // Gris oscuro
                ],
                borderWidth: 2, // Grosor de la línea que separa las porciones
                borderColor: '#ffffff' // Color de la línea separadora (blanco)
            }]
        }
    });
}

// Eventos que hacen que la funcion validarForm se ejecute correctamente

document.getElementById("mis-gastos").addEventListener("input", validarForm);
document.getElementById("monto-del-gasto").addEventListener("input", validarForm);
document.getElementById("categoria-gasto").addEventListener("change", validarForm);

// Evento del formulario de deudas

formDeudas.addEventListener("submit", (e) => {
    e.preventDefault();

    const descripcionDeuda = document.getElementById("mis-deudas").value;
    const montoDeuda = Number(document.getElementById("monto-deuda").value);
    const tipoDeudor = document.getElementById("deudor").value;
    const catDeuda = document.getElementById("categoria-deuda").value;

    const newDeuda = {
        descriDeuda: descripcionDeuda,
        monto: montoDeuda,
        tipoDeDeudor: tipoDeudor,
        categoriaDeuda: catDeuda,
        id: Date.now()
    };

    deudas.push(newDeuda);

    mostrarDeudas();

    localStorage.setItem("misDeudas", JSON.stringify(deudas));
    formDeudas.reset();

    validarFormDeudas();
    actualizarTotalDeDeudas();
})

// Funcion para mostrar el html en la seccion de deudas

function mostrarDeudas() {
    const listaDeudas = document.getElementById("lista-de-deudas");
    listaDeudas.innerHTML = "";

    deudas.forEach((deuda) => {
        let textoCategoria;
        
        if(deuda.categoriaDeuda === "cobrar"){
            textoCategoria = "Dinero que me deben"
        }else{
            textoCategoria = "Dinero que debo"
        }

        listaDeudas.innerHTML +=
    `<li><span><strong>${deuda.descriDeuda}</strong> - $${deuda.monto} - Debo/Debe: ${deuda.tipoDeDeudor} <small>(${textoCategoria})</small></span>
            <button onclick="borrarDeuda(${deuda.id})">Saldada</button>
        </li>`
    });
};

// Funcion para eliminar deuda

function borrarDeuda(deudaAEliminar){
    deudas = deudas.filter(deuda => deuda.id !== deudaAEliminar);

    localStorage.setItem("misDeudas", JSON.stringify(deudas));

    mostrarDeudas();
    actualizarTotalDeDeudas();
}

// Funcion para habilitar el form de deudas

function validarFormDeudas(){

    const variableDescrpDeuda = document.getElementById("mis-deudas").value;
    const variableMontoDeuda = Number(document.getElementById("monto-deuda").value);
    const variableCatDeuda = document.getElementById("categoria-deuda").value;
    const variableTipoDeudor = document.getElementById("deudor").value;
    const btnEnviarDeuda = document.getElementById("enviar-deuda");

        if(variableDescrpDeuda.trim() !== "" && variableMontoDeuda > 0 && variableCatDeuda !== "" && variableTipoDeudor !== ""){ 
            btnEnviarDeuda.disabled = false;
        }else{
            btnEnviarDeuda.disabled = true;
        };
};

// Eventos que hacen que la funcion validarFormDeudas se ejecute correctamente

document.getElementById("mis-deudas").addEventListener("input", validarFormDeudas);
document.getElementById("monto-deuda").addEventListener("input", validarFormDeudas);
document.getElementById("categoria-deuda").addEventListener("change", validarFormDeudas);
document.getElementById("deudor").addEventListener("input", validarFormDeudas);

// Funcion para el total de las deudas que debo pagar y deben pagarme

function actualizarTotalDeDeudas(){

    const totalPagar = document.getElementById("total-pagar");
    const totalCobrar = document.getElementById("total-cobrar");

    let sumaCobrar = 0;
    let sumaPagar = 0;

    deudas.forEach((deuda) => {

    if(deuda.categoriaDeuda === "cobrar"){
    sumaCobrar += deuda.monto
    }else if(deuda.categoriaDeuda === "pagar"){
        sumaPagar += deuda.monto
    }else{
        console.error("Categoria de deuda desconocida...")
    }
    });


    totalPagar.innerHTML = sumaPagar;
    totalCobrar.innerHTML = sumaCobrar;

};



// Llamo a las funciones para que estén activas cada vez que recargo la página 

mostrarGastos();
actualizarTotal();
dibujarGrafico();
mostrarDeudas();
actualizarTotalDeDeudas();

