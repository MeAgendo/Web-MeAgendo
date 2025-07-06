// static/js/calendar-sync.js

;(function(){
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
    const prevBtn      = document.getElementById("prevMonth");
    const nextBtn      = document.getElementById("nextMonth");
    const viewMonthBtn = document.getElementById("viewMonth");
    const viewWeekBtn  = document.getElementById("viewWeek");
    const viewDayBtn   = document.getElementById("viewDay");
    const daysList     = document.getElementById("daysList");
    const currentLabel = document.getElementById("currentLabel");

    const miniUl      = document.querySelector(".calendar-content.mini .calendar-days ul");
    miniUl.id         = "miniDaysList";
    const miniPrevBtn = document.getElementById("mini-prev");
    const miniNextBtn = document.getElementById("mini-next");

    // 3) FORMAT DMY
    function formatDMY(d) {
      return `${d.getDate()} ${mesTexto[d.getMonth()]} ${d.getFullYear()}`;
    }

    // 4) UPDATE HEADER
    function updateHeader() {
      if (currentView === "month") {
        currentLabel.textContent =
          `${mesTexto[fechaCentral.getMonth()]} ${fechaCentral.getFullYear()}`;
      }
      else if (currentView === "week") {
        const start = new Date(fechaCentral);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        currentLabel.textContent =
          `${formatDMY(start)} – ${formatDMY(end)}`;
      }
      else {
        currentLabel.textContent = formatDMY(fechaCentral);
      }
    }

    // 5) RENDERS
    function renderMonth() {
      const y = fechaCentral.getFullYear();
      const m = fechaCentral.getMonth();
      const firstIdx  = new Date(y, m, 1).getDay();
      const total     = new Date(y, m + 1, 0).getDate();
      const prevTotal = new Date(y, m, 0).getDate();
      daysList.innerHTML = "";

      for (let i = firstIdx - 1; i >= 0; i--) {
        const val = prevTotal - i;
        daysList.innerHTML += `<li class="prevMonth-day" data-day="${val}">${val}</li>`;
      }
      for (let d = 1; d <= total; d++) {
        const isToday = new Date().toDateString() === new Date(y, m, d).toDateString();
        daysList.innerHTML += `<li class="${isToday?'actual-day':'day'}" data-day="${d}">${d}</li>`;
      }
      const filled = firstIdx + total;
      const toFill = 42 - filled;
      for (let j = 1; j <= toFill; j++) {
        daysList.innerHTML += `<li class="nextMonth-day" data-day="${j}">${j}</li>`;
      }
    }

    function renderWeek() {
      const start = new Date(fechaCentral);
      start.setDate(start.getDate() - start.getDay());
      daysList.innerHTML = "";
      for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        const d = day.getDate();
        const isToday = day.toDateString() === new Date().toDateString();
        daysList.innerHTML += `<li class="${isToday?'actual-day':'day'}" data-day="${d}">${d}</li>`;
      }
    }

    function renderDay() {
      const d = fechaCentral.getDate();
      const isToday = fechaCentral.toDateString() === new Date().toDateString();
      daysList.innerHTML = `<li class="${isToday?'actual-day':'day'}" data-day="${d}">${d}</li>`;
    }

    function renderMini() {
      const y = miniFecha.getFullYear();
      const m = miniFecha.getMonth();
      const firstIdx  = new Date(y, m, 1).getDay();
      const total     = new Date(y, m + 1, 0).getDate();
      const prevTotal = new Date(y, m, 0).getDate();
      document.getElementById("mini-date").textContent = `${mesTexto[m]} ${y}`;
      miniUl.innerHTML = "";

      for (let i = firstIdx - 1; i >= 0; i--) {
        const val = prevTotal - i;
        miniUl.innerHTML += `<li class="prevMonth-day" data-day="${val}">${val}</li>`;
      }
      for (let d = 1; d <= total; d++) {
        const isHoy = new Date().toDateString() === new Date(y, m, d).toDateString();
        miniUl.innerHTML += `<li class="${isHoy?'actual-day':'day'}" data-day="${d}">${d}</li>`;
      }
      const filled = firstIdx + total;
      for (let j = 1; j <= 42 - filled; j++) {
        miniUl.innerHTML += `<li class="nextMonth-day" data-day="${j}">${j}</li>`;
      }
    }

    // 6) NAVIGATION & SWITCH VIEW
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
      container.classList.add(`${view}-view`);

      if (view === "month") renderMonth();
      if (view === "week")  renderWeek();
      if (view === "day")   renderDay();

      // PINTA BADGES en gran calendario
      if (window.CalendarRender) CalendarRender.pintarEventos();
      // MUESTRA INFO solo en vista día
      if (view === "day" && window.CalendarUI) CalendarUI.mostrarInfo();
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

    // 9) CARGA EVENTOS
    if (window.CalendarAPI) CalendarAPI.refreshEvents();
  });
})();
