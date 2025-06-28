// static/js/signup.js
document.addEventListener('DOMContentLoaded', function() {
    const form     = document.querySelector('form');
    const username = form.querySelector('input[name="username"]');
    const email    = form.querySelector('input[name="email"]');
    const pass1    = form.querySelector('input[name="password1"]');
    const pass2    = form.querySelector('input[name="password2"]');

    // Toggle de visibilidad de contraseña
    form.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = form.querySelector(`#${btn.dataset.toggle}`);
            if (input.type === 'password') {
                input.type = 'text';
                btn.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                btn.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    function createErrorElem() {
        const err = document.createElement('small');
        err.classList.add('error-tooltip');
        return err;
    }

    // Tooltips para email, pass1 y pass2
    const emailErr = createErrorElem();
    email.parentNode.appendChild(emailErr);
    const p1Err = createErrorElem();
    pass1.parentNode.appendChild(p1Err);
    const p2Err = createErrorElem();
    pass2.parentNode.appendChild(p2Err);

    // Mensaje general
    const infoMsg = document.createElement('p');
    infoMsg.classList.add('info-msg');
    form.appendChild(infoMsg);

    // Validaciones
    function isStrongPassword(pwd) {
        // mínimo 8 caracteres, mayúscula, minúscula, número y especial
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return strongRegex.test(pwd);
    }

    function validateEmail() {
        const val = email.value.trim();
        if (!val) {
            emailErr.textContent = 'El correo es obligatorio';
            return false;
        }
        if (!email.checkValidity()) {
            emailErr.textContent = 'Debes ingresar un email válido';
            return false;
        }
        emailErr.textContent = '';
        return true;
    }

    function validatePasswords() {
        let ok = true;
        p1Err.textContent = '';
        p2Err.textContent = '';

        if (!isStrongPassword(pass1.value)) {
            p1Err.textContent =
                'Debe tener al menos 8 caracteres, mayúscula, minúscula, número y especial';
            ok = false;
        }
        if (pass1.value !== pass2.value) {
            p2Err.textContent = 'Las contraseñas no coinciden';
            ok = false;
        }
        return ok;
    }

    // Validaciones en tiempo real
    form.addEventListener('input', function(e) {
        if (e.target === email) {
            validateEmail();
        } else if (e.target === pass1 || e.target === pass2) {
            validatePasswords();
        }
    });

    // Envío con AJAX y captura de errores
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        infoMsg.textContent = '';

        const validEmail = validateEmail();
        const validPass  = validatePasswords();
        if (!validEmail || !validPass) return;

        try {
            const resp = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new URLSearchParams(new FormData(form)),
                credentials: 'include'
            });
            const result = await resp.json();

            if (resp.ok && result.success) {
                window.location.href = result.redirect || 'iniciar_sesion.html';
            } else {
                infoMsg.textContent = result.error || 'Error al registrarse';
            }
        } catch (err) {
            infoMsg.textContent = 'Error de conexión. Intenta más tarde.';
            console.error(err);
        }
    });
});
