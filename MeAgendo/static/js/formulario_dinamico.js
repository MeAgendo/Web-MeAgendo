document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("formulario-dinamico");
    const iframe  = document.getElementById("formulario-iframe");
    const btnT    = document.getElementById("btn-tarea");
    const btnE    = document.getElementById("btn-evento");

    function abrir(ruta) {
        // Preparamos el onload para enganchar el close button
        iframe.onload = () => {
            try {
                // buscamos el botón dentro del documento cargado
                const doc      = iframe.contentDocument || iframe.contentWindow.document;
                const closeBtn = doc.querySelector(".nt-close-btn,.ne-close-btn");
                
                if (closeBtn) {
                    closeBtn.addEventListener("click", () => {
                        overlay.classList.add("oculto");
                        iframe.src = "";   // limpia el src
                    });
                }
            } catch (err) {
                // si algo falla (cross‐origin, etc.), lo silenciamos
                console.warn("No se pudo enganchar el close-btn:", err);
            }
        };

        // finalmente abrimos el formulario
        iframe.src = ruta;
        overlay.classList.remove("oculto");
    }

    btnT.addEventListener("click", e => {
        e.preventDefault();
        abrir("cuestionario_Nueva_Tarea.html");
    });

    btnE.addEventListener("click", e => {
        e.preventDefault();
        abrir("cuestionario_Nuevo_Evento.html");
    });

    // Cierra si pinchas fuera del iframe
    overlay.addEventListener("click", e => {
        if (e.target === overlay) {
            overlay.classList.add("oculto");
            iframe.src = "";
        }
    });
});
