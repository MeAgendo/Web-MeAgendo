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

        try {
            const resp = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new URLSearchParams(new FormData(form)),
                credentials: 'include'
            });
            if (!resp.ok) throw new Error('server');
            const json = await resp.json();

            if (json.success) {
                // Mostrar solo el código recibido, sin redirección
                infoMsg.textContent =
                    `✔ Código de recuperación: ${json.code}`;
                // Opcional: guardar el código para reset later
                sessionStorage.setItem('recoveryCode', json.code);
            } else {
                errTip.textContent =
                    json.error || 'No se pudo generar el código';
            }
        } catch (err) {
            errTip.textContent = 'Problema de conexión. Intenta más tarde.';
            console.error(err);
        }
    });
});
