document.addEventListener("DOMContentLoaded", () => {
    const mesTexto = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    let fechaActual = new Date();

    function renderizarMes() {
        const anio = fechaActual.getFullYear();
        const mes = fechaActual.getMonth();
        const primerDia = new Date(anio, mes, 1);
        const ultimoDia = new Date(anio, mes + 1, 0);
        const diasMes = ultimoDia.getDate();
        const inicioSemana = primerDia.getDay(); // 0 = domingo

        const ul = document.querySelector(".calendar-days ul");
        ul.innerHTML = "";

        // Actualiza el encabezado del mes
        document.getElementById("currentMonth").textContent = `${mesTexto[mes]} ${anio}`;

        // Días del mes anterior si el mes no comienza en domingo
        const ultimoMes = new Date(anio, mes, 0);
        const diasPrev = ultimoMes.getDate();
        for (let i = inicioSemana - 1; i >= 0; i--) {
            ul.innerHTML += `<li class="prevMonth-day" data-day="${diasPrev - i}">${diasPrev - i}</li>`;
        }

        // Días del mes actual
        for (let d = 1; d <= diasMes; d++) {
            const esHoy = new Date().toDateString() === new Date(anio, mes, d).toDateString();
            ul.innerHTML += `<li class="${esHoy ? "actual-day" : "day"}" data-day="${d}">${d}</li>`;
        }

        // Rellenar días siguientes hasta completar 42 celdas
        const totalDias = inicioSemana + diasMes;
        const diasSiguientes = 42 - totalDias;
        for (let j = 1; j <= diasSiguientes; j++) {
            ul.innerHTML += `<li class="nextMonth-day" data-day="${j}">${j}</li>`;
        }
    }

    // Botones para navegar entre meses
    document.getElementById("nextMonth").addEventListener("click", () => {
        fechaActual.setMonth(fechaActual.getMonth() + 1);
        renderizarMes();
    });

    document.getElementById("prevMonth").addEventListener("click", () => {
        fechaActual.setMonth(fechaActual.getMonth() - 1);
        renderizarMes();
    });

    // Renderizar al cargar
    renderizarMes();
});