// Minimal app.js stub for index page behavior and safe DOM interactions.
(function () {
  function initApp() {
    // Example: populate a simple updates list if empty
    const updates = document.getElementById('updates-list');
    if (updates && updates.children.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Welcome to NSU Debate Club — updates will appear here.';
      updates.appendChild(li);
    }

    // Handle success modal animation toggle (works with interactive.js as well)
    const successModal = document.getElementById('success-modal');
    if (successModal && successModal.classList.contains('hidden')) {
      // nothing — keep it hidden by default
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
