// static/js/reset_password.js

document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('reset-form');
  const codeInput = form.querySelector('input[name="code"]');
  const pass1     = form.querySelector('input[name="password1"]');
  const pass2     = form.querySelector('input[name="password2"]');
  const codeErr   = codeInput.parentNode.querySelector('.error-tooltip');
  const p1Err     = pass1.parentNode.querySelector('.error-tooltip');
  const p2Err     = pass2.parentNode.querySelector('.error-tooltip');
  const infoMsg   = form.querySelector('.info-msg');

  // 0) Toggle de visibilidad (ojo) para cada input password
  form.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
      const targetId = icon.dataset.toggle;
      const inputEl  = document.getElementById(targetId);
      if (!inputEl) return;

      // Cambia tipo y clase de icono
      if (inputEl.type === 'password') {
        inputEl.type = 'text';
        icon.classList.add('fa-eye-slash');
      } else {
        inputEl.type = 'password';
        icon.classList.remove('fa-eye-slash');
      }
    });
  });

  // 1) Comprueba fuerza de contraseña
  function isStrongPassword(pwd) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return re.test(pwd);
  }

  // 2) Envío del form con fetch + validaciones
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // limpia mensajes
    codeErr.textContent = '';
    p1Err.textContent   = '';
    p2Err.textContent   = '';
    infoMsg.textContent = '';

    let valid = true;
    if (!codeInput.value.trim()) {
      codeErr.textContent = 'Introduce el código que recibiste';
      valid = false;
    }
    if (!isStrongPassword(pass1.value)) {
      p1Err.textContent = 'Mínimo 8 car., mayúsculas, minúsculas, número y especial';
      valid = false;
    }
    if (pass1.value !== pass2.value) {
      p2Err.textContent = 'Las contraseñas no coinciden';
      valid = false;
    }
    if (!valid) return;

    // prepara datos y CSRF
    const csrfToken = form.querySelector('[name="csrfmiddlewaretoken"]').value;
    const payload   = new URLSearchParams(new FormData(form));

    try {
      const resp = await fetch(form.action, {
        method:      'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken,
          'Accept':      'application/json'
        },
        body: payload
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        infoMsg.textContent = data.message;
        setTimeout(() => window.location.href = '/accounts/login/', 2000);
      } else {
        // error genérico o específico del código
        codeErr.textContent = data.message || 'Error al restablecer';
      }
    } catch (err) {
      console.error(err);
      infoMsg.textContent = 'Error de conexión. Intenta más tarde.';
    }
  });
});
