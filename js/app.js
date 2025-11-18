// Minimal app.js stub for index page behavior and safe DOM interactions.
(function () {
  const ANNOUNCEMENT_STORAGE_KEY = 'nsudc:last-announcement-id';
  const ANNOUNCEMENT_INTERVAL = 8000;
  const SOCIAL_ID_MAP = {
    facebook: 'social-facebook',
    instagram: 'social-instagram',
    twitter: 'social-twitter',
    linkedin: 'social-linkedin'
  };

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

  function ensureToastStack() {
    let stack = document.getElementById('toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'toast-stack';
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  function showToast(message) {
    if (!message) return;
    const stack = ensureToastStack();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    stack.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return res.json();
  }

  function formatFollowerCount(value, unit) {
    if (typeof value !== 'number') return '0';
    if (unit) return `${value}${unit}`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return `${value}`;
  }

  async function hydrateSocialStats() {
    const hasAny = Object.values(SOCIAL_ID_MAP).some(id => document.getElementById(id));
    if (!hasAny) return;

    try {
      const data = await fetchJSON('data/social.json');
      Object.entries(SOCIAL_ID_MAP).forEach(([platform, elementId]) => {
        const el = document.getElementById(elementId);
        if (!el || !data[platform]) return;
        const shortLabel = (data[platform].label || platform).split(' ')[0].slice(0, 2).toUpperCase();
        el.textContent = `${shortLabel} ${formatFollowerCount(data[platform].followers, data[platform].unit)}`;
      });
    } catch (err) {
      console.warn('Social stats unavailable', err);
    }
  }

  async function hydrateAnnouncement() {
    const slot = document.getElementById('topbar-announcement');
    if (!slot) return;

    const textNode = slot.querySelector('.announcement-text');
    let linkNode = slot.querySelector('.announcement-link');

    function ensureLinkNode() {
      if (!linkNode) {
        linkNode = document.createElement('a');
        linkNode.className = 'announcement-link';
        slot.appendChild(linkNode);
      } else if (linkNode.tagName !== 'A') {
        const anchor = document.createElement('a');
        anchor.className = linkNode.className || 'announcement-link';
        slot.replaceChild(anchor, linkNode);
        linkNode = anchor;
      }
      return linkNode;
    }

    function renderAnnouncement(item) {
      if (!item) return;
      if (textNode && item.message) textNode.textContent = item.message;
      if (item.href) {
        const anchor = ensureLinkNode();
        anchor.href = item.href;
        anchor.textContent = item.linkText || 'Learn more';
        anchor.classList.remove('hidden');
      } else if (linkNode) {
        linkNode.classList.add('hidden');
      }
    }

    try {
      const announcements = await fetchJSON('data/announcements.json');
      if (!Array.isArray(announcements) || !announcements.length) return;

      let index = 0;
      renderAnnouncement(announcements[index]);

      const latestId = announcements[index]?.id;
      const storedId = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      if (latestId && String(latestId) !== storedId) {
        showToast(`New announcement: ${announcements[index].message}`);
        localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, latestId);
      }

      if (announcements.length > 1) {
        setInterval(() => {
          index = (index + 1) % announcements.length;
          renderAnnouncement(announcements[index]);
        }, ANNOUNCEMENT_INTERVAL);
      }
    } catch (err) {
      console.warn('Announcements unavailable', err);
    }
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
    hydrateSocialStats();
    hydrateAnnouncement();
    showPendingModalIfNeeded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
