// static/js/formulario_dinamico.js

function getCookie(name) {
  const value = document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="));
  return value ? decodeURIComponent(value.split("=")[1]) : null;
}
const csrftoken = getCookie("csrftoken");

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
    const fullUrl = url.startsWith("http") ? url : window.location.origin + url;
    const loadUrl = fullUrl.includes("/edit/")
      ? fullUrl + (fullUrl.includes("?") ? "&partial=1" : "?partial=1")
      : fullUrl;

    console.log("→ Abriendo en iframe:", loadUrl);
    iframe.src = loadUrl;
    overlay.classList.remove("oculto");

    iframe.onload = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      // Cerrar modal
      doc
        .querySelectorAll(".nt-close-btn, .ne-close-btn, .btn-ok")
        .forEach(btn => btn.addEventListener("click", cerrar));

      // Captura de submit en el form
      const form = doc.querySelector("form");
      if (form) {
        form.addEventListener("submit", async ev => {
          ev.stopImmediatePropagation();
          ev.preventDefault();

          const data = new FormData(form);
          const resp = await fetch(form.action, {
            method: form.method,
            body: data,
            headers: {
              "X-Requested-With": "XMLHttpRequest",
              "X-CSRFToken": csrftoken
            }
          });

          if (resp.ok) {
            cerrar();
          } else {
            const html = await resp.text();
            doc.body.innerHTML = html;
          }
        });
      }

      // Botón ELIMINAR (solo en edición)
      const deleteBtn = doc.getElementById("delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          const urlDel = deleteBtn.dataset.deleteUrl;
          if (!urlDel) return;
          await fetch(urlDel, {
            method: "POST",
            headers: {
              "X-Requested-With": "XMLHttpRequest",
              "X-CSRFToken": csrftoken
            }
          });
          cerrar();
        });
      }
    };
  }

  // Abrir formulario de nueva tarea/evento
  btnT.addEventListener("click", e => {
    e.preventDefault();
    abrir(window.urlNewTask);
  });
  btnE.addEventListener("click", e => {
    e.preventDefault();
    abrir(window.urlNewEvent);
  });

  // Editar solo desde botones ✎
  document.body.addEventListener("click", e => {
    const btn = e.target.closest('button[data-action^="edit-"]');
    if (!btn) return;
    e.preventDefault();

    const [ , type ] = btn.dataset.action.split("-");
    const editUrl = type === "task"
      ? window.urlNewTask.replace(/\/new\/$/, `/${btn.dataset.id}/edit/`)
      : window.urlNewEvent.replace(/\/new\/$/, `/${btn.dataset.id}/edit/`);
    abrir(editUrl);
  });

  // Cerrar al hacer click fuera del iframe
  overlay.addEventListener("click", e => {
    if (e.target === overlay) cerrar();
  });
});
