// Minimal register.js stub
(function () {
  function initRegister() {
    // If register form exists, add basic validation placeholder
    const form = document.querySelector('form#register-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      // Placeholder: allow submit; real validation can be added later
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRegister);
  } else {
    initRegister();
  }
})();
