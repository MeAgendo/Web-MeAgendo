// static/js/calendar-ui.js
;(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const bigList     = document.getElementById('daysList');
    const miniList    = document.querySelector('.calendar-content.mini .calendar-days ul');
    const infoSection = document.querySelector('.info-section');
    const infoTitle   = document.getElementById('info-title');
    const infoDesc    = document.getElementById('info-description');
    const progBar     = infoSection.querySelector('.progress-bar');
    const progFill    = progBar?.querySelector('.progress');

    function formatDMY(d) {
      return `${d.getDate()} ${mesTexto[d.getMonth()]} ${d.getFullYear()}`;
    }

    function clearInfo() {
      infoDesc.textContent = '';
      infoSection.querySelector('ul')?.remove();
      infoSection
        .querySelectorAll('p:not(#info-description), button')
        .forEach(el => el.remove());
    }

    // Ahora admite excluir un evento de la lista
    function renderEventsList(date, excludeId = null) {
      const items = window.events.filter(ev =>
        ev.date.toDateString() === date.toDateString()
        && ev.id != excludeId
      );

      if (!items.length) {
        const msg = document.createElement('p');
        msg.textContent = 'No hay eventos ni tareas para este día.';
        return msg;
      }

      const ul = document.createElement('ul');
      items.forEach(ev => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${ev.title}</strong>
          ${ev.time        ? `<p>${ev.time}</p>`        : ''}
          ${ev.description ? `<p>${ev.description}</p>` : ''}
          <button data-action="edit-${ev.type}" data-id="${ev.id}">✎</button>
        `;
        ul.appendChild(li);
      });
      return ul;
    }

    function handleDayClick(date) {
      clearInfo();
      infoTitle.textContent = formatDMY(date);
      progBar?.classList.add('oculto');
      infoSection.appendChild(renderEventsList(date));
    }

    function handleBadgeClick(ev) {
      clearInfo();

      // 1) Título del badge
      infoTitle.textContent = ev.title;

      // 2) Descripción del badge (si existe)
      if (ev.description) {
        infoDesc.textContent = ev.description;
      }

      // 3) Progress bar (solo para tasks)
      if (ev.type === 'task') {
        progBar?.classList.remove('oculto');
        progFill.style.width = `${ev.progress}%`;
      } else {
        progBar?.classList.add('oculto');
      }

      // 4) Hora (si existe)
      if (ev.time) {
        const pTime = document.createElement('p');
        pTime.textContent = ev.time;
        infoSection.appendChild(pTime);
      }

      // 5) Botón de editar
      const btnEdit = document.createElement('button');
      btnEdit.dataset.action = `edit-${ev.type}`;
      btnEdit.dataset.id     = ev.id;
      btnEdit.textContent    = '✎';
      infoSection.appendChild(btnEdit);

      // 6) Fecha de ese día
      const pDate = document.createElement('p');
      pDate.textContent = formatDMY(ev.date);
      infoSection.appendChild(pDate);

      // 7) Lista de eventos y tareas de ese día, excluyendo el seleccionado
      infoSection.appendChild(renderEventsList(ev.date, ev.id));
    }

    // Click en badge
    bigList.addEventListener('click', e => {
      const badge = e.target.closest('.event-item');
      if (badge) {
        const ev = window.events.find(x =>
          x.id == badge.dataset.id && x.type === badge.dataset.type
        );
        if (ev) {
          handleBadgeClick(ev);
          return;
        }
      }

      // Click en día (li)
      const li = e.target.closest('li[data-day]');
      if (!li) return;
      let newDate = new Date(fechaCentral);
      const d = +li.dataset.day;
      if (li.classList.contains('prevMonth-day')) newDate.setMonth(newDate.getMonth() - 1);
      if (li.classList.contains('nextMonth-day')) newDate.setMonth(newDate.getMonth() + 1);
      newDate.setDate(d);

      fechaCentral = newDate;
      switchView('day');
      handleDayClick(fechaCentral);
    });

    // Click en mini-calendario
    miniList.addEventListener('click', e => {
      const li = e.target.closest('li[data-day]');
      if (!li) return;
      const d = +li.dataset.day;
      fechaCentral.setFullYear(miniFecha.getFullYear());
      fechaCentral.setMonth(miniFecha.getMonth());
      fechaCentral.setDate(d);

      switchView('day');
      handleDayClick(fechaCentral);
    });

    // API pública
    function mostrarInfo() {
      handleDayClick(fechaCentral);
    }
    function showDetail(ev) {
      handleBadgeClick(ev);
    }

    window.CalendarUI = { mostrarInfo, showDetail };
  });
})();
