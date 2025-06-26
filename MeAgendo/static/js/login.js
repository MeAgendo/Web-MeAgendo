// static/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const form     = document.querySelector('form');
    const username = form.querySelector('input[name="username"]');
    const password = form.querySelector('input[name="password"]');
    const userErr  = username.parentNode.querySelector('.error-tooltip');
    const passErr  = password.parentNode.querySelector('.error-tooltip');

    // 1) Toggle del ojo
    form.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', () => {
            const inp = document.getElementById(icon.dataset.toggle);
            if (inp.type === 'password') {
                inp.type = 'text';
                icon.classList.replace('fa-eye','fa-eye-slash');
            } else {
                inp.type = 'password';
                icon.classList.replace('fa-eye-slash','fa-eye');
            }
        });
    });

    // 2) Envío y manejo de errores
    form.addEventListener('submit', async e => {
        e.preventDefault();
        userErr.textContent = '';
        passErr.textContent = '';

        // Validación mínima
        let valid = true;
        if (!username.value.trim()) {
            userErr.textContent = 'Este campo es obligatorio';
            valid = false;
        }
        if (!password.value) {
            passErr.textContent = 'Este campo es obligatorio';
            valid = false;
        }
        if (!valid) return;

        try {
            const resp = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new URLSearchParams(new FormData(form)),
                credentials: 'include'
            });

            // Errores de servidor
            if (resp.status >= 500) {
                passErr.textContent = 'Problema de conexión. Intenta más tarde';
                return;
            }
            // Credenciales inválidas
            if (resp.status === 401) {
                passErr.textContent = 'Usuario o contraseña incorrectos';
                return;
            }

            const body = await resp.json();
            if (resp.ok && body.success) {
                window.location.href = body.redirect || '/';
            } else {
                if (body.field === 'username') {
                    userErr.textContent = body.message || 'Cuenta no encontrada';
                } else {
                    passErr.textContent = body.message || 'Usuario o contraseña incorrectos';
                }
            }
        } catch (err) {
            passErr.textContent = 'Problema de conexión. Intenta más tarde';
            console.error(err);
        }
    });

    // 3) Limpia los tooltips al hacer click fuera de los inputs
    document.addEventListener('click', e => {
        if (!e.target.closest('.input-wrapper')) {
            userErr.textContent = '';
            passErr.textContent = '';
        }
    });
});
