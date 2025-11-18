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

  let siteConfig = {
    announcementsEndpoint: 'data/announcements.json',
    socialEndpoint: 'data/social.json'
  };
  const MOTION_HISTORY_KEY = 'nsudc:motion-history';
  let motionHistory = [];
  let announcementRotationTimer = null;
  let announcementPaused = false;
  let motions = [];
  let currentMotionIndex = -1;
  let timerInterval = null;
  let timerState = {
    label: 'Main Speech',
    totalSeconds: 420,
    remainingSeconds: 420,
    running: false,
    protectedChimed: false,
    finalChimed: false
  };
  // allow muting of chimes
  timerState.muted = false;

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

  async function loadSiteConfig() {
    try {
      const remoteConfig = await fetchJSON('config/site-config.json');
      siteConfig = { ...siteConfig, ...remoteConfig };
    } catch (err) {
      console.warn('Site config not found, using defaults', err);
    }
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
      const data = await fetchJSON(siteConfig.socialEndpoint);
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
      if (!item || !textNode) return;
      textNode.classList.remove('show');
      setTimeout(() => {
        textNode.textContent = item.message || '';
        textNode.classList.add('show');
      }, 200);

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
      const announcements = await fetchJSON(siteConfig.announcementsEndpoint);
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
        slot.addEventListener('mouseenter', () => { announcementPaused = true; });
        slot.addEventListener('mouseleave', () => { announcementPaused = false; });

        announcementRotationTimer = setInterval(() => {
          if (announcementPaused) return;
          index = (index + 1) % announcements.length;
          renderAnnouncement(announcements[index]);
        }, ANNOUNCEMENT_INTERVAL);
      }
    } catch (err) {
      console.warn('Announcements unavailable', err);
    }
  }

  /* ---------------- Motion history persistence ---------------- */
  function loadMotionHistory() {
    try {
      const raw = localStorage.getItem(MOTION_HISTORY_KEY);
      motionHistory = raw ? JSON.parse(raw) : [];
    } catch (err) {
      motionHistory = [];
    }
  }

  function saveMotionHistory() {
    try {
      localStorage.setItem(MOTION_HISTORY_KEY, JSON.stringify(motionHistory.slice(0, 100)));
    } catch (err) {
      console.warn('Failed to save motion history', err);
    }
  }

  function addMotionToHistory(entry) {
    const item = {
      id: Date.now(),
      motion: entry.motion || (motions[currentMotionIndex] && motions[currentMotionIndex].motion) || '',
      topic: entry.topic || (motions[currentMotionIndex] && motions[currentMotionIndex].topic) || '',
      format: entry.format || (motions[currentMotionIndex] && motions[currentMotionIndex].format) || '',
      completed: !!entry.completed,
      ts: new Date().toISOString()
    };
    motionHistory.unshift(item);
    saveMotionHistory();
    renderMotionHistory();
  }

  function renderMotionHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    list.innerHTML = '';
    if (!motionHistory.length) {
      list.innerHTML = '<div class="text-sm text-[var(--ink-light)]">No practice history yet — generate a motion to start logging.</div>';
      return;
    }
    motionHistory.slice(0, 20).forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      const left = document.createElement('div');
      left.textContent = `${item.motion}`;
      const right = document.createElement('div');
      right.textContent = `${item.completed ? '✓' : ''} ${new Date(item.ts).toLocaleString()}`;
      div.appendChild(left);
      div.appendChild(right);
      list.appendChild(div);
    });
  }


  function renderMotion(item) {
    const topic = document.getElementById('motion-topic');
    const text = document.getElementById('motion-text');
    const format = document.getElementById('motion-format');
    if (!item || !topic || !text || !format) return;
    topic.textContent = item.topic || 'Open Topic';
    text.textContent = item.motion || 'Generate motions to start practice.';
    format.textContent = (item.format || 'BP').split(' ')[0];
    format.dataset.fullFormat = item.format || 'British Parliamentary';
  }

  function getRandomMotionIndex() {
    if (!motions.length) return -1;
    if (motions.length === 1) return 0;
    let index;
    do {
      index = Math.floor(Math.random() * motions.length);
    } while (index === currentMotionIndex);
    return index;
  }

  function handleNewMotion() {
    if (!motions.length) return;
    const nextIndex = getRandomMotionIndex();
    if (nextIndex < 0) return;
    currentMotionIndex = nextIndex;
    renderMotion(motions[currentMotionIndex]);
    showToast('New motion queued — prep time starts now!');
    // Log generated motion to history as not completed
    addMotionToHistory({ motion: motions[currentMotionIndex].motion, topic: motions[currentMotionIndex].topic, format: motions[currentMotionIndex].format, completed: false });
  }

  async function hydrateMotionGenerator() {
    const generatorCard = document.getElementById('motion-generator');
    if (!generatorCard) return;

    try {
      const response = await fetchJSON(siteConfig.motionsEndpoint || 'data/motions.json');
      motions = Array.isArray(response) ? response.filter(Boolean) : [];
      if (!motions.length) return;
      currentMotionIndex = 0;
      renderMotion(motions[currentMotionIndex]);
    } catch (err) {
      console.warn('Unable to load motions', err);
    }

    const refreshBtn = document.getElementById('motion-refresh');
    const copyBtn = document.getElementById('motion-copy');

    refreshBtn?.addEventListener('click', () => {
      handleNewMotion();
    });

    copyBtn?.addEventListener('click', async () => {
      if (!motions.length || currentMotionIndex < 0) return;
      const motion = motions[currentMotionIndex];
      const text = `${motion.motion} (${motion.format || 'BP'} • ${motion.topic || 'General'})`;
      try {
        await navigator.clipboard.writeText(text);
        showToast('Motion copied to clipboard. See you in prep!');
        // mark copy as an interaction in history
        addMotionToHistory({ motion: motion.motion, topic: motion.topic, format: motion.format, completed: false });
      } catch (err) {
        console.warn('Clipboard unavailable', err);
        showToast('Clipboard unavailable — please copy manually.');
      }
    });

    // clear history handler
    const clearBtn = document.getElementById('clear-history');
    clearBtn?.addEventListener('click', () => {
      motionHistory = [];
      saveMotionHistory();
      renderMotionHistory();
      showToast('Practice history cleared.');
    });
  }

  async function hydrateSocialPulse() {
    const postsContainer = document.getElementById('pulse-list');
    const alumniContainer = document.getElementById('pulse-alumni');
    const viewAll = document.getElementById('pulse-view-all');
    if (!postsContainer && !alumniContainer) return;

    try {
      const data = await fetchJSON(siteConfig.socialPulseEndpoint || 'data/social-pulse.json');
      const posts = Array.isArray(data.latestPosts) ? data.latestPosts : [];
      const alumni = Array.isArray(data.alumniSpotlights) ? data.alumniSpotlights : [];

      // render posts
      postsContainer && (postsContainer.innerHTML = '');
      posts.slice(0, 6).forEach(p => {
        const item = document.createElement('div');
        item.className = 'pulse-item';
        const left = document.createElement('div');
        left.style.flex = '1';
        left.innerHTML = `<div style="font-weight:600">${p.title}</div><div class="pulse-meta">${p.platform.toUpperCase()} • ${new Date(p.date).toLocaleDateString()}</div>`;
        const right = document.createElement('div');
        right.innerHTML = `<div class="pulse-meta">${Object.entries(p.engagement || {}).map(([k,v])=> `${k}: ${v}`).join(' • ')}</div><div style="margin-top:6px"><a href="${p.link}" target="_blank" rel="noopener" class="nav-link">View</a></div>`;
        item.appendChild(left);
        item.appendChild(right);
        postsContainer && postsContainer.appendChild(item);
      });

      // render alumni
      alumniContainer && (alumniContainer.innerHTML = '');
      alumni.slice(0,4).forEach(a => {
        const row = document.createElement('div');
        row.className = 'alumni-item';
        const img = document.createElement('img');
        img.src = a.photo || 'nsudc-logo.png';
        img.alt = a.name;
        const meta = document.createElement('div');
        meta.innerHTML = `<div style="font-weight:700">${a.name}</div><div class="pulse-meta">${a.role}</div><div class="pulse-meta" style="margin-top:4px">${a.note}</div>`;
        const link = document.createElement('div');
        link.innerHTML = `<a href="${a.link}" target="_blank" rel="noopener" class="nav-link">Connect</a>`;
        row.appendChild(img);
        row.appendChild(meta);
        row.appendChild(link);
        alumniContainer && alumniContainer.appendChild(row);
      });

      // wire view all
      if (viewAll) {
        viewAll.href = posts[0]?.link || '#';
        viewAll.addEventListener('click', (e) => {
          if (posts[0]?.link) return; // let anchor follow
          e.preventDefault();
        });
      }
    } catch (err) {
      console.warn('Social pulse unavailable', err);
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  function updateTimerDisplay() {
    const timeEl = document.getElementById('timer-time');
    const labelEl = document.getElementById('timer-label');
    const progressBar = document.getElementById('timer-progress-bar');
    if (!timeEl || !labelEl || !progressBar) return;
    timeEl.textContent = formatTime(timerState.remainingSeconds);
    labelEl.textContent = timerState.label;
    const percent = Math.max(0, Math.min(1, 1 - (timerState.remainingSeconds / timerState.totalSeconds)));
    progressBar.style.setProperty('--progress', `${percent * 100}%`);
    progressBar.style.transform = `scaleX(${percent})`;
  }

  function playChime(type) {
    if (timerState.muted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = type === 'final' ? 660 : 440;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (err) {
      console.warn('Audio context unavailable', err);
    }
  }

  function stopTimerInterval() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resetTimerState(seconds, label) {
    stopTimerInterval();
    timerState.totalSeconds = seconds;
    timerState.remainingSeconds = seconds;
    timerState.label = label;
    timerState.running = false;
    timerState.protectedChimed = false;
    timerState.finalChimed = false;
    updateTimerDisplay();
    const toggleBtn = document.getElementById('timer-toggle');
    if (toggleBtn) toggleBtn.textContent = 'Start';
  }

  function initDebateTimer() {
    const timerCard = document.getElementById('debate-timer');
    if (!timerCard) return;

    const presets = document.querySelectorAll('.timer-preset');
    presets.forEach(btn => {
      btn.addEventListener('click', () => {
        const minutes = Number(btn.dataset.minutes || 7);
        const name = btn.dataset.name || 'Speech';
        presets.forEach(b => b.classList.toggle('active', b === btn));
        resetTimerState(minutes * 60, `${name} Speech`);
        showToast(`${name} timer armed for ${minutes} minutes.`);
      });
    });

    const toggleBtn = document.getElementById('timer-toggle');
    const resetBtn = document.getElementById('timer-reset');
    const muteBtn = document.getElementById('timer-mute');

    // init mute UI state
    if (muteBtn) {
      muteBtn.classList.toggle('active', !!timerState.muted);
      muteBtn.textContent = timerState.muted ? '🔕' : '🔔';
      muteBtn.addEventListener('click', () => {
        timerState.muted = !timerState.muted;
        muteBtn.classList.toggle('active', !!timerState.muted);
        muteBtn.textContent = timerState.muted ? '🔕' : '🔔';
        showToast(timerState.muted ? 'Timer muted' : 'Timer sound enabled');
      });
    }

    toggleBtn?.addEventListener('click', () => {
      if (timerState.running) {
        stopTimerInterval();
        timerState.running = false;
        toggleBtn.textContent = 'Resume';
        return;
      }

      if (timerState.remainingSeconds <= 0) {
        resetTimerState(timerState.totalSeconds, timerState.label);
      }

      timerState.running = true;
      toggleBtn.textContent = 'Pause';
      const startTime = Date.now();
      let lastTick = startTime;

      timerInterval = setInterval(() => {
        const now = Date.now();
        const delta = (now - lastTick) / 1000;
        lastTick = now;
        timerState.remainingSeconds = Math.max(0, timerState.remainingSeconds - delta);

        const elapsed = timerState.totalSeconds - timerState.remainingSeconds;
        if (!timerState.protectedChimed && elapsed >= 60) {
          timerState.protectedChimed = true;
          playChime('protected');
          showToast('Protected time over — POIs open.');
        }
        if (!timerState.finalChimed && timerState.remainingSeconds <= 60) {
          timerState.finalChimed = true;
          playChime('final');
          showToast('Final minute — wrap it up.');
        }

        if (timerState.remainingSeconds <= 0) {
          stopTimerInterval();
          timerState.running = false;
          toggleBtn.textContent = 'Restart';
          playChime('final');
          showToast('Time! Gavel down.');
          // Log completed motion if present
          if (motions[currentMotionIndex]) {
            addMotionToHistory({ motion: motions[currentMotionIndex].motion, topic: motions[currentMotionIndex].topic, format: motions[currentMotionIndex].format, completed: true });
          }
        }
        updateTimerDisplay();
      }, 250);
    });

    resetBtn?.addEventListener('click', () => {
      resetTimerState(timerState.totalSeconds, timerState.label);
      showToast('Timer reset. Take a breath.');
    });

    resetTimerState(timerState.totalSeconds, timerState.label);
  }

  async function initApp() {
    // Basic updates placeholder
    const updates = document.getElementById('updates-list');
    if (updates && updates.children.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Welcome to NSU Debate Club — updates will appear here.';
      updates.appendChild(li);
    }

    registerServiceWorker();
    await loadSiteConfig();
    hydrateSocialStats();
    hydrateAnnouncement();
    loadMotionHistory();
    renderMotionHistory();
    hydrateMotionGenerator();
    initDebateTimer();
    hydrateSocialPulse();
    showPendingModalIfNeeded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
