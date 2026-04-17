/**
 * ═══════════════════════════════════════════════════
 * APP.JS — Main Application Entry Point
 * Zubeg Studio — Crafted by Uchennam Nzubechi
 * ═══════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════
   SOUND MANAGER
   ═══════════════════════════════════════════════════ */
const SoundManager = (() => {
  let enabled = false;
  let audioCtx = null;

  function init() {
    const toggleBtn = document.getElementById('sound-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      if (!audioCtx) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          console.warn('SoundManager: AudioContext not supported');
          return;
        }
      }

      enabled = !enabled;

      const onIcon  = document.getElementById('sound-icon-on');
      const offIcon = document.getElementById('sound-icon-off');

      if (onIcon && offIcon) {
        if (enabled) {
          onIcon.classList.remove('hidden');
          offIcon.classList.add('hidden');
          play('click');
        } else {
          onIcon.classList.add('hidden');
          offIcon.classList.remove('hidden');
        }
      }
    });
  }

  function play(type) {
    if (!enabled || !audioCtx) return;

    try {
      const oscillator = audioCtx.createOscillator();
      const gainNode   = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        gainNode.gain.setValueAtTime(0.03, now);
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);

      } else if (type === 'success') {
        gainNode.gain.setValueAtTime(0.03, now);
        oscillator.frequency.setValueAtTime(523, now);
        oscillator.frequency.setValueAtTime(659, now + 0.1);
        oscillator.frequency.setValueAtTime(784, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        oscillator.start(now);
        oscillator.stop(now + 0.35);
      }
    } catch (e) {
      // Silently fail
    }
  }

  return { init, play };
})();


/* ═══════════════════════════════════════════════════
   AWARD MODULE
   Handles Add Award button, form, draft saving
   ═══════════════════════════════════════════════════ */
const AwardModule = (() => {

  function init(awards) {
    // Render the awards on page load
    renderAwards(awards);

    // Bind the "Add Award" button
    _bindAddBtn();

    // Bind the form submit button
    _bindSubmit();
  }

  function _bindAddBtn() {
    const btn = document.getElementById('add-award-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      // Require passkey first
      if (typeof AuthManager !== 'undefined') {
        AuthManager.requireAuth(() => {
          if (typeof ModalManager !== 'undefined') {
            ModalManager.open('award-form');
          }
        });
      }
    });
  }

  function _bindSubmit() {
    const submitBtn = document.getElementById('award-form-submit');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', () => {
      const form = document.getElementById('award-form');
      if (!form) return;

      // Get field values
      const titleEl    = form.querySelector('[name="title"]');
      const orgEl      = form.querySelector('[name="organization"]');
      const yearEl     = form.querySelector('[name="year"]');
      const descEl     = form.querySelector('[name="description"]');

      const title        = titleEl  ? titleEl.value.trim()  : '';
      const organization = orgEl    ? orgEl.value.trim()    : '';
      const year         = yearEl   ? yearEl.value.trim()   : '';
      const description  = descEl   ? descEl.value.trim()   : '';

      // Validate
      if (!title) {
        ToastManager.show('Please enter the award title.', 'error');
        if (titleEl) titleEl.focus();
        return;
      }

      if (!organization) {
        ToastManager.show('Please enter the organisation name.', 'error');
        if (orgEl) orgEl.focus();
        return;
      }

      if (!description) {
        ToastManager.show('Please enter a description.', 'error');
        if (descEl) descEl.focus();
        return;
      }

      // Build entry
      const entry = { title, organization, year, description };

      // Save as draft in DataManager
      if (typeof DataManager !== 'undefined') {
        DataManager.addAward(entry);
      }

      // Close the modal
      if (typeof ModalManager !== 'undefined') {
        ModalManager.close();
      }

      // Re-render awards section with new data
      if (typeof DataManager !== 'undefined') {
        renderAwards(DataManager.getSection('awards'));
      }

      // Update the publish badge in navbar
      if (typeof Publisher !== 'undefined') {
        Publisher.refreshBadge();
      }

      // Refresh layout engines
      setTimeout(() => {
        if (typeof AnimationEngine !== 'undefined') AnimationEngine.refresh();
        if (typeof SmoothScroll   !== 'undefined') SmoothScroll.refresh();
        if (typeof CursorManager  !== 'undefined') CursorManager.refresh();
      }, 200);

      // Success toast
      ToastManager.show(
        '🏆 Award saved as draft! Click "Publish All" in the navbar when ready.',
        'success',
        5000
      );

      // Success sound
      if (typeof SoundManager !== 'undefined') {
        SoundManager.play('success');
      }
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════════════════
   RENDER — SKILLS
   ═══════════════════════════════════════════════════ */
function renderSkills(skills) {
  const grid = document.getElementById('skills-grid');
  if (!grid || !Array.isArray(skills) || skills.length === 0) return;

  grid.innerHTML = skills.map((skill, i) => `
    <div class="skill-card"
         data-animate="fade-up"
         data-delay="${Math.min(i * 0.1, 0.5)}"
         data-cursor="pointer">
      <div class="relative z-10">
        <div class="text-3xl mb-4">${skill.icon || '⚙️'}</div>
        <h3 class="text-lg font-bold theme-text-heading mb-4">
          ${escapeHTML(skill.category)}
        </h3>
        <div class="flex flex-wrap gap-2">
          ${(skill.items || []).map(item =>
            `<span class="skill-tag">${escapeHTML(item)}</span>`
          ).join('')}
        </div>
      </div>
    </div>
  `).join('');
}


/* ═══════════════════════════════════════════════════
   RENDER — AWARDS
   ═══════════════════════════════════════════════════ */
function renderAwards(awards) {
  const container = document.getElementById('awards-container');
  if (!container) return;

  // Fallback — always shows something
  const fallback = [
    {
      title:        'Best ICT & Hardworking Instructor',
      organization: 'Master Vessel Classical Academy (MVCA)',
      year:         '2020',
      description:  'Recognized for outstanding dedication, innovative teaching methods, and exceptional student performance results in ICT education.'
    }
  ];

  const list = (Array.isArray(awards) && awards.length > 0) ? awards : fallback;

  container.innerHTML = list.map((award, i) => `
    <div class="award-card" data-animate="fade-up" data-delay="${i * 0.15}">
      <div class="relative z-10">

        <div class="flex items-start justify-between mb-4">
          <div class="award-trophy">🏆</div>
          ${award.year
            ? `<span class="award-year-badge">${escapeHTML(String(award.year))}</span>`
            : ''}
        </div>

        <h3 class="text-xl font-bold theme-text-heading mb-2 leading-snug">
          ${escapeHTML(award.title)}
        </h3>

        <p class="text-sm font-semibold mb-4" style="color:#C9A96E;">
          ${escapeHTML(award.organization)}
        </p>

        <p class="text-sm theme-text-muted leading-relaxed">
          ${escapeHTML(award.description)}
        </p>

        ${award._isDraft
          ? `<span class="draft-indicator">● Draft</span>`
          : ''}

      </div>
    </div>
  `).join('');
}


/* ═══════════════════════════════════════════════════
   RENDER — EDUCATION
   ═══════════════════════════════════════════════════ */
function renderEducation(education) {
  const container = document.getElementById('education-container');
  if (!container) return;

  const fallback = [
    {
      degree:      'B.Sc. Computer Science',
      institution: 'Michael Okpara University of Agriculture, Umudike',
      date:        'September 2018 – August 2023',
      achievement: 'Second-Class Upper (2.1) GPA',
      highlight:   'Built a Face Recognition Attendance System as final year project'
    },
    {
      degree:      'West African Senior School Certificate (WASSCE)',
      institution: 'Government College Umuahia',
      date:        'September 2011 – July 2016',
      achievement: 'WASSCE Certificate',
      highlight:   'Active member of JET clubs (technology-focused)'
    }
  ];

  const list = (Array.isArray(education) && education.length > 0)
    ? education
    : fallback;

  container.innerHTML = list.map((edu, i) => `
    <div class="edu-card" data-animate="fade-up" data-delay="${i * 0.15}">
      <div class="edu-icon">🎓</div>

      <h4 class="text-lg font-bold theme-text-heading mb-1">
        ${escapeHTML(edu.degree)}
      </h4>

      <p class="text-sm font-semibold mb-2" style="color:var(--accent-primary);">
        ${escapeHTML(edu.institution)}
      </p>

      <p class="text-xs theme-text-muted mb-3">
        ${escapeHTML(edu.date)}
      </p>

      ${edu.achievement ? `
        <div class="flex items-center gap-2 mb-2">
          <span>⭐</span>
          <p class="text-sm font-medium theme-text-heading">
            ${escapeHTML(edu.achievement)}
          </p>
        </div>` : ''}

      ${edu.highlight ? `
        <p class="text-xs theme-text-muted leading-relaxed mt-2">
          ${escapeHTML(edu.highlight)}
        </p>` : ''}
    </div>
  `).join('');
}


/* ═══════════════════════════════════════════════════
   COUNTER FALLBACK
   Safety net if AnimationEngine counters don't fire
   ═══════════════════════════════════════════════════ */
function initCountersFallback() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const target  = parseInt(counter.getAttribute('data-count'), 10);

      if (counter.textContent === '0' && !isNaN(target)) {
        const duration  = 2000;
        const startTime = performance.now();

        function tick(now) {
          const elapsed  = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      }

      observer.unobserve(counter);
    });
  }, { threshold: 0.1 });

  counters.forEach(counter => observer.observe(counter));
}


/* ═══════════════════════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn  = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  function openMenu() {
    btn.classList.add('active');
    menu.style.opacity       = '1';
    menu.style.pointerEvents = 'auto';
    menu.style.visibility    = 'visible';
    document.body.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    btn.classList.remove('active');
    menu.style.opacity       = '0';
    menu.style.pointerEvents = 'none';
    setTimeout(() => { menu.style.visibility = 'hidden'; }, 500);
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => {
    btn.classList.contains('active') ? closeMenu() : openMenu();
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.classList.contains('active')) {
      closeMenu();
    }
  });
}


/* ═══════════════════════════════════════════════════
   SMOOTH ANCHOR LINKS
   ═══════════════════════════════════════════════════ */
function initAnchorLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight    = 80;
      const targetTop    = target.getBoundingClientRect().top + window.scrollY;
      const scrollTarget = targetTop - navHeight;

      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    });
  });
}


/* ═══════════════════════════════════════════════════
   CONTACT FORM — Sends to WhatsApp
   ═══════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const WHATSAPP_NUMBER = '2349051756261';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl    = document.getElementById('cf-name');
    const emailEl   = document.getElementById('cf-email');
    const subjectEl = document.getElementById('cf-subject');
    const messageEl = document.getElementById('cf-message');

    const name    = nameEl    ? nameEl.value.trim()    : '';
    const email   = emailEl   ? emailEl.value.trim()   : '';
    const subject = subjectEl ? subjectEl.value.trim() : '';
    const message = messageEl ? messageEl.value.trim() : '';

    if (!name) {
      ToastManager.show('Please enter your name.', 'error');
      if (nameEl) nameEl.focus();
      return;
    }

    if (!email) {
      ToastManager.show('Please enter your email address.', 'error');
      if (emailEl) emailEl.focus();
      return;
    }

    if (!message) {
      ToastManager.show('Please enter a message.', 'error');
      if (messageEl) messageEl.focus();
      return;
    }

    const waMessage = [
      `━━━━━━━━━━━━━━━━━━━━━`,
      `📩 *NEW INQUIRY — Zubeg Studio*`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `👤 *Name:* ${name}`,
      `📧 *Email:* ${email}`,
      subject ? `📌 *Subject:* ${subject}` : '',
      ``,
      `💬 *Message:*`,
      message,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `Sent from zubegstudio.com`,
    ].filter(line => line !== null && line !== '').join('\n');

    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    window.open(whatsappURL, '_blank');

    ToastManager.show('Opening WhatsApp with your message…', 'success');

    if (typeof SoundManager !== 'undefined') {
      SoundManager.play('success');
    }

    form.reset();
  });
}


/* ═══════════════════════════════════════════════════
   FOOTER — Auto year
   ═══════════════════════════════════════════════════ */
function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}


/* ═══════════════════════════════════════════════════
   SCROLL PROGRESS BAR — native scroll fallback
   ═══════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrolled  = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    bar.style.width = `${(scrolled / maxScroll) * 100}%`;
  }, { passive: true });
}


/* ═══════════════════════════════════════════════════
   HTML ESCAPE UTILITY
   ═══════════════════════════════════════════════════ */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}


/* ═══════════════════════════════════════════════════
   MAIN INITIALISATION
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  /* ── 1. Theme first — prevents flash of wrong colour ── */
  if (typeof ThemeManager !== 'undefined') {
    ThemeManager.init();
  }

  /* ── 2. Preloader ── */
  if (typeof Preloader !== 'undefined') {
    await Preloader.init();
  }

  /* ── 3. Reveal main content ── */
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.style.transition = 'opacity 0.6s ease';
    mainContent.style.opacity    = '1';
    mainContent.style.visibility = 'visible';
  }

  /* ── 4. Show cursor ── */
  const cursorEl = document.getElementById('cursor');
  if (cursorEl) {
    cursorEl.style.display = 'block';
    cursorEl.style.opacity = '1';
  }

  /* ── 5. Remove body overflow lock left by preloader ── */
  document.body.classList.remove('overflow-hidden');
  document.body.style.overflow = '';

  /* ── 6. Smooth scroll ── */
  if (typeof SmoothScroll !== 'undefined') {
    SmoothScroll.init();
  }

  /* ── 7. Custom cursor ── */
  if (typeof CursorManager !== 'undefined') {
    CursorManager.init();
  }

  /* ── 8. Modal system ── */
  if (typeof ModalManager !== 'undefined') {
    ModalManager.init();
  }

  /* ── 9. Auth system ── */
  if (typeof AuthManager !== 'undefined') {
    AuthManager.init();
  }

  /* ── 10. Sound manager ── */
  SoundManager.init();

  /* ── 11. Load data ── */
  let data = null;

  if (typeof DataManager !== 'undefined') {
    try {
      data = await DataManager.init();
    } catch (err) {
      console.error('DataManager failed to load:', err);
    }
  }

  /* ── 12. Render all sections ── */

  // Skills
  renderSkills(data?.skills || []);

  // Experience — ExperienceModule handles its own render + add button
  if (typeof ExperienceModule !== 'undefined') {
    ExperienceModule.init(data?.experience || []);
  }

  // Projects — ProjectsModule handles its own render + add button
  if (typeof ProjectsModule !== 'undefined') {
    ProjectsModule.init(data?.projects || []);
  }

  // Awards — AwardModule handles render + add button + draft saving
  AwardModule.init(data?.awards || []);

  // Education — simple render only (no add feature)
  renderEducation(data?.education || []);

  /* ── 13. Publisher — MUST come after DataManager.init() ── */
  if (typeof Publisher !== 'undefined') {
    Publisher.init();
  }

  /* ── 14. Animations — small delay so DOM is fully ready ── */
  setTimeout(() => {
    if (typeof AnimationEngine !== 'undefined') {
      AnimationEngine.init();
    }
  }, 100);

  /* ── 15. UI helpers ── */
  initMobileMenu();
  initAnchorLinks();
  initContactForm();
  initScrollProgress();
  setFooterYear();

  /* ── 16. Counter fallback — runs 2s after load ── */
  setTimeout(() => {
    initCountersFallback();
  }, 2000);

  /* ── 17. Refresh layout engines after everything renders ── */
  setTimeout(() => {
    if (typeof SmoothScroll    !== 'undefined') SmoothScroll.refresh();
    if (typeof AnimationEngine !== 'undefined') AnimationEngine.refresh();
    if (typeof CursorManager   !== 'undefined') CursorManager.refresh();
  }, 600);

  /* ── Console signature ── */
  console.log(
    '%c🚀 Zubeg Studio — Portfolio Loaded',
    'background:#0A0A0A;color:#2997FF;padding:10px 20px;font-size:14px;font-weight:bold;border-radius:4px;'
  );
  console.log(
    '%cCrafted by Uchennam Nzubechi',
    'color:#C9A96E;font-size:12px;font-style:italic;'
  );
});