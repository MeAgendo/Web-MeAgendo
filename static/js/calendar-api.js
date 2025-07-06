// static/js/calendar-api.js
;(function(){
  window.events = [];

  function parseMinutes(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  async function refreshEvents() {
    const tasksUrl  = window.urlTasksApi;
    const eventsUrl = window.urlEventsApi;
    if (!tasksUrl || !eventsUrl) {
      console.error('Faltan window.urlTasksApi o window.urlEventsApi');
      return;
    }

    try {
      const [tasks, events] = await Promise.all([
        fetch(tasksUrl).then(r => r.json()),
        fetch(eventsUrl).then(r => r.json())
      ]);

      const mappedTasks = tasks.map(t => ({
        id:           t.id,
        type:         'task',
        date:         parseLocalDate(t.due),
        title:        t.title,
        description:  t.description || '',
        time:         '',
        progress:     t.progress || 0,
        startMinutes: 0
      }));

      const mappedEvents = events.map(e => ({
        id:           e.id,
        type:         'event',
        date:         parseLocalDate(e.date),
        title:        e.title,
        description:  e.description || '',
        time:         `${e.start} – ${e.end}`,
        progress:     0,
        startMinutes: parseMinutes(e.start)
      }));

      window.events = [...mappedTasks, ...mappedEvents];
      console.log('🔄 window.events =', window.events);

      // repinta el calendario grande
      if (window.CalendarRender) CalendarRender.pintarEventos();
      // actualiza panel info solo en vista 'day'
      if (window.currentView === 'day' && window.CalendarUI) {
        CalendarUI.mostrarInfo();
      }
    }
    catch(err) {
      console.error('Error refrescando datos:', err);
    }
  }

  window.CalendarAPI = { refreshEvents };
})();
