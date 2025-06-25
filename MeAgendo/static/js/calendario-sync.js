document.addEventListener("DOMContentLoaded", () => {
    const mesTexto = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Fecha central para el calendario grande
    let fechaCentral = new Date();
    // Fecha independiente para el mini calendario
    let miniFecha = new Date();

    // Calendario grande
    function renderizarGrande() {
        const anio = fechaCentral.getFullYear();
        const mes = fechaCentral.getMonth();
        const primerDia = new Date(anio, mes, 1);
        const diasMes = new Date(anio, mes + 1, 0).getDate();
        const inicioSemana = primerDia.getDay();

        document.getElementById("currentMonth").textContent = `${mesTexto[mes]} ${anio}`;

        const ul = document.querySelector(".calendar-days ul");
        ul.innerHTML = "";

        const diasPrev = new Date(anio, mes, 0).getDate();
        for (let i = inicioSemana - 1; i >= 0; i--) {
            ul.innerHTML += `<li class="prevMonth-day" data-day="${diasPrev - i}">${diasPrev - i}</li>`;
        }

        for (let d = 1; d <= diasMes; d++) {
            const esHoy = new Date().toDateString() === new Date(anio, mes, d).toDateString();
            ul.innerHTML += `<li class="${esHoy ? "actual-day" : "day"}" data-day="${d}">${d}</li>`;
        }

        const total = inicioSemana + diasMes;
        const faltan = 42 - total;
        for (let j = 1; j <= faltan; j++) {
            ul.innerHTML += `<li class="nextMonth-day" data-day="${j}">${j}</li>`;
        }
    }

    // Mini calendario (usa fecha independiente)
    function renderizarMini() {
        const anio = miniFecha.getFullYear();
        const mes = miniFecha.getMonth();
        const primerDia = new Date(anio, mes, 1);
        const diasMes = new Date(anio, mes + 1, 0).getDate();
        const inicioSemana = primerDia.getDay();

        document.getElementById("mini-date").textContent = `${mesTexto[mes]} ${anio}`;

        const ul = document.querySelector(".mini-calendar .calendar-days ul");
        ul.innerHTML = "";

        const diasPrev = new Date(anio, mes, 0).getDate();
        for (let i = inicioSemana - 1; i >= 0; i--) {
            ul.innerHTML += `<li class="prevMonth-day" data-day="${diasPrev - i}">${diasPrev - i}</li>`;
        }

        for (let d = 1; d <= diasMes; d++) {
            const esHoy = new Date().toDateString() === new Date(anio, mes, d).toDateString();
            ul.innerHTML += `<li class="${esHoy ? "actual-day" : "day"}" data-day="${d}">${d}</li>`;
        }

        const total = inicioSemana + diasMes;
        const faltan = 42 - total;
        for (let j = 1; j <= faltan; j++) {
            ul.innerHTML += `<li class="nextMonth-day" data-day="${j}">${j}</li>`;
        }
    }

    // Grande cambia ambos
    function irMes(offset) {
        fechaCentral.setMonth(fechaCentral.getMonth() + offset);
        miniFecha = new Date(fechaCentral); // sincrónico desde el grande
        renderizarGrande();
        renderizarMini();
    }

    // Mini cambia solo su vista
    function irMiniMes(offset) {
        miniFecha.setMonth(miniFecha.getMonth() + offset);
        renderizarMini();
    }

    // Botones grandes → sincronizan ambos
    document.getElementById("prevMonth").addEventListener("click", () => {
        irMes(-1);
    });
    document.getElementById("nextMonth").addEventListener("click", () => {
        irMes(1);
    });

    // Botones mini → solo afecta mini
    document.getElementById("mini-prev").addEventListener("click", () => {
        irMiniMes(-1);
    });
    document.getElementById("mini-next").addEventListener("click", () => {
        irMiniMes(1);
    });

    // Render inicial
    renderizarGrande();
    renderizarMini();
});
