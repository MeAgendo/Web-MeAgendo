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

  // Toggle de visibilidad (ojo)
  form.querySelectorAll('.toggle-password').forEach(icon =>
    icon.addEventListener('click', () => {
      const inp = document.getElementById(icon.dataset.toggle);
      inp.type = inp.type === 'password' ? 'text' : 'password';
      icon.classList.toggle('fa-eye-slash');
    })
  );

  // Validación de fuerza
  function isStrongPassword(pwd) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return re.test(pwd);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
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
      p1Err.textContent = 'Mínimo 8 car., mayúscula, minúscula, número y especial';
      valid = false;
    }
    if (pass1.value !== pass2.value) {
      p2Err.textContent = 'Las contraseñas no coinciden';
      valid = false;
    }
    if (!valid) return;

    // Obtener CSRF token
    const csrfToken = form.querySelector('[name="csrfmiddlewaretoken"]').value;

    try {
      const resp = await fetch(form.action, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept':      'application/json',
          'X-CSRFToken': csrfToken
        },
        body: new URLSearchParams(new FormData(form))
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        infoMsg.textContent = data.message;
        // Tras 2 segundos retorna al login
        setTimeout(() => {
          window.location.href = '/accounts/login/';
        }, 2000);
      } else {
        // Muestra el mensaje de error devuelto
        codeErr.textContent = data.message || 'Error al restablecer';
      }
    } catch (err) {
      console.error(err);
      infoMsg.textContent = 'Error de conexión. Intenta más tarde.';
    }
  });
});
