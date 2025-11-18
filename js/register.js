// Register form handler: autosave, validation, offline queue and submission
(function () {
  const FORM_KEY = 'nsudc:form:draft';
  const QUEUE_KEY = 'nsudc:form:queue';

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function getFormData(form) {
    return new FormData(form);
  }

  function saveDraft(dataObj) {
    try {
      localStorage.setItem(FORM_KEY, JSON.stringify(dataObj));
    } catch (e) {
      console.warn('Could not save draft', e);
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(FORM_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function enqueueSubmission(payload) {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push(payload);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Queueing failed', e);
    }
  }

  async function flushQueue() {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      if (!queue.length) return;

      const remaining = [];
      for (const item of queue) {
        try {
          const res = await fetch(item.url, { method: 'POST', body: item.formData });
          if (!res.ok) throw new Error('Server error');
        } catch (e) {
          remaining.push(item);
        }
      }

      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    } catch (e) {
      console.warn('Flush queue failed', e);
    }
  }

  function populateFormFromDraft(form) {
    const draft = loadDraft();
    if (!draft) return;
    for (const [key, value] of Object.entries(draft)) {
      const el = form.elements[key];
      if (!el) continue;
      try {
        el.value = value;
      } catch (e) {}
    }
  }

  function formToPlainObject(form) {
    const obj = {};
    new FormData(form).forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }

  function showSuccess() {
    const modal = document.getElementById('success-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    const box = document.getElementById('success-box');
    setTimeout(() => box.classList.remove('opacity-0', 'translate-y-3'), 20);
  }

  function showToast(msg) {
    // lightweight toast — fallback to alert if not implemented
    if (window.toastr && typeof toastr.success === 'function') {
      toastr.success(msg);
      return;
    }
    console.log(msg);
  }

  function initRegister() {
    const form = qs('#recruitmentForm');
    if (!form) return;

    // Populate from draft
    populateFormFromDraft(form);

    // Autosave on input
    form.addEventListener('input', () => {
      const obj = formToPlainObject(form);
      saveDraft(obj);
    });

    // Try to flush any queued submissions when online
    window.addEventListener('online', () => {
      flushQueue().then(() => showToast('Pending submissions flushed.'));
    });

    // Form submit handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic HTML5 validity check
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = getFormData(form);
      const payload = { url: form.action || '/', formData };

      try {
        // Attempt network submission
        const res = await fetch(payload.url, { method: 'POST', body: formData });
        if (res && res.ok) {
          // Success — clear draft and show modal
          localStorage.removeItem(FORM_KEY);
          showSuccess();
          showToast('Registration submitted');
          return;
        }

        throw new Error('Network response not OK');
      } catch (err) {
        // Network failed — queue and notify
        enqueueSubmission({ url: payload.url, formData: serializeFormData(formData) });
        localStorage.removeItem(FORM_KEY);
        showToast('You are offline. Your submission is queued and will be sent when online.');
        // attempt background sync registration
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then(reg => {
            reg.sync.register('background-sync').catch(() => {});
          });
        }
      }
    });

    // Clear draft button if present
    const clearBtn = document.getElementById('clear-draft');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        localStorage.removeItem(FORM_KEY);
        form.reset();
        showToast('Draft cleared');
      });
    }

    // Attempt initial flush
    if (navigator.onLine) flushQueue();
  }

  // Helper: convert FormData to a plain serializable object (values preserved)
  function serializeFormData(fd) {
    const obj = {};
    for (const [k, v] of fd.entries()) {
      // If multiple fields share the same name, convert to array
      if (obj.hasOwnProperty(k)) {
        if (!Array.isArray(obj[k])) obj[k] = [obj[k]];
        obj[k].push(v);
      } else {
        obj[k] = v;
      }
    }
    return obj;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRegister);
  } else {
    initRegister();
  }
})();
