/**
 * ═══════════════════════════════════════════════════
 * THEME MODULE
 * Dark/Light mode toggle with localStorage persistence
 * ═══════════════════════════════════════════════════
 */

const ThemeManager = (() => {
  const STORAGE_KEY = 'zubeg-theme';
  let currentTheme = 'dark';

  /**
   * Initialize theme from stored preference
   */
  function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    currentTheme = stored || 'dark';
    _applyTheme(currentTheme, false);

    // Bind toggle buttons
    const toggleBtn = document.getElementById('theme-toggle');
    const toggleBtnMobile = document.getElementById('theme-toggle-mobile');

    if (toggleBtn) toggleBtn.addEventListener('click', toggle);
    if (toggleBtnMobile) toggleBtnMobile.addEventListener('click', toggle);
  }

  /**
   * Toggle between dark and light
   */
  function toggle() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    _applyTheme(currentTheme, true);
    localStorage.setItem(STORAGE_KEY, currentTheme);

    // Play sound effect
    if (typeof SoundManager !== 'undefined') {
      SoundManager.play('click');
    }
  }

  /**
   * Apply theme to DOM
   * @param {string} theme - 'dark' or 'light'
   * @param {boolean} animate - Whether to animate
   */
  function _applyTheme(theme, animate) {
    const html = document.documentElement;

    if (animate) {
      // Smooth transition
      document.body.style.transition = 'background-color 0.6s, color 0.6s';
    }

    html.setAttribute('data-theme', theme);

    // Update icons
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');

    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      }
    }
  }

  /**
   * Get current theme
   * @returns {string}
   */
  function getTheme() {
    return currentTheme;
  }

  return { init, toggle, getTheme };
})();