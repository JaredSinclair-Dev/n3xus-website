/* ══════════════════════════════════════════════════════════════
   N3XUS MEDIA — script.js  v6
   Nav · Reveal · Stagger · Typewriter · Tilt · Magnetic Btns
   Cursor Glow · Scroll Progress · Marquee · Dashboard Anim
   Canvas (mouse-reactive) · Chatbot · FAQ · Forms · Counters
══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     SCROLL PROGRESS BAR
  ───────────────────────────────────── */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);
  window.addEventListener('scroll', () => {
    const pct = (scrollY / (document.documentElement.scrollHeight - innerHeight)) * 100;
    progressBar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });

  /* ─────────────────────────────────────
     CURSOR GLOW  (desktop only)
  ───────────────────────────────────── */
  if (window.matchMedia('(pointer:fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let cx = -500, cy = -500;
    document.addEventListener('mousemove', e => {
      cx = e.clientX; cy = e.clientY;
      glow.style.left = cx + 'px';
      glow.style.top  = cy + 'px';
    }, { passive: true });
  }

  /* ─────────────────────────────────────
     NAV — scroll + toggle + dropdowns
  ───────────────────────────────────── */
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
  }

  /* Mobile hamburger (new pages: navToggle) */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    let navOpen = false;
    const openNav = () => {
      navOpen = true;
      navToggle.setAttribute('aria-expanded', 'true');
      navLinks.classList.add('nav-open');
      navToggle.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const closeNav = () => {
      navOpen = false;
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('nav-open');
      navToggle.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    navToggle.addEventListener('click', () => navOpen ? closeNav() : openNav());
    navLinks.querySelectorAll('a:not(.has-dropdown > .nav-link)').forEach(a =>
      a.addEventListener('click', () => { if (window.innerWidth <= 960) closeNav(); })
    );
    document.addEventListener('click', e => {
      if (navOpen && !nav.contains(e.target)) closeNav();
    });
  }

  /* Desktop + touch dropdowns (new: has-dropdown / nav-dropdown) */
  document.querySelectorAll('.has-dropdown').forEach(item => {
    const link = item.querySelector('.nav-link');
    const dd   = item.querySelector('.nav-dropdown');
    if (!link || !dd) return;
    item.addEventListener('mouseenter', () => { if (window.innerWidth > 960) dd.classList.add('dd-open'); });
    item.addEventListener('mouseleave', () => dd.classList.remove('dd-open'));
    link.addEventListener('click', e => {
      if (window.innerWidth <= 960) {
        e.preventDefault();
        dd.classList.toggle('dd-open');
        link.setAttribute('aria-expanded', dd.classList.contains('dd-open'));
      }
    });
  });

  /* Legacy dropdown support */
  document.querySelectorAll('.has-dd > a').forEach(a => {
    a.addEventListener('click', function (e) {
      if (window.innerWidth > 960) {
        const dd = this.parentElement.querySelector('.dd');
        const isOpen = dd && dd.style.display === 'block';
        document.querySelectorAll('.dd').forEach(d => { d.style.display = ''; });
        if (!isOpen) { e.preventDefault(); if (dd) dd.style.display = 'block'; }
      }
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.has-dd')) {
      document.querySelectorAll('.dd').forEach(d => { d.style.display = ''; });
    }
  });

  /* ─────────────────────────────────────
     SCROLL REVEAL  with stagger
  ───────────────────────────────────── */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .rev-l, .rev-r').forEach(el => revObs.observe(el));

  /* Stagger children of grid/list containers */
  document.querySelectorAll(
    '.svc-grid, .core3-cards, .stat-grid, .svc-detail-grid, .diff-grid, .price-cards, .pricing-table-grid, .proc-steps, .faq-list, .hero-stats'
  ).forEach(grid => {
    const children = grid.querySelectorAll('.reveal');
    children.forEach((child, i) => {
      child.style.transitionDelay = (i * 80) + 'ms';
    });
  });

  /* ─────────────────────────────────────
     TYPEWRITER EFFECT
  ───────────────────────────────────── */
  const typer = document.querySelector('.hero-typewriter');
  if (typer) {
    const words = (typer.dataset.words || '').split(',').map(w => w.trim()).filter(Boolean);
    if (words.length > 1) {
      let wi = 0, ci = 0, deleting = false;
      const cursor = document.querySelector('.type-cursor');
      function tick() {
        const word = words[wi];
        if (deleting) {
          ci--;
          typer.textContent = word.slice(0, ci);
          if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 400); return; }
          setTimeout(tick, 55);
        } else {
          ci++;
          typer.textContent = word.slice(0, ci);
          if (ci >= word.length) { deleting = true; setTimeout(tick, 1800); return; }
          setTimeout(tick, 90);
        }
      }
      setTimeout(tick, 1200);
    }
  }

  /* ─────────────────────────────────────
     CARD 3D TILT
  ───────────────────────────────────── */
  function initTilt(selector) {
    document.querySelectorAll(selector).forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  initTilt('.core3-card');
  initTilt('.svc-card');
  initTilt('.stat-card');

  /* ─────────────────────────────────────
     MAGNETIC BUTTONS
  ───────────────────────────────────── */
  document.querySelectorAll('.btn-primary.btn-lg, .btn.btn-primary.nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.25;
      const y = (e.clientY - r.top  - r.height / 2) * 0.25;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* ─────────────────────────────────────
     PARALLAX — hero elements on mouse
  ───────────────────────────────────── */
  let _rafId;
  document.addEventListener('mousemove', e => {
    cancelAnimationFrame(_rafId);
    _rafId = requestAnimationFrame(() => {
      const x = (e.clientX / innerWidth  - 0.5);
      const y = (e.clientY / innerHeight - 0.5);
      document.querySelectorAll('.hv-card').forEach((card, i) => {
        const depth = (i + 1) * 8;
        card.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
      const g1 = document.querySelector('.hero-glow1');
      const g2 = document.querySelector('.hero-glow2');
      if (g1) g1.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
      if (g2) g2.style.transform = `translate(${-x * 20}px, ${-y * 20}px)`;
    });
  }, { passive: true });

  /* ─────────────────────────────────────
     MARQUEE — auto-duplicate for seamless loop
  ───────────────────────────────────── */
  document.querySelectorAll('.marquee-track').forEach(track => {
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.parentElement.appendChild(clone);
    track.parentElement.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
      clone.style.animationPlayState  = 'paused';
    });
    track.parentElement.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
      clone.style.animationPlayState  = 'running';
    });
  });

  /* ─────────────────────────────────────
     ANIMATED DASHBOARD BARS
  ───────────────────────────────────── */
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.intel-bar').forEach((bar, i) => {
          const h = bar.style.height;
          bar.style.height = '0%';
          setTimeout(() => { bar.style.height = h; }, i * 80);
        });
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.intel-chart').forEach(c => barObs.observe(c));

  /* ─────────────────────────────────────
     ANIMATED STAT COUNTERS
  ───────────────────────────────────── */
  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target || el.textContent);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();
    el.textContent = '0' + suffix;
    function tick(now) {
      const p    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = (target % 1 !== 0 ? (target * ease).toFixed(1) : Math.round(target * ease)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.count-up').forEach(el => counterObs.observe(el));

  /* ─────────────────────────────────────
     FAQ ACCORDION (handles both hidden + class)
  ───────────────────────────────────── */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', function () {
      const answer  = this.nextElementSibling;
      const isOpen  = this.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-q').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.classList.remove('open');
        const a = b.nextElementSibling;
        if (a) { a.hidden = true; a.classList.remove('open'); }
      });
      if (!isOpen) {
        this.setAttribute('aria-expanded', 'true');
        this.classList.add('open');
        answer.hidden = false;
        answer.classList.add('open');
      }
    });
  });

  /* ─────────────────────────────────────
     CONTACT FORM — Formspree AJAX
  ───────────────────────────────────── */
  (function () {
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xeenrqej';

    const form    = document.getElementById('contactForm');
    const success = document.getElementById('form-success');
    const errMsg  = form && form.querySelector('.form-error-msg');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn     = form.querySelector('[type="submit"]');
      const origTxt = btn.textContent;

      // Reset any previous error
      if (errMsg) { errMsg.textContent = ''; errMsg.style.display = 'none'; }

      // Validate required fields
      const nameEl    = form.querySelector('#cf-name');
      const emailEl   = form.querySelector('#cf-email');
      const messageEl = form.querySelector('#cf-message');
      if (!nameEl.value.trim() || !emailEl.value.trim() || !messageEl.value.trim()) {
        showError('Please fill in your name, email and message.');
        return;
      }

      btn.textContent = 'Sending…';
      btn.disabled = true;

      const payload = {
        name:    nameEl.value.trim(),
        email:   emailEl.value.trim(),
        phone:   form.querySelector('#cf-phone')?.value.trim()   || '',
        service: form.querySelector('#cf-service')?.value        || '',
        message: messageEl.value.trim(),
        _subject: 'New enquiry from ' + nameEl.value.trim() + ' — N3XUS Media',
      };

      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          // Success
          form.style.display = 'none';
          if (success) { success.hidden = false; success.style.display = 'block'; }
          if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', { event_category: 'Lead', event_label: 'Contact Form', value: 1 });
          }
        } else {
          // Formspree returned an error (e.g. validation, spam)
          const msg = data.errors?.[0]?.message || data.error || 'Something went wrong. Please try again or email us at info@n3xus.media';
          showError(msg);
          btn.textContent = origTxt;
          btn.disabled = false;
        }
      } catch (err) {
        showError('Could not connect. Please email us directly at info@n3xus.media');
        btn.textContent = origTxt;
        btn.disabled = false;
      }

      function showError(msg) {
        if (errMsg) {
          errMsg.textContent = msg;
          errMsg.style.display = 'block';
          errMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  })();

  /* Legacy contact form */
  (function () {
    const form    = document.getElementById('contact-form');
    const success = document.getElementById('form-success-msg');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(r => {
          if (r.ok) {
            form.style.display = 'none';
            if (success) success.style.display = 'block';
          } else {
            if (btn) { btn.textContent = 'Send →'; btn.disabled = false; }
          }
        }).catch(() => { if (btn) { btn.textContent = 'Send →'; btn.disabled = false; } });
    });
  })();

  /* ─────────────────────────────────────
     SERVICE TABS (legacy)
  ───────────────────────────────────── */
  const tabKeys = ['tv-d', 'dig-d', 'ai-d', 'web-d', 'con-d'];
  window.switchTab = function (id) {
    document.querySelectorAll('.svc-tab').forEach((t, i) => t.classList.toggle('on', tabKeys[i] === id));
    document.querySelectorAll('.svc-panel').forEach(p => p.classList.toggle('on', p.id === 'panel-' + id));
  };

  /* ─────────────────────────────────────
     N3XUS BRAND FONT WALKER
  ───────────────────────────────────── */
  function runBrandWalker() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || p.classList.contains('n3xus-brand') || p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE') return NodeFilter.FILTER_REJECT;
        return n.nodeValue.includes('N3XUS') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const frag = document.createDocumentFragment();
      n.nodeValue.split(/(N3XUS)/g).forEach(part => {
        if (part === 'N3XUS') {
          const s = document.createElement('span');
          s.className = 'n3xus-brand';
          s.textContent = 'N3XUS';
          frag.appendChild(s);
        } else { frag.appendChild(document.createTextNode(part)); }
      });
      n.parentNode.replaceChild(frag, n);
    });
  }
  if (typeof requestIdleCallback !== 'undefined') requestIdleCallback(runBrandWalker);
  else setTimeout(runBrandWalker, 500);

  /* ─────────────────────────────────────
     AI CHATBOT — new pages (#chat-toggle)
  ───────────────────────────────────── */
  (function () {
    const toggle  = document.getElementById('chat-toggle');
    const win     = document.getElementById('chat-window');
    const msgs    = document.getElementById('chat-messages');
    const form    = document.getElementById('chat-form');
    const input   = document.getElementById('chat-input');
    if (!toggle || !win) return;

    let open = false, loading = false, history = [];

    const SYSTEM = `You are Aria, N3XUS Media's AI specialist. You are warm, knowledgeable and help clients grow their businesses through the Core3 framework.

N3XUS MEDIA: Full-service AI development and marketing agency combining AI Engineering (LLM apps, RAG systems, AI agents, custom AI software), Software Development (web apps, APIs, SaaS), and Marketing (TV, digital, SEO, Google Ads, Meta Ads, LLM Marketing/GEO). Serving clients worldwide. Email: info@n3xus.media | Book: https://link.n3xus.media/widget/bookings/jared-sinclair-calendar

PRICING HIGHLIGHTS: Web from $450 | AI Chatbot from $1,500 | SEO from $185/mo | Google Ads from $160/mo | Retainers: Launch $500/mo · Growth $1,025/mo · Dominate $2,025/mo

Keep replies concise (2-4 sentences). Guide toward booking a strategy call.`;

    function appendMsg(role, text) {
      const div = document.createElement('div');
      div.className = 'msg ' + (role === 'bot' ? 'msg--bot' : 'msg--user');
      div.textContent = text;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
      const d = document.createElement('div');
      d.className = 'msg msg--bot msg--typing';
      d.id = 'chat-typing';
      d.innerHTML = '<span></span><span></span><span></span>';
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function hideTyping() { const t = document.getElementById('chat-typing'); if (t) t.remove(); }

    async function send(text) {
      if (!text.trim() || loading) return;
      loading = true;
      appendMsg('user', text);
      history.push({ role: 'user', content: text });
      if (input) input.value = '';
      showTyping();
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 600, system: SYSTEM, messages: history })
        });
        const data = await res.json();
        hideTyping();
        const reply = data.content?.[0]?.text || "Sorry — connection issue. Email us: info@n3xus.media";
        history.push({ role: 'assistant', content: reply });
        appendMsg('bot', reply);
      } catch {
        hideTyping();
        appendMsg('bot', 'Connection issue. Email us at info@n3xus.media');
      }
      loading = false;
    }

    toggle.addEventListener('click', () => {
      open = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.classList.toggle('open', open);
      win.hidden = !open;
      if (open && input) setTimeout(() => input.focus(), 100);
    });

    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (input) send(input.value);
      });
    }
  })();

  /* ─────────────────────────────────────
     AI CHATBOT — legacy pages (#chat-fab)
  ───────────────────────────────────── */
  (function () {
    const chatFab  = document.getElementById('chat-fab');
    const chatBox  = document.getElementById('chatbox');
    const chatMsgs = document.getElementById('chatMsgs');
    const chatFld  = document.getElementById('chat-field');
    const chatSend = document.getElementById('chat-send');
    const unread   = document.getElementById('unread');
    if (!chatFab || !chatBox) return;

    let chatOpen = false, loading = false, history = [];

    const SYSTEM = `You are Aria, N3XUS Media's AI Sales Specialist. N3XUS is a full-service AI development and marketing agency combining AI Engineering, Software Development, and Marketing through the Core3 framework — serving clients worldwide. Phone: 021 002 8515 | Email: info@n3xus.media | Book: https://link.n3xus.media/widget/bookings/jared-sinclair-calendar. Keep responses concise.`;

    function addMsg(role, text) {
      const div = document.createElement('div');
      div.className = 'cmsg ' + role;
      div.innerHTML = text.replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      const t = document.createElement('div'); t.className = 'cmsg-time';
      t.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      div.appendChild(t);
      chatMsgs.appendChild(div);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    function showTyping() {
      const d = document.createElement('div'); d.className = 'typing'; d.id = 'typing';
      d.innerHTML = '<div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div>';
      chatMsgs.appendChild(d); chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }
    function hideTyping() { const t = document.getElementById('typing'); if (t) t.remove(); }

    async function sendMsg(txt) {
      if (!txt.trim() || loading) return;
      loading = true; if (chatSend) chatSend.disabled = true;
      addMsg('usr', txt);
      history.push({ role: 'user', content: txt });
      if (chatFld) { chatFld.value = ''; chatFld.style.height = 'auto'; }
      showTyping();
      try {
        const r = await fetch('/api/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 600, system: SYSTEM, messages: history })
        });
        const d = await r.json(); hideTyping();
        const reply = d.content?.[0]?.text || "Connection issue. Call 021 002 8515";
        history.push({ role: 'assistant', content: reply });
        addMsg('bot', reply);
      } catch { hideTyping(); addMsg('bot', 'Connection issue.\n021 002 8515 | info@n3xus.media'); }
      loading = false; if (chatSend) chatSend.disabled = false;
    }

    chatFab.addEventListener('click', () => {
      chatOpen = !chatOpen;
      chatBox.classList.toggle('open', chatOpen);
      if (chatOpen) {
        if (unread) unread.style.display = 'none';
        if (chatMsgs.children.length === 0) addMsg('bot', "Hi! I'm Aria from N3XUS Media. How can I help you grow your business today?");
        setTimeout(() => chatFld && chatFld.focus(), 300);
      }
    });

    const closeBtn = document.getElementById('chat-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { chatOpen = false; chatBox.classList.remove('open'); });
    if (chatSend) chatSend.addEventListener('click', () => sendMsg(chatFld.value));
    if (chatFld) chatFld.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(chatFld.value); } });
    setTimeout(() => { if (!chatOpen && unread) { unread.style.display = 'flex'; unread.textContent = '1'; } }, 2000);
  })();

  /* ─────────────────────────────────────
     NEURAL NETWORK CANVAS (mouse-reactive)
  ───────────────────────────────────── */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, dots = [], mouse = { x: -1000, y: -1000 }, animId;
    const COUNT   = Math.min(70, Math.floor(window.innerWidth / 18));
    const MAX_D   = 170;
    const MOUSE_R = 120;

    function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }

    function mkDot() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 1.6 + 0.4
      };
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        /* subtle mouse repulsion */
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_R) {
          const force = (MOUSE_R - dist) / MOUSE_R * 0.6;
          d.vx += (dx / dist) * force;
          d.vy += (dy / dist) * force;
        }
        /* dampen speed */
        d.vx *= 0.99; d.vy *= 0.99;
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) { d.x = 0; d.vx = Math.abs(d.vx); }
        if (d.x > W) { d.x = W; d.vx = -Math.abs(d.vx); }
        if (d.y < 0) { d.y = 0; d.vy = Math.abs(d.vy); }
        if (d.y > H) { d.y = H; d.vy = -Math.abs(d.vy); }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,200,163,0.5)';
        ctx.fill();
      });

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_D) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(0,200,163,${0.14 * (1 - d / MAX_D)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(frame);
    }

    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

    function start() { resize(); dots = Array.from({ length: COUNT }, mkDot); frame(); }
    window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); dots = Array.from({ length: COUNT }, mkDot); frame(); }, { passive: true });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }

  /* ─────────────────────────────────────
     SERVICE CARD MOUSE-TRACKING HIGHLIGHT
     Updates --mx / --my CSS vars on each
     .svc-card for the radial glow ::before
  ───────────────────────────────────── */
  (function () {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    const cards = document.querySelectorAll('.svc-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
      }, { passive: true });
    });
  })();

  /* ─────────────────────────────────────
     SCROLL-TRIGGERED SECTION ANIMATIONS
     Adds .anim-visible to .anim-ready els
     when they enter the viewport
  ───────────────────────────────────── */
  (function () {
    // Mark animation targets on the homepage
    const targets = [
      { sel: '.stat-card',          delay: true },
      { sel: '.testi-card',         delay: true },
      { sel: '.pain-item',          delay: false },
      { sel: '.pain-item--good',    delay: false },
      { sel: '.core3-card',         delay: true },
      { sel: '.c3d-node',           delay: true },
      { sel: '.svc-card',           delay: true },
    ];

    targets.forEach(({ sel, delay }) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el.classList.add('anim-ready');
        if (delay) el.dataset.delay = Math.min(i + 1, 6);
      });
    });

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.anim-ready').forEach(el => el.classList.add('anim-visible'));
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.anim-ready').forEach(el => io.observe(el));
  })();

  /* ═════════════════════════════════════════════════════════════
     ANIMATED BACKGROUND — particle neural network
     Creates a canvas at z-index:-1 behind all page content.
     Particles drift slowly, connect with lines, data pulses travel
     along connections. Mouse gently repels nearby particles.
  ═════════════════════════════════════════════════════════════ */
  (function bgCanvas() {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

    /* Inject canvas as first body element */
    const cv = document.createElement('canvas');
    cv.id = 'bg-canvas';
    cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);

    const cx   = cv.getContext('2d');
    const BG   = '#030c0d';
    const TEAL  = [0, 200, 163];
    const PURP  = [131, 90, 241];
    const WHITE = [220, 235, 240];  /* neutral white particles */
    const N    = 85;        /* particle count (was 72) */
    const LINK = 160;       /* max connection px (was 145) */
    const SPD  = 0.22;      /* max drift speed */
    const LSQR = LINK * LINK;

    let W, H;
    const pts     = [];
    const pulses  = [];     /* travelling data pulses */
    const mouse   = { x: -9999, y: -9999 };
    let   scanY   = 0;

    /* ── helpers ── */
    function rand(mn, mx) { return mn + Math.random() * (mx - mn); }

    function mkPt() {
      return {
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * SPD,
        vy: (Math.random() - 0.5) * SPD,
        r:  rand(0.5, 1.8),
        col: (function(){ const r = Math.random(); return r > 0.82 ? PURP : r > 0.65 ? WHITE : TEAL; })(),
        a:  rand(0.32, 0.72),
        t:  Math.random() * Math.PI * 2,
        pt: rand(0.006, 0.014),
      };
    }

    function resize() {
      W = cv.width  = window.innerWidth;
      H = cv.height = window.innerHeight;
    }

    function init() {
      resize();
      pts.length = pulses.length = 0;
      for (let i = 0; i < N; i++) pts.push(mkPt());
    }

    /* ── data pulse: glowing dot that travels along a connection ── */
    function tryAddPulse() {
      if (Math.random() > 0.018) return;
      for (let attempts = 0; attempts < 8; attempts++) {
        const ai = Math.floor(Math.random() * N);
        const bi = Math.floor(Math.random() * N);
        if (ai === bi) continue;
        const a = pts[ai], b = pts[bi];
        const dx = a.x - b.x, dy = a.y - b.y;
        if (dx * dx + dy * dy < LSQR) {
          pulses.push({
            a, b,
            t:     0,
            spd:   rand(0.008, 0.018),
            col:   Math.random() > 0.5 ? TEAL : PURP,
          });
          break;
        }
      }
    }

    /* ── main render loop ── */
    function frame() {
      requestAnimationFrame(frame);

      /* dark background */
      cx.fillStyle = BG;
      cx.fillRect(0, 0, W, H);

      /* subtle horizontal data-scan sweep */
      scanY = (scanY + 0.45) % H;
      const sg = cx.createLinearGradient(0, scanY - 70, 0, scanY + 70);
      sg.addColorStop(0,   'rgba(0,200,163,0)');
      sg.addColorStop(0.5, 'rgba(0,200,163,0.028)');
      sg.addColorStop(1,   'rgba(0,200,163,0)');
      cx.fillStyle = sg;
      cx.fillRect(0, scanY - 70, W, 140);

      /* connection lines (batched per α tier for fewer state changes) */
      for (let i = 0; i < N; i++) {
        const a = pts[i];
        for (let j = i + 1; j < N; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < LSQR) {
            const alpha = (1 - dSq / LSQR) * 0.22;
            cx.beginPath();
            cx.strokeStyle = `rgba(${a.col[0]},${a.col[1]},${a.col[2]},${alpha})`;
            cx.lineWidth = 0.5;
            cx.moveTo(a.x, a.y);
            cx.lineTo(b.x, b.y);
            cx.stroke();
          }
        }
      }

      /* data pulses */
      tryAddPulse();
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.spd;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const px = p.a.x + (p.b.x - p.a.x) * p.t;
        const py = p.a.y + (p.b.y - p.a.y) * p.t;
        const glow = cx.createRadialGradient(px, py, 0, px, py, 5);
        glow.addColorStop(0, `rgba(${p.col[0]},${p.col[1]},${p.col[2]},0.9)`);
        glow.addColorStop(1, `rgba(${p.col[0]},${p.col[1]},${p.col[2]},0)`);
        cx.beginPath();
        cx.arc(px, py, 5, 0, Math.PI * 2);
        cx.fillStyle = glow;
        cx.fill();
      }

      /* particles */
      for (let i = 0; i < N; i++) {
        const p = pts[i];

        /* soft mouse repulsion */
        const mx = p.x - mouse.x, my = p.y - mouse.y;
        const mdSq = mx * mx + my * my;
        if (mdSq < 14400 && mdSq > 1) {
          const md = Math.sqrt(mdSq);
          const f  = (1 - mdSq / 14400) * 0.016;
          p.vx += (mx / md) * f;
          p.vy += (my / md) * f;
        }

        /* speed cap */
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 0.55) { p.vx = p.vx / spd * 0.55; p.vy = p.vy / spd * 0.55; }

        p.x += p.vx; p.y += p.vy; p.t += p.pt;

        /* wrap at edges */
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        /* draw dot */
        const pulse = Math.sin(p.t) * 0.07;
        cx.beginPath();
        cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        cx.fillStyle = `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${p.a + pulse})`;
        cx.fill();
      }
    }

    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    document.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
    window.addEventListener('resize', init, { passive: true });

    init();
    frame();
  })();

  /* ══════════════════════════════════════════════════════════════
     SERVICE CARD HOVER GLOW — tracks mouse position for radial
  ══════════════════════════════════════════════════════════════ */
  document.querySelectorAll('.svc-card[data-svc]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
      const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', x);
      card.style.setProperty('--my', y);
    });
  });

})();