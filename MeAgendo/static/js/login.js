// static/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  const form              = document.querySelector('form');
  const username          = form.querySelector('input[name="username"]');
  const password          = form.querySelector('input[name="password"]');
  const rememberCheckbox  = form.querySelector('input[name="recordar"]');
  const userErr           = username.parentNode.querySelector('.error-tooltip');
  const passErr           = password.parentNode.querySelector('.error-tooltip');

  // 0) Prefill si había elegido “recordarme”
  const savedUser = localStorage.getItem('rememberedUser');
  if (savedUser) {
    username.value           = savedUser;
    rememberCheckbox.checked = true;
  }

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
      // Si falla validación, cancela envío
      e.preventDefault();
      return;
    }

    // Guardar o limpiar “recordarme”
    if (rememberCheckbox.checked) {
      localStorage.setItem('rememberedUser', username.value.trim());
    } else {
      localStorage.removeItem('rememberedUser');
    }
    // No cancelamos e=> el form se envía normalmente,  
    // Django recibe el token CSRF del hidden y la cookie.
  });

  // 3) Limpia tooltips al clickar fuera
  document.addEventListener('click', e => {
    if (!e.target.closest('.input-wrapper')) {
      userErr.textContent = '';
      passErr.textContent = '';
    }
  });
});
