/**
 * ═══════════════════════════════════════════════════
 * SMOOTH SCROLL MODULE
 * Custom smooth/inertia scrolling system
 * ═══════════════════════════════════════════════════
 */

const SmoothScroll = (() => {
  let isActive = false;
  let current = 0;
  let target = 0;
  let ease = 0.08;
  let rafId = null;
  let wrapper = null;
  let body = null;

  /**
   * Initialize smooth scroll
   * On mobile devices, we skip to maintain native performance
   */
  function init() {
    // Skip on mobile for performance
    if (window.innerWidth < 1024 || 'ontouchstart' in window) {
      document.body.style.overflowY = 'auto';
      return;
    }

    body = document.body;
    wrapper = document.getElementById('main-content');

    if (!wrapper) return;

    // Set body height to match content
    _setBodyHeight();

    // Make main content fixed
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.width = '100%';
    wrapper.style.willChange = 'transform';

    // Listen for scroll
    window.addEventListener('scroll', _onScroll, { passive: true });
    window.addEventListener('resize', _onResize, { passive: true });

    isActive = true;
    _animate();
  }

  function _onScroll() {
    target = window.scrollY;
  }

  function _onResize() {
    _setBodyHeight();
  }

  function _setBodyHeight() {
    if (!wrapper) return;
    body.style.height = `${wrapper.scrollHeight}px`;
  }

  function _animate() {
    current += (target - current) * ease;

    // Round to prevent sub-pixel rendering issues
    const rounded = Math.round(current * 100) / 100;

    if (wrapper) {
      wrapper.style.transform = `translate3d(0, ${-rounded}px, 0)`;
    }

    // Update scroll progress bar
    _updateScrollProgress();

    rafId = requestAnimationFrame(_animate);
  }

  function _updateScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (current / scrollHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }

  /**
   * Scroll to specific element
   * @param {string} selector - CSS selector
   * @param {number} offset - Offset from top
   */
  function scrollTo(selector, offset = 0) {
    const el = document.querySelector(selector);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const absoluteTop = rect.top + (isActive ? current : window.scrollY);

    window.scrollTo({
      top: absoluteTop - offset,
      behavior: isActive ? 'auto' : 'smooth'
    });
  }

  /**
   * Refresh body height (call after content changes)
   */
  function refresh() {
    if (isActive) {
      _setBodyHeight();
    }
  }

  /**
   * Get current scroll position
   */
  function getScroll() {
    return isActive ? current : window.scrollY;
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('scroll', _onScroll);
    window.removeEventListener('resize', _onResize);
    if (wrapper) {
      wrapper.style.position = '';
      wrapper.style.top = '';
      wrapper.style.left = '';
      wrapper.style.width = '';
      wrapper.style.transform = '';
      wrapper.style.willChange = '';
    }
    if (body) body.style.height = '';
    isActive = false;
  }

  return { init, scrollTo, refresh, getScroll, destroy };
})();