// static/js/formulario_dinamico.js

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("formulario-dinamico");
  const iframe  = document.getElementById("formulario-iframe");
  const btnT    = document.getElementById("btn-tarea");
  const btnE    = document.getElementById("btn-evento");

  function abrir(url) {
    if (!url) {
      console.error("URL de formulario no definida");
      return;
    }

    // 1) forma la URL completa con el mismo esquema://host:puerto
    const fullUrl = url.startsWith("http")
      ? url
      : window.location.origin + url;

    console.log("→ Abriendo en iframe:", fullUrl);
    iframe.src = fullUrl;

    // 2) muestra el overlay
    overlay.classList.remove("oculto");

    // 3) engancha el close-btn tras cargar
    iframe.onload = () => {
      try {
        const doc      = iframe.contentDocument || iframe.contentWindow.document;
        const closeBtn = doc.querySelector(".nt-close-btn, .ne-close-btn");
        if (closeBtn) {
          closeBtn.addEventListener("click", () => {
            overlay.classList.add("oculto");
            iframe.src = "";
            if (window.refreshEvents) window.refreshEvents();
          });
        }
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

  // Cerrar overlay haciendo click en la zona semitransparente
  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      overlay.classList.add("oculto");
      iframe.src = "";
      if (window.refreshEvents) window.refreshEvents();
    }
  });
});
