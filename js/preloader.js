/**
 * ═══════════════════════════════════════════════════
 * PRELOADER MODULE
 * Animated preloader with percentage counter
 * ═══════════════════════════════════════════════════
 */

const Preloader = (() => {
  let bar, percent, brandText, preloader;
  let progress = 0;
  let targetProgress = 0;
  let rafId = null;

  /**
   * Initialize and start loading animation
   * @returns {Promise} Resolves when preloader is done
   */
  function init() {
    return new Promise((resolve) => {
      preloader = document.getElementById('preloader');
      bar = document.getElementById('preloader-bar');
      percent = document.getElementById('preloader-percent');
      brandText = document.getElementById('preloader-brand-text');

      if (!preloader || !bar || !percent) {
        resolve();
        return;
      }

      // Animate brand text in
      setTimeout(() => {
        if (brandText) {
          brandText.style.transition = 'opacity 0.8s ease';
          brandText.style.opacity = '1';
        }
      }, 200);

      // Simulate loading stages
      _simulateLoading(resolve);
    });
  }

  function _simulateLoading(resolve) {
    const stages = [
      { target: 25, delay: 300 },
      { target: 50, delay: 600 },
      { target: 75, delay: 400 },
      { target: 90, delay: 300 },
      { target: 100, delay: 500 }
    ];

    let totalDelay = 0;

    stages.forEach((stage) => {
      totalDelay += stage.delay;
      setTimeout(() => {
        targetProgress = stage.target;
      }, totalDelay);
    });

    // Start animation loop
    _animate(resolve, totalDelay + 400);
  }

  function _animate(resolve, finishTime) {
    progress += (targetProgress - progress) * 0.1;
    const rounded = Math.round(progress);

    if (bar) bar.style.width = `${rounded}%`;
    if (percent) percent.textContent = `${rounded}%`;

    if (rounded < 100) {
      rafId = requestAnimationFrame(() => _animate(resolve, finishTime));
    } else {
      // Complete
      setTimeout(() => {
        _hide();
        setTimeout(resolve, 800);
      }, 200);
    }
  }

  function _hide() {
    if (preloader) {
      preloader.classList.add('loaded');
    }
    document.body.classList.remove('overflow-hidden');
    document.body.style.overflow = '';
  }

  return { init };
})();