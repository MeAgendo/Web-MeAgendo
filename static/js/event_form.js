// static/js/event_form.js

document.addEventListener('DOMContentLoaded', () => {
  // Selecciona el formulario y el contenedor de error
  const form   = document.querySelector('form.ne-form');
  const errDiv = document.getElementById('client-error');

  form.addEventListener('submit', e => {
    // Evita el envío automático
    e.preventDefault();

    // Limpia y oculta cualquier error previo
    errDiv.textContent       = '';
    errDiv.style.visibility  = 'hidden';
    errDiv.classList.add('oculto');

    const fecha  = form['fecha-limite'].value;
    const titulo = form['titulo'].value.trim();
    const start  = form['hora-desde'].value;
    const end    = form['hora-hasta'].value;

    const mensajes = [];

    // Validaciones
    if (!fecha)                  mensajes.push('La fecha es obligatoria.');
    if (!titulo)                 mensajes.push('El título es obligatorio.');
    if ((start && !end) || (!start && end)) {
      mensajes.push(
        'Completa ambos campos de horario'
      );
    } else if (start && end && start >= end) {
      mensajes.push('La hora de inicio debe ser anterior a la hora de fin.');
    }

    if (mensajes.length > 0) {
      // Muestra errores sin recargar la página
      errDiv.innerText          = mensajes.join(' ');
      errDiv.style.visibility   = 'visible';
      errDiv.classList.remove('oculto');
      return;
    }

    // Si todo es válido, envía el formulario
    form.submit();
  });
});
