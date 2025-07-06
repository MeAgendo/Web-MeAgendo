// static/js/interactions.js

document.addEventListener('DOMContentLoaded', () => {
  const bigList     = document.getElementById('daysList');
  const miniList    = document.querySelector('.calendar-content.mini .calendar-days ul');
  const infoTitle   = document.getElementById('info-title');
  const infoDesc    = document.getElementById('info-description');
  const progressBar = document.querySelector('.info-section .progress-bar');
  const progFill    = progressBar.querySelector('.progress');

  const tasksApiUrl  = window.urlTasksApi;
  const eventsApiUrl = window.urlEventsApi;
  if (!tasksApiUrl || !eventsApiUrl) {
    console.error('Faltan window.urlTasksApi o window.urlEventsApi');
    return;
  }

  // 0) Array global con tareas y eventos
  window.events = [];

  // Helper: convierte "HH:MM" a minutos desde medianoche
  function parseMinutes(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  // Helper: convierte "YYYY-MM-DD" en Date local 00:00
  function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // 1) Función para recargar datos y repintar
  function refreshEvents() {
    return Promise.all([
      fetch(tasksApiUrl).then(r => r.json()),
      fetch(eventsApiUrl).then(r => r.json())
    ])
    .then(([tasks, events]) => {
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
      mostrarInfo();
      pintarEventos();
    })
    .catch(err => console.error('Error refrescando datos:', err));
  }
  window.refreshEvents = refreshEvents;

  // carga inicial
  refreshEvents();

  // 2) Formatea "DD MMM YYYY"
  function formatDMY(date) {
    const m = window.mesTexto[date.getMonth()];
    return `${date.getDate()} ${m} ${date.getFullYear()}`;
  }

  // 3) Mostrar lista en el panel lateral
  function mostrarInfo() {
    progressBar.classList.add('oculto');
    infoTitle.textContent = formatDMY(fechaCentral);

    const prevUl = document.querySelector('.info-section ul');
    if (prevUl) prevUl.remove();

    const hoyStr = fechaCentral.toDateString();
    const items  = window.events.filter(ev =>
      ev.date.toDateString() === hoyStr
    );

    if (!items.length) {
      infoDesc.textContent = 'No hay eventos ni tareas para este día.';
      return;
    }

    infoDesc.textContent = '';
    const ul = document.createElement('ul');
    items.forEach(ev => {
      if (ev.type === 'task') {
        progressBar.classList.remove('oculto');
        progFill.style.width = `${ev.progress}%`;
      }
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${ev.title}</strong>
        <p>${ev.time}</p>
        <p>${ev.description}</p>
        <button data-action="edit-${ev.type}" data-id="${ev.id}">✎</button>
      `;
      ul.appendChild(li);
    });
    document.querySelector('.info-section').appendChild(ul);
  }

  // 4) Pintar badges dentro del calendario y manejar click en badge
  function pintarEventos() {
    // Limpia previos
    document.querySelectorAll('#daysList li .event-list').forEach(el => el.remove());
    document.querySelectorAll('#daysList li.has-event').forEach(li => li.classList.remove('has-event'));

    const cm = fechaCentral.getMonth();
    const cy = fechaCentral.getFullYear();
    const daysMap = {};

    // Agrupar por día
    window.events.forEach(ev => {
      const d = ev.date.getDate();
      const m = ev.date.getMonth();
      const y = ev.date.getFullYear();
      if (m === cm && y === cy) {
        if (!daysMap[d]) daysMap[d] = [];
        daysMap[d].push(ev);
      }
    });

    // Insertar badges ordenados en cada <li>
    Object.entries(daysMap).forEach(([day, items]) => {
      items.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'task' ? -1 : 1;
        return a.startMinutes - b.startMinutes;
      });

      document.querySelectorAll(`#daysList li[data-day="${day}"]`).forEach(li => {
        if (!li.classList.contains('day') && !li.classList.contains('actual-day')) return;
        li.classList.add('has-event');

        let list = li.querySelector('.event-list');
        if (!list) {
          list = document.createElement('div');
          list.className = 'event-list';
          li.appendChild(list);
        }

        items.forEach(ev => {
          const item = document.createElement('div');
          item.classList.add('event-item', ev.type);
          item.textContent = ev.title;
          item.dataset.id   = ev.id;
          item.dataset.type = ev.type;
          list.appendChild(item);
        });
      });
    });
  }
  window.pintarEventos = pintarEventos;

  // 5) Click en badge → mostrar detalle sin cambiar vista
  bigList.addEventListener('click', e => {
    const badge = e.target.closest('.event-item');
    if (badge) {
      const id   = badge.dataset.id;
      const type = badge.dataset.type;
      const ev   = window.events.find(x => x.id == id && x.type == type);
      if (ev) showDetail(ev);
      return;
    }
    // Click fuera de badge: comportamiento por día
    const li = e.target.closest('li[data-day]');
    if (!li) return;
    const d = parseInt(li.dataset.day, 10);
    if (li.classList.contains('prevMonth-day')) fechaCentral.setMonth(fechaCentral.getMonth() - 1);
    else if (li.classList.contains('nextMonth-day')) fechaCentral.setMonth(fechaCentral.getMonth() + 1);
    fechaCentral.setDate(d);
    switchView('day');
    mostrarInfo();
  });

  // 6) Función para mostrar detalle en panel
  function showDetail(ev) {
    infoTitle.textContent = ev.title;
    progressBar.classList[ev.type === 'task' ? 'remove' : 'add']('oculto');
    if (ev.type === 'task') progFill.style.width = `${ev.progress}%`;

    let html = `<p><strong>Fecha:</strong> ${formatDMY(ev.date)}</p>`;
    if (ev.time) html += `<p><strong>Hora:</strong> ${ev.time}</p>`;
    if (ev.description) html += `<p>${ev.description}</p>`;
    infoDesc.innerHTML = html;
  }

  // 7) Click en mini-calendario y click fuera (igual que antes)
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

  document.addEventListener('click', e => {
    document.querySelectorAll('details[open]').forEach(detail => {
      if (!detail.contains(e.target)) detail.open = false;
    });
  });
});
