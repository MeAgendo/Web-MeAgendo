// interactions.js
document.addEventListener('DOMContentLoaded', function() {
    // Referencias al DOM
    const bigList     = document.getElementById('daysList');
    const miniList    = document.querySelector('.calendar-content.mini .calendar-days ul');
    const infoTitle   = document.getElementById('info-title');
    const infoDesc    = document.getElementById('info-description');
    const headerLbl   = document.getElementById('currentLabel');
    const progressBar = document.querySelector('.info-section .progress-bar');
    const progFill    = progressBar.querySelector('.progress');

    // Oculta la barra de progreso al inicio
    progressBar.classList.add('oculto');

    // Formateo “DD MMM YYYY” usando tu array global mesTexto
    function formatDMY(date) {
        const m = window.mesTexto[date.getMonth()];
        return `${date.getDate()} ${m} ${date.getFullYear()}`;
    }

    // 1) Clic en calendario grande
    bigList.addEventListener('click', e => {
        const li = e.target.closest('li[data-day]');
        if (!li) return;
        const d = parseInt(li.dataset.day, 10);

        // Ajusta mes si es previo/siguiente
        if (li.classList.contains('prevMonth-day')) {
            fechaCentral.setMonth(fechaCentral.getMonth() - 1);
        } else if (li.classList.contains('nextMonth-day')) {
            fechaCentral.setMonth(fechaCentral.getMonth() + 1);
        }

        fechaCentral.setDate(d);
        switchView('day');
        mostrarInfo();
    });

    // 2) Clic en mini calendario
    miniList.addEventListener('click', e => {
        const li = e.target.closest('li[data-day]');
        if (!li) return;
        const d = parseInt(li.dataset.day, 10);

        fechaCentral.setFullYear(miniFecha.getFullYear());
        fechaCentral.setMonth(miniFecha.getMonth());
        fechaCentral.setDate(d);

        switchView('day');
        mostrarInfo();
    });

    // 3) Pinta título, lista y controla la barra de progreso
    function mostrarInfo() {
        // 3.1) Oculta la barra de progreso
        progressBar.classList.add('oculto');

        // 3.2) Título: siempre “DD MMM YYYY”
        infoTitle.textContent = formatDMY(fechaCentral);

        // 3.3) Limpia lista previa
        const prevUl = document.querySelector('.info-section ul');
        if (prevUl) prevUl.remove();

        // 3.4) Filtra eventos/tareas de hoy
        const items = (window.events || []).filter(ev =>
            ev.date === fechaCentral.toDateString()
        );

        if (!items.length) {
            infoDesc.textContent = 'No hay eventos ni tareas para este día.';
            return;
        }

        // 3.5) Construye lista y muestra barra si hay tareas
        infoDesc.textContent = '';
        const ul = document.createElement('ul');
        items.forEach(ev => {
            if (ev.type === 'task') {
                progressBar.classList.remove('oculto');
                progFill.style.width = (ev.progress || 0) + '%';
            }
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${ev.time} – ${ev.title}</span>
                <button data-action="edit-${ev.type}"
                        data-id="${ev.id}">✎</button>
            `;
            ul.appendChild(li);
        });
        document.querySelector('.info-section').appendChild(ul);
    }

    // Exponer por si acaso
    window.mostrarInfo = mostrarInfo;

    // 4) Cierra <details> abiertos al clicar fuera
    document.addEventListener('click', e => {
        document.querySelectorAll('details[open]').forEach(detail => {
            if (!detail.contains(e.target)) {
                detail.open = false;
            }
        });
    });

    // 5) Llamada inicial: muestra info del día actual
    mostrarInfo();
});
