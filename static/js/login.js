// static/js/login.js

document.addEventListener('DOMContentLoaded', () => {
  const form     = document.querySelector('form');
  const username = form.querySelector('input[name="username"]');
  const password = form.querySelector('input[name="password"]');
  const userErr  = username.parentNode.querySelector('.error-tooltip');
  const passErr  = password.parentNode.querySelector('.error-tooltip');

  // 1) Toggle del ojo
  form.querySelectorAll('.toggle-password').forEach(icon =>
    icon.addEventListener('click', () => {
      const inp = document.getElementById(icon.dataset.toggle);
      inp.type = inp.type === 'password' ? 'text' : 'password';
      icon.classList.toggle('fa-eye-slash');
    })
  );

  // 2) Validación en submit
  form.addEventListener('submit', e => {
    userErr.textContent = '';
    passErr.textContent = '';

    let valid = true;
    if (!username.value.trim()) {
      userErr.textContent = 'Este campo es obligatorio';
      valid = false;
    }
    if (!password.value) {
      passErr.textContent = 'Este campo es obligatorio';
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
    }
    // Si todo es válido, el form se envía normalmente
  });

  // 3) Limpia tooltips al clicar fuera
  document.addEventListener('click', e => {
    if (!e.target.closest('.input-wrapper')) {
      userErr.textContent = '';
      passErr.textContent = '';
    }
  });
});
