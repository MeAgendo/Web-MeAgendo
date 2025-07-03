// static/js/calendar-api.js
;(function(){
  window.events = [];

  function parseMinutes(hhmm) {
    const [h,m] = hhmm.split(':').map(Number);
    return h*60 + m;
  }
  function parseLocalDate(str) {
    const [y,mo,d] = str.split('-').map(Number);
    return new Date(y,mo-1,d);
  }

  function refreshEvents() {
    return Promise.all([
      fetch(window.urlTasksApi).then(r=>r.json()),
      fetch(window.urlEventsApi).then(r=>r.json())
    ])
    .then(([tasks,events])=>{
      window.events = [
        ...tasks.map(t=>({
          id:          t.id,
          type:        'task',
          date:        parseLocalDate(t.due),
          title:       t.title,
          description: t.description||'',
          time:        '',
          progress:    t.progress||0,
          startMinutes:0
        })),
        ...events.map(e=>({
          id:          e.id,
          type:        'event',
          date:        parseLocalDate(e.date),
          title:       e.title,
          description: e.description||'',
          time:        `${e.start} – ${e.end}`,
          progress:    0,
          startMinutes: parseMinutes(e.start)
        }))
      ];
      console.log('🔄 events refreshed:', window.events);
      if (window.CalendarRender) CalendarRender.pintarEventos();
      if (window.CalendarUI)     CalendarUI.mostrarInfo();
    })
    .catch(console.error);
  }

  window.CalendarAPI = { refreshEvents };
  // carga inicial
  window.CalendarAPI.refreshEvents();
})();
