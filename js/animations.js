// Minimal animations stub to avoid 404 and runtime errors.
// Real animations can be added later.
(function () {
  function initAnimations() {
    // Placeholder: add animation classes or intersection observers here
    // No-op to keep console clean.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }
})();
