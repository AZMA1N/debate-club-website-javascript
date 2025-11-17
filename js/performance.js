// Minimal performance utilities stub.
// Keeps references safe if the production implementation is not present.
(function () {
  function initPerformance() {
    // Placeholder: measure small perf metrics if needed.
    try {
      if (performance && performance.mark) {
        performance.mark('site:loaded');
      }
    } catch (e) {
      // no-op
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformance);
  } else {
    initPerformance();
  }
})();
