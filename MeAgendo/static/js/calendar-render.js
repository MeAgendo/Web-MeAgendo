// static/js/calendar-render.js
;(function(){
  function pintarEventos() {
    const daysList = document.getElementById('daysList');
    if (!daysList) return;

    // limpia previos SOLO en calendario grande
    daysList.querySelectorAll('.event-list').forEach(el => el.remove());
    daysList.querySelectorAll('li.has-event').forEach(li => li.classList.remove('has-event'));

    const cm = fechaCentral.getMonth();
    const cy = fechaCentral.getFullYear();

    window.events.forEach(ev => {
      const d = ev.date.getDate();
      const m = ev.date.getMonth();
      const y = ev.date.getFullYear();
      if (m !== cm || y !== cy) return;

      // inserta SOLO en días reales del mes activo
      daysList.querySelectorAll(`li.day[data-day="${d}"], li.actual-day[data-day="${d}"]`).forEach(li => {
        if (!li.classList.contains('day') && !li.classList.contains('actual-day')) return;
        li.classList.add('has-event');
        let wrap = li.querySelector('.event-list');
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'event-list';
          li.appendChild(wrap);
        }
        const badge = document.createElement('div');
        badge.className = `event-item ${ev.type}`;
        badge.textContent = ev.title;
        badge.dataset.id   = ev.id;
        badge.dataset.type = ev.type;
        wrap.appendChild(badge);
      });
    });
  }

  window.CalendarRender = { pintarEventos };
})();
