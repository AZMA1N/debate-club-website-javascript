// Minimal interactive stub to avoid 404 and runtime issues.
(function () {
  function initInteractive() {
    // Example: close modal if present
    const closeBtn = document.getElementById('close-modal-btn');
    const modal = document.getElementById('success-modal');
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractive);
  } else {
    initInteractive();
  }
})();
