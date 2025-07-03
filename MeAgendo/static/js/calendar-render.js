// static/js/calendar-render.js
;(function(){
  function pintarEventos() {
    const days = document.getElementById('daysList');
    days.querySelectorAll('.event-list').forEach(el=>el.remove());
    days.querySelectorAll('li.has-event').forEach(li=>li.classList.remove('has-event'));

    const m0 = fechaCentral.getMonth(), y0 = fechaCentral.getFullYear();
    window.events.forEach(ev=>{
      const d = ev.date.getDate(),
            m = ev.date.getMonth(),
            y = ev.date.getFullYear();
      if (m!==m0 || y!==y0) return;

      days.querySelectorAll(`li.day[data-day="${d}"], li.actual-day[data-day="${d}"]`)
        .forEach(li=>{
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
  // en caso de cargarse tras API
  if (window.CalendarAPI) window.CalendarAPI.refreshEvents();
})();
