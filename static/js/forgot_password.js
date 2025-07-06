// static/js/forgot_password.js
document.addEventListener('DOMContentLoaded', () => {
  const form    = document.getElementById('forgot-form');
  const email   = form.querySelector('input[name="email"]');
  const errTip  = email.parentNode.querySelector('.error-tooltip');
  const infoMsg = form.querySelector('.info-msg');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errTip.textContent = '';
    infoMsg.textContent = '';

    // Validación front
    if (!email.value.trim()) {
      errTip.textContent = 'El correo es obligatorio';
      return;
    }
    if (!email.checkValidity()) {
      errTip.textContent = 'Ingresa un email válido';
      return;
    }

    // Obtener CSRF token del hidden input
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
        // Redirige después de 3 segundos al reset-password
        setTimeout(() => {
          window.location.href = form.action.replace('forgot-password', 'reset-password');
        }, 3000);
      } else {
        errTip.textContent = data.message || 'No se pudo enviar el código';
      }
    } catch (err) {
      console.error(err);
      errTip.textContent = 'Problema de conexión. Intenta más tarde.';
    }
  });
});
