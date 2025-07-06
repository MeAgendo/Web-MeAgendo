document.addEventListener('DOMContentLoaded', function() {
    const form     = document.querySelector('form');
    const username = form.querySelector('input[name="username"]');
    const email    = form.querySelector('input[name="email"]');
    const pass1    = form.querySelector('input[name="password1"]');
    const pass2    = form.querySelector('input[name="password2"]');

    // localiza los <small> estáticos en el DOM
    const userErr  = username.parentNode.querySelector('.error-tooltip');
    const emailErr = email.parentNode.querySelector('.error-tooltip');
    const p1Err    = pass1.parentNode.querySelector('.error-tooltip');
    const p2Err    = pass2.parentNode.querySelector('.error-tooltip');

    // Helper para mostrar/ocultar mensaje de error
    function showErr(elem, msg) {
        elem.textContent = msg;
        if (msg) {
            elem.classList.remove('oculto');
        } else {
            elem.classList.add('oculto');
        }
    }

    const submitBtn = form.querySelector('button[type="submit"]');

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

    // Validaciones básicas
    function isStrongPassword(pwd) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return strongRegex.test(pwd);
    }

    function validatePasswords() {
        let ok = true;
        showErr(p1Err, '');
        showErr(p2Err, '');

        if (!isStrongPassword(pass1.value)) {
            showErr(p1Err,
                'Debe tener al menos 8 caracteres, mayúscula, minúscula, número y especial'
            );
            ok = false;
        }
        if (pass1.value !== pass2.value) {
            showErr(p2Err, 'Las contraseñas no coinciden');
            ok = false;
        }
        return ok;
    }

    // Validación de username en servidor
    let userTimeout;
    async function validateUsername() {
        clearTimeout(userTimeout);
        const val = username.value.trim();

        if (!val) {
            showErr(userErr, 'El nombre de usuario es obligatorio');
            return false;
        }
        showErr(userErr, 'Comprobando…');

        await new Promise(r => userTimeout = setTimeout(r, 300));
        try {
            const res = await fetch(
                `/accounts/check-username/?username=${encodeURIComponent(val)}`
            );
            const { exists } = await res.json();
            showErr(
                userErr,
                exists ? 'Este nombre de usuario ya está en uso' : ''
            );
            return !exists;
        } catch {
            showErr(userErr, 'Error al validar usuario');
            return false;
        }
    }

    // Validación de email en servidor
    let emailTimeout;
    async function validateEmail() {
        const val = email.value.trim();

        if (!val) {
            showErr(emailErr, 'El correo es obligatorio');
            return false;
        }
        if (!email.checkValidity()) {
            showErr(emailErr, 'Debes ingresar un email válido');
            return false;
        }
        showErr(emailErr, 'Comprobando…');

        await new Promise(r => emailTimeout = setTimeout(r, 300));
        try {
            const res = await fetch(
                `/accounts/check-email/?email=${encodeURIComponent(val)}`
            );
            const { exists } = await res.json();
            showErr(
                emailErr,
                exists ? 'Este correo ya está registrado' : ''
            );
            return !exists;
        } catch {
            showErr(emailErr, 'Error al validar correo');
            return false;
        }
    }

    // Eventos de validación
    username.addEventListener('blur', validateUsername);
    email.addEventListener('blur', validateEmail);
    pass1.addEventListener('input', validatePasswords);
    pass2.addEventListener('input', validatePasswords);

    // Envío con AJAX
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        showErr(userErr, '');
        showErr(emailErr, '');
        showErr(p1Err, '');
        showErr(p2Err, '');

        const vUser  = await validateUsername();
        const vEmail = await validateEmail();
        const vPass  = validatePasswords();
        if (!vUser || !vEmail || !vPass) return;

        try {
            const resp = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new URLSearchParams(new FormData(form)),
                credentials: 'include'
            });
            const result = await resp.json();

            if (resp.ok && result.success) {
                window.location.href = result.redirect || '/accounts/login/';
            } else if (result.errors) {
                // Backend errors
                if (result.errors.username) {
                    showErr(userErr, result.errors.username[0]);
                }
                if (result.errors.email) {
                    showErr(emailErr, result.errors.email[0]);
                }
                if (result.errors.password1) {
                    showErr(p1Err, result.errors.password1[0]);
                }
                if (result.errors.password2) {
                    showErr(p2Err, result.errors.password2[0]);
                }
            } else {
                // Otros errores generales
                const infoMsg = form.querySelector('.info-msg');
                infoMsg.textContent = result.error || 'Error al registrarse';
            }
        } catch (err) {
            const infoMsg = form.querySelector('.info-msg');
            infoMsg.textContent = 'Error de conexión. Intenta más tarde.';
            console.error(err);
        }
    });
});
