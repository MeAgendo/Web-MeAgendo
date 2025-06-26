// static/js/signup.js
document.addEventListener('DOMContentLoaded', function() {
    const form     = document.querySelector('form');
    const username = form.querySelector('input[name="username"]');
    const email    = form.querySelector('input[name="email"]');
    const pass1    = form.querySelector('input[name="password1"]');
    const pass2    = form.querySelector('input[name="password2"]');

    // Toggle de visibilidad de contraseña
    const toggles = form.querySelectorAll('.toggle-password');
    toggles.forEach(btn => {
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

    // Sólo necesitamos tooltips en pass1 y pass2
    const p1Err = createErrorElem();
    pass1.parentNode.appendChild(p1Err);
    const p2Err = createErrorElem();
    pass2.parentNode.appendChild(p2Err);

    function validateUsername() {
        if (username.value.trim().length < 3) {
            userErr.textContent = 'El usuario debe tener al menos 3 caracteres';
            return false;
        }
        userErr.textContent = '';
        return true;
    }

    function validateEmail() {
        if (!email.checkValidity()) {
            emailErr.textContent = 'Debes ingresar un email válido';
            return false;
        }
        emailErr.textContent = '';
        return true;
    }

    function isStrongPassword(pwd) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
        return strongRegex.test(pwd);
    }

    function validatePasswords() {
        let ok = true;

        if (!isStrongPassword(pass1.value)) {
            p1Err.textContent =
                'Debe tener 12+ caracteres, ' +
                'minúscula, mayúscula, número y especial';
            ok = false;
        } else {
            p1Err.textContent = '';
        }

        if (pass1.value !== pass2.value) {
            p2Err.textContent = 'Las contraseñas no coinciden';
            ok = false;
        } else {
            p2Err.textContent = '';
        }

        return ok;
    }

    form.addEventListener('input', function(e) {
        if (e.target === username) {
            validateUsername();
        } else if (e.target === email) {
            validateEmail();
        } else if (e.target === pass1 || e.target === pass2) {
            validatePasswords();
        }
    });

    form.addEventListener('submit', function(e) {
        const ok3 = validatePasswords();
        if (!ok3) e.preventDefault();
    });
});
