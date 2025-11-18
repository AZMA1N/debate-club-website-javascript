// Minimal app.js stub for index page behavior and safe DOM interactions.
(function () {
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('SW registered', reg);
        }).catch(err => console.warn('SW registration failed', err));
    }
  }

  function showPendingModalIfNeeded() {
    // No-op here; modal display handled by form handler on success
  }

  function initApp() {
    // Basic updates placeholder
    const updates = document.getElementById('updates-list');
    if (updates && updates.children.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Welcome to NSU Debate Club — updates will appear here.';
      updates.appendChild(li);
    }

    registerServiceWorker();
    showPendingModalIfNeeded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
