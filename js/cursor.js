/**
 * ═══════════════════════════════════════════════════
 * CUSTOM CURSOR MODULE
 * Premium cursor with expand, label, and magnetic effects
 * ═══════════════════════════════════════════════════
 */

const CursorManager = (() => {
  let cursor, dot, circle, label;
  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let circleX = 0, circleY = 0;
  let isEnabled = false;
  let rafId = null;

  /**
   * Initialize cursor system
   */
  function init() {
    // Only on desktop
    if (window.innerWidth < 1024 || 'ontouchstart' in window) return;

    cursor = document.getElementById('cursor');
    dot = document.getElementById('cursor-dot');
    circle = document.getElementById('cursor-circle');
    label = document.getElementById('cursor-label');

    if (!cursor || !dot || !circle) return;

    isEnabled = true;

    document.addEventListener('mousemove', _onMouseMove, { passive: true });
    document.addEventListener('mouseenter', _show);
    document.addEventListener('mouseleave', _hide);

    // Bind interactive elements
    _bindInteractives();

    // Start render loop
    _animate();
  }

  function _onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function _animate() {
    if (!isEnabled) return;

    // Dot follows closely
    dotX += (mouseX - dotX) * 0.5;
    dotY += (mouseY - dotY) * 0.5;

    // Circle follows with lag
    circleX += (mouseX - circleX) * 0.15;
    circleY += (mouseY - circleY) * 0.15;

    dot.style.left = `${dotX}px`;
    dot.style.top = `${dotY}px`;
    circle.style.left = `${circleX}px`;
    circle.style.top = `${circleY}px`;

    if (label) {
      label.style.left = `${circleX}px`;
      label.style.top = `${circleY}px`;
    }

    rafId = requestAnimationFrame(_animate);
  }

  /**
   * Bind hover effects to all interactive elements
   */
  function _bindInteractives() {
    // Use MutationObserver to catch dynamically added elements
    _attachListeners();

    const observer = new MutationObserver(() => {
      _attachListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function _attachListeners() {
    const interactives = document.querySelectorAll('[data-cursor]');
    interactives.forEach(el => {
      if (el._cursorBound) return;
      el._cursorBound = true;

      el.addEventListener('mouseenter', () => {
        const cursorLabel = el.getAttribute('data-cursor-label');
        _expand(cursorLabel);
      });

      el.addEventListener('mouseleave', () => {
        _contract();
      });
    });

    // Magnetic buttons
    const magnetics = document.querySelectorAll('.magnetic-btn');
    magnetics.forEach(btn => {
      if (btn._magneticBound) return;
      btn._magneticBound = true;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  function _expand(text) {
    if (!cursor) return;
    cursor.classList.add('cursor-expanded');
    if (label && text) {
      label.textContent = text;
    }
  }

  function _contract() {
    if (!cursor) return;
    cursor.classList.remove('cursor-expanded');
    if (label) label.textContent = '';
  }

  function _show() {
    if (cursor) cursor.style.opacity = '1';
  }

  function _hide() {
    if (cursor) cursor.style.opacity = '0';
  }

  function refresh() {
    _attachListeners();
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    isEnabled = false;
  }

  return { init, refresh, destroy };
})();