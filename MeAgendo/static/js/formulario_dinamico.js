// static/js/formulario_dinamico.js

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("formulario-dinamico");
  const iframe  = document.getElementById("formulario-iframe");
  const btnT    = document.getElementById("btn-tarea");
  const btnE    = document.getElementById("btn-evento");

  function cerrar() {
    overlay.classList.add("oculto");
    iframe.src = "";

    if (window.CalendarAPI) {
      CalendarAPI.refreshEvents()
        .then(() => {
          if (window.switchView && window.currentView) {
            switchView(window.currentView);
          }
        })
        .catch(err => console.error("Error al refrescar tras cerrar modal:", err));
    }
  }

  function abrir(url) {
    if (!url) {
      console.error("URL de formulario no definida");
      return;
    }

    const fullUrl = url.startsWith("http")
      ? url
      : window.location.origin + url;

    console.log("→ Abriendo en iframe:", fullUrl);
    iframe.src = fullUrl;
    overlay.classList.remove("oculto");

    iframe.onload = () => {
      try {
        const doc      = iframe.contentDocument || iframe.contentWindow.document;
        const closeBtn = doc.querySelector(".nt-close-btn, .ne-close-btn");
        if (closeBtn) closeBtn.addEventListener("click", cerrar);
      } catch (err) {
        console.warn("No se pudo enganchar el close-btn:", err);
      }
    };
  }

  btnT.addEventListener("click", e => {
    e.preventDefault();
    abrir(window.urlNewTask);
  });

  btnE.addEventListener("click", e => {
    e.preventDefault();
    abrir(window.urlNewEvent);
  });

  overlay.addEventListener("click", e => {
    if (e.target === overlay) cerrar();
  });
});
