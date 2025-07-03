// static/js/calendar-sync.js

document.addEventListener("DOMContentLoaded", function() {
  // 1) DATOS GLOBALES
  window.mesTexto     = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];
  window.fechaCentral = new Date();
  window.miniFecha    = new Date();
  window.currentView  = "month";

  // 2) REFERENCIAS AL DOM
  const prevBtn        = document.getElementById("prevMonth");
  const nextBtn        = document.getElementById("nextMonth");
  const viewMonthBtn   = document.getElementById("viewMonth");
  const viewWeekBtn    = document.getElementById("viewWeek");
  const viewDayBtn     = document.getElementById("viewDay");
  const daysList       = document.getElementById("daysList");
  const currentLabelEl = document.getElementById("currentLabel");

  // mini-calendario: le asignamos un ID para interactions.js
  const miniUl         = document.querySelector(".calendar-content.mini .calendar-days ul");
  miniUl.id            = "miniDaysList";
  const miniPrevBtn    = document.getElementById("mini-prev");
  const miniNextBtn    = document.getElementById("mini-next");

  // 3) FORMAT DMY
  function formatDMY(d) {
    return `${d.getDate()} ${mesTexto[d.getMonth()]} ${d.getFullYear()}`;
  }

  // 4) HEADER
  function updateHeader() {
    if (currentView === "month") {
      currentLabelEl.textContent =
        `${mesTexto[fechaCentral.getMonth()]} ${fechaCentral.getFullYear()}`;
    }
    else if (currentView === "week") {
      const s = new Date(fechaCentral);
      s.setDate(s.getDate() - s.getDay());
      const e = new Date(s);
      e.setDate(s.getDate() + 6);
      currentLabelEl.textContent =
        `${formatDMY(s)} – ${formatDMY(e)}`;
    }
    else {
      currentLabelEl.textContent = formatDMY(fechaCentral);
    }
  }

  // 5) RENDERS
  function renderMonth() {
    const y         = fechaCentral.getFullYear();
    const m         = fechaCentral.getMonth();
    const firstIdx  = new Date(y,m,1).getDay();
    const total     = new Date(y,m+1,0).getDate();
    const prevTotal = new Date(y,m,0).getDate();
    daysList.innerHTML = "";

    // prevMonth-day
    for (let i = firstIdx - 1; i >= 0; i--) {
      const val = prevTotal - i;
      daysList.innerHTML +=
        `<li class="prevMonth-day" data-day="${val}">${val}</li>`;
    }
    // mes actual
    for (let d = 1; d <= total; d++) {
      const isToday = new Date().toDateString() ===
                      new Date(y,m,d).toDateString();
      daysList.innerHTML +=
        `<li class="${isToday?'actual-day':'day'}" data-day="${d}">${d}</li>`;
    }
    // nextMonth-day
    const filled = firstIdx + total;
    const toFill = 42 - filled;
    for (let j = 1; j <= toFill; j++) {
      daysList.innerHTML +=
        `<li class="nextMonth-day" data-day="${j}">${j}</li>`;
    }
  }

  function renderWeek() {
    const s = new Date(fechaCentral);
    s.setDate(s.getDate() - s.getDay());
    daysList.innerHTML = "";
    for (let i = 0; i < 7; i++) {
      const day = new Date(s);
      day.setDate(s.getDate() + i);
      const d = day.getDate();
      const isToday = day.toDateString() === new Date().toDateString();
      daysList.innerHTML +=
        `<li class="${isToday?'actual-day':'day'}" data-day="${d}">${d}</li>`;
    }
  }

  function renderDay() {
    const d       = fechaCentral.getDate();
    const isToday = fechaCentral.toDateString() === new Date().toDateString();
    daysList.innerHTML =
      `<li class="${isToday?'actual-day':'day'}" data-day="${d}">${d}</li>`;
  }

  function renderMini() {
    const y         = miniFecha.getFullYear();
    const m         = miniFecha.getMonth();
    const firstIdx  = new Date(y,m,1).getDay();
    const total     = new Date(y,m+1,0).getDate();
    const prevTotal = new Date(y,m,0).getDate();
    document.getElementById("mini-date").textContent =
      `${mesTexto[m]} ${y}`;
    miniUl.innerHTML = "";

    for (let i = firstIdx - 1; i >= 0; i--) {
      const val = prevTotal - i;
      miniUl.innerHTML +=
        `<li class="prevMonth-day" data-day="${val}">${val}</li>`;
    }
    for (let d = 1; d <= total; d++) {
      const isHoy = new Date().toDateString() ===
                    new Date(y,m,d).toDateString();
      miniUl.innerHTML +=
        `<li class="${isHoy?'actual-day':'day'}" data-day="${d}">${d}</li>`;
    }
    const filled = firstIdx + total;
    for (let j = 1; j <= 42 - filled; j++) {
      miniUl.innerHTML +=
        `<li class="nextMonth-day" data-day="${j}">${j}</li>`;
    }
  }

  // 6) NAVEGACIÓN & SWITCHVIEW
  function irMes(offset) {
    fechaCentral.setMonth(fechaCentral.getMonth() + offset);
    if (currentView === "month") {
      miniFecha = new Date(fechaCentral);
      renderMini();
    }
    switchView(currentView);
  }
  function irMiniMes(offset) {
    miniFecha.setMonth(miniFecha.getMonth() + offset);
    renderMini();
  }

  function switchView(view) {
    currentView = view;
    updateHeader();
    const container = document.querySelector(".calendar-content:not(.mini)");
    container.classList.remove("month-view","week-view","day-view");
    container.classList.add(view + "-view");

    if (view === "month") renderMonth();
    if (view === "week")  renderWeek();
    if (view === "day")   renderDay();

    // tras redibujar, pinta dots de eventos
    if (window.pintarEventos) window.pintarEventos();
  }
  window.switchView = switchView;

  // 7) BIND BOTONES
  prevBtn     .addEventListener("click", () => {
    if (currentView === "month") irMes(-1);
    else if (currentView === "week") {
      fechaCentral.setDate(fechaCentral.getDate() - 7);
      switchView("week");
    }
    else {
      fechaCentral.setDate(fechaCentral.getDate() - 1);
      switchView("day");
    }
  });
  nextBtn     .addEventListener("click", () => {
    if (currentView === "month") irMes(1);
    else if (currentView === "week") {
      fechaCentral.setDate(fechaCentral.getDate() + 7);
      switchView("week");
    }
    else {
      fechaCentral.setDate(fechaCentral.getDate() + 1);
      switchView("day");
    }
  });
  viewMonthBtn.addEventListener("click", () => switchView("month"));
  viewWeekBtn .addEventListener("click", () => switchView("week"));
  viewDayBtn  .addEventListener("click", () => switchView("day"));
  miniPrevBtn .addEventListener("click", () => irMiniMes(-1));
  miniNextBtn .addEventListener("click", () => irMiniMes(1));

  // 8) RENDER INICIAL
  switchView("month");
  renderMini();

  // al arrancar, pinta dots de eventos en el mes actual
  if (window.pintarEventos) window.pintarEventos();
});
