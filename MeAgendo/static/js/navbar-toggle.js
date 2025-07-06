// settings-toggle.js

document.addEventListener('DOMContentLoaded', () => {
  const calContainer = document.querySelector('.calendar-container');
  const cfgContainer = document.querySelector('.config-container');
  const settingsList = document.getElementById('settingsList');

  // 1) Mostrar/ocultar calendario vs configuración
  function toggleView(showCalendar) {
    calContainer.classList.toggle('oculto', !showCalendar);
    cfgContainer.classList.toggle('oculto', showCalendar);
    cfgContainer.setAttribute('aria-hidden', showCalendar);
  }

  // 2) Poblado dinámico de la lista de configuración
  function loadSettings() {
    const opciones = [
      { name: 'Perfil',         url: window.urlProfile },
      { name: 'Privacidad',     url: window.urlPrivacy },
      { name: 'Notificaciones', url: window.urlNotifications }
    ];

    settingsList.innerHTML = '';
    const fragment = document.createDocumentFragment();

    opciones.forEach(opt => {
      const href      = opt.url || '#';
      const disabled  = !opt.url;             // true si no hay URL real
      const li        = document.createElement('li');
      li.innerHTML    = `<a href="${href}"${disabled ? ' class="disabled"' : ''}>${opt.name}</a>`;
      fragment.appendChild(li);
    });

    settingsList.appendChild(fragment);
  }

  // 3) Listener para capturar clicks en enlaces “disabled”
  settingsList.addEventListener('click', e => {
    const a = e.target.closest('a.disabled');
    if (!a) return;
    e.preventDefault();
    // Puedes cambiar esto por un toast, modal, console.log, etc.
    alert('Funcionalidad en desarrollo…');
  });

  // 4) Listeners para alternar vistas
  document.getElementById('navCalendar')
    .addEventListener('click', e => {
      e.preventDefault();
      toggleView(true);
    });

  document.getElementById('navSettings')
    .addEventListener('click', e => {
      e.preventDefault();
      toggleView(false);
      loadSettings();
    });
});

