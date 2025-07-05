// openDatePicker.js
document.addEventListener('DOMContentLoaded', () => {
  // Selecciona ambas: date y time
  document.querySelectorAll('input[type="date"], input[type="time"]').forEach(input => {
    input.addEventListener('click', () => {
      // Chrome/Edge/Safari: dispara el picker nativo
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        // Fallback (p.ej. Firefox): enfoca el input
        input.focus();
      }
    });
  });
});
