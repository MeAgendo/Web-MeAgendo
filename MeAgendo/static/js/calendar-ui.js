// static/js/calendar-ui.js
;(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const bigList   = document.getElementById('daysList');
    const miniList  = document.querySelector('.calendar-content.mini .calendar-days ul');
    const infoTitle = document.getElementById('info-title');
    const infoDesc  = document.getElementById('info-description');
    const progBar   = document.querySelector('.info-section .progress-bar');
    const progFill  = progBar?.querySelector('.progress');

    function formatDMY(d) {
      return `${d.getDate()} ${mesTexto[d.getMonth()]} ${d.getFullYear()}`;
    }

    function mostrarInfo() {
      if (window.currentView !== 'day') return;

      progBar?.classList.add('oculto');
      infoTitle.textContent = formatDMY(fechaCentral);
      document.querySelector('.info-section ul')?.remove();

      const items = window.events.filter(ev =>
        ev.date.toDateString() === fechaCentral.toDateString()
      );

      if (!items.length) {
        infoDesc.textContent = 'No hay eventos ni tareas para este día.';
        return;
      }

      infoDesc.textContent = '';
      const ul = document.createElement('ul');
      items.forEach(ev => {
        if (ev.type === 'task') {
          progBar?.classList.remove('oculto');
          progFill.style.width = `${ev.progress}%`;
        }
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${ev.title}</strong>
          ${ev.time ? `<p>${ev.time}</p>` : ''}
          ${ev.description ? `<p>${ev.description}</p>` : ''}
          <button data-action="edit-${ev.type}" data-id="${ev.id}">✎</button>
        `;
        ul.appendChild(li);
      });
      document.querySelector('.info-section').appendChild(ul);
    }

    function showDetail(ev) {
      infoTitle.textContent = ev.title;
      progBar.classList[ev.type === 'task' ? 'remove' : 'add']('oculto');
      if (ev.type === 'task') progFill.style.width = `${ev.progress}%`;

      infoDesc.innerHTML = `
        <p><strong>Fecha:</strong> ${formatDMY(ev.date)}</p>
        ${ev.time ? `<p><strong>Hora:</strong> ${ev.time}</p>` : ''}
        ${ev.description ? `<p>${ev.description}</p>` : ''}
      `;
    }

    // clic en badge (solo en calendario grande)
    bigList.addEventListener('click', e => {
      const badge = e.target.closest('.event-item');
      if (badge) {
        const ev = window.events.find(x =>
          x.id == badge.dataset.id && x.type === badge.dataset.type
        );
        if (ev) return showDetail(ev);
      }
      // clic en día cambia a vista 'day'
      const li = e.target.closest('li[data-day]');
      if (!li) return;
      const d = +li.dataset.day;
      if (li.classList.contains('prevMonth-day')) fechaCentral.setMonth(fechaCentral.getMonth() - 1);
      if (li.classList.contains('nextMonth-day')) fechaCentral.setMonth(fechaCentral.getMonth() + 1);
      fechaCentral.setDate(d);
      switchView('day');
    });

    // clic en mini-calendario solo cambia vista
    miniList.addEventListener('click', e => {
      const li = e.target.closest('li[data-day]');
      if (!li) return;
      const d = +li.dataset.day;
      fechaCentral.setFullYear(miniFecha.getFullYear());
      fechaCentral.setMonth(miniFecha.getMonth());
      fechaCentral.setDate(d);
      switchView('day');
    });

    window.CalendarUI = { mostrarInfo, showDetail };
  });
})();
