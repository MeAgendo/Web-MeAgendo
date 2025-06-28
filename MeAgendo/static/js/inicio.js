// static/js/inicio.js
document.addEventListener('DOMContentLoaded', () => {
    const btnLogin  = document.querySelector('.btn-login');
    const btnSignup = document.querySelector('.btn-signup');

    btnLogin.addEventListener('click', () => {
        window.location.href = 'Iniciar_Sesion.html';
    });

    btnSignup.addEventListener('click', () => {
        window.location.href = 'Crear_Cuenta.html';
    });
});
