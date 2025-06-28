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

    // Pre-llenar token desde la URL y limpiar la barra sin exponerlo
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('code');
    if (token) {
        codeInput.value = token;
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Toggle de visibilidad (ojo)
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

    // Validación de fuerza: mínimo 8 car., mayúscula, minúscula, número y especial
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

        // Envío al backend (Django validar el código y cambiar la contraseña)
        try {
            const resp = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new URLSearchParams(new FormData(form)),
                credentials: 'include'
            });
            const body = await resp.json();

            if (resp.ok && body.success) {
                window.location.href = body.redirect || 'iniciar_sesion.html';
            } else {
                if (body.field === 'code') {
                    codeErr.textContent = body.message;
                } else if (body.field === 'password') {
                    p1Err.textContent = body.message;
                } else {
                    infoMsg.textContent = body.message || 'Error al restablecer';
                }
            }
        } catch {
            infoMsg.textContent = 'Error de conexión. Intenta más tarde.';
        }
    });
});
