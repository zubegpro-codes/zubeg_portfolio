/**
 * ═══════════════════════════════════════════════════
 * ANIMATIONS MODULE
 * GSAP-powered scroll-triggered animations
 * Data-attribute driven for reusability
 * ═══════════════════════════════════════════════════
 */

const AnimationEngine = (() => {
  let isReady = false;

  /**
   * Initialize all animations after GSAP is loaded
   */
  function init() {
    // Wait for GSAP
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP not loaded, using CSS fallbacks');
      _cssOnlyFallback();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    isReady = true;

    _initFadeUp();
    _initHeroReveal();
    _initScaleX();
    _initSplitText();
    _initCounters();
    _initNavbar();
    _initParallaxHero();
    _initFloatingElements();
    _initScrollProgress();

    // Run after a short delay to catch above-fold counters
    setTimeout(_triggerVisibleCounters, 800);
  }

  /**
   * Fade-up animations
   * Usage: data-animate="fade-up" data-delay="0.3"
   */

  
  function _initFadeUp() {
    const elements = document.querySelectorAll('[data-animate="fade-up"]');

    elements.forEach(el => {
      const delay = parseFloat(el.getAttribute('data-delay')) || 0;

      gsap.fromTo(el, {
        y: 50,
        opacity: 0,
        filter: 'blur(5px)'
      }, {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'bottom 20%',
          toggleActions: 'play none none none',
          once: true
        },
        onComplete: () => el.classList.add('animated')
      });
    });
  }

  /**
   * Scale-X line animations
   */
  function _initScaleX() {
    const elements = document.querySelectorAll('[data-animate="scale-x"]');

    elements.forEach(el => {
      gsap.fromTo(el, {
        scaleX: 0,
        transformOrigin: 'left center'
      }, {
        scaleX: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        },
        onComplete: () => el.classList.add('animated')
      });
    });
  }

  /**
   * Split text animations
   * Usage: data-animate="split-words" or data-animate="split-lines"
   */
  function _initSplitText() {
    // Split words
    const wordElements = document.querySelectorAll('[data-animate="split-words"]');

    wordElements.forEach(el => {
      const text = el.textContent.trim();
      const words = text.split(' ');

      el.innerHTML = words.map(word =>
        `<span class="split-word" style="overflow:hidden;display:inline-block;"><span style="display:inline-block;">${word}</span></span>`
      ).join(' ');

      const innerSpans = el.querySelectorAll('.split-word > span');

      gsap.fromTo(innerSpans, {
        y: '110%',
        opacity: 0
      }, {
        y: '0%',
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true
        }
      });
    });

    // Split lines (for hero heading)
    const lineElements = document.querySelectorAll('[data-animate="split-lines"]');

    lineElements.forEach(el => {
      const text = el.textContent.trim();
      const words = text.split(' ');

      el.innerHTML = words.map(word =>
        `<span class="split-word" style="overflow:hidden;display:inline-block;margin-right:0.2em;"><span style="display:inline-block;">${word}</span></span>`
      ).join('');

      const innerSpans = el.querySelectorAll('.split-word > span');

      gsap.fromTo(innerSpans, {
        y: '120%',
        opacity: 0,
        rotateX: 40
      }, {
        y: '0%',
        opacity: 1,
        rotateX: 0,
        duration: 1,
        stagger: 0.06,
        ease: 'power4.out',
        delay: 0.4,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    });
  }

  /**
   * Counter animations
   */
/**
 * Counter animations
 * Counts up from 0 to data-count value
 * Works even if element is already visible on load
 */
    function _initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    // Use IntersectionObserver as a reliable fallback
    // that works even when GSAP ScrollTrigger misses elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;

        // Prevent counting twice
        if (el._counted) return;
        el._counted = true;

        const target   = parseInt(el.getAttribute('data-count'), 10) || 0;
        const duration = 2000; // milliseconds
        const start    = performance.now();

        // Easing function — ease out cubic
        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function tick(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = easeOutCubic(progress);
            const current  = Math.round(eased * target);

            el.textContent = current;

            if (progress < 1) {
            requestAnimationFrame(tick);
            } else {
            // Make sure it lands exactly on the target
            el.textContent = target;
            }
        }

        requestAnimationFrame(tick);

        // Stop observing once counted
        observer.unobserve(el);
        });
    }, {
        threshold: 0.1,        // Trigger when 10% is visible
        rootMargin: '0px 0px -50px 0px'  // Slight offset from bottom
    });

    counters.forEach(counter => {
        // Set initial value to 0 visually
        counter.textContent = '0';
        observer.observe(counter);
    });
    }
  /**

   * Navbar hide/show on scroll
   */
  function _initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;

    ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        const currentScroll = self.scroll();

        if (currentScroll > 100) {
          if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.classList.add('nav-hidden');
          } else {
            navbar.classList.remove('nav-hidden');
          }
        } else {
          navbar.classList.remove('nav-hidden');
        }

        lastScroll = currentScroll;
      }
    });
  }

  /**
   * Hero parallax on mouse move
   */
    function _initParallaxHero() {
    const hero = document.getElementById('hero');
    const heroContent = document.getElementById('hero-content');
    const heroPortrait = document.getElementById('hero-portrait');

    if (!hero) return;

    // Reveal animation for portrait
    if (heroPortrait && typeof gsap !== 'undefined') {
        gsap.fromTo(heroPortrait, 
        {
            opacity: 0,
            y: 60,
            scale: 0.9
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.8,
            delay: 0.5,
            ease: 'expo.out'
        }
        );
    }

    // Skip mouse parallax on mobile
    if (window.innerWidth < 1024) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        // Text moves slightly
        if (heroContent) {
        gsap.to(heroContent, {
            x: x * 12,
            y: y * 8,
            duration: 1.2,
            ease: 'power2.out'
        });
        }

        // Portrait moves opposite direction for depth
        if (heroPortrait) {
        gsap.to(heroPortrait, {
            x: x * -20,
            y: y * -12,
            rotateY: x * 5,
            rotateX: -y * 5,
            duration: 1.5,
            ease: 'power2.out'
        });
        }
    });

    // Reset on mouse leave
    hero.addEventListener('mouseleave', () => {
        if (heroContent) {
        gsap.to(heroContent, { x: 0, y: 0, duration: 0.8, ease: 'power2.out' });
        }
        if (heroPortrait) {
        gsap.to(heroPortrait, { x: 0, y: 0, rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power2.out' });
        }
    });

    // Scroll fade-out effect
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.to(heroPortrait, {
        scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '60% top',
            scrub: 1
        },
        y: -80,
        opacity: 0,
        scale: 0.95
        });
    }
    }
  /**
   * Create floating hero particles
   */
  function _initFloatingElements() {
    const container = document.getElementById('hero-particles');
    if (!container || window.innerWidth < 768) return;

    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 4 + 2;

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${Math.random() > 0.5 ? 'rgba(41, 151, 255, 0.2)' : 'rgba(201, 169, 110, 0.15)'};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;

      container.appendChild(particle);

      gsap.to(particle, {
        y: () => `${(Math.random() - 0.5) * 200}`,
        x: () => `${(Math.random() - 0.5) * 100}`,
        opacity: () => Math.random() * 0.5 + 0.1,
        duration: () => Math.random() * 6 + 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 3
      });
    }
  }

  /**
   * Non-GSAP scroll progress (fallback for smooth scroll scenarios)
   */
  function _initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    // If using smooth scroll module, it handles progress
    // Otherwise use ScrollTrigger
    ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        progressBar.style.width = `${(self.progress * 100).toFixed(1)}%`;
      }
    });
  }

  /**
   * CSS-only fallback if GSAP isn't available
   */
  function _cssOnlyFallback() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Refresh ScrollTrigger (call after content changes)
   */
  function refresh() {
    if (isReady) {
      ScrollTrigger.refresh();
    }
  }

  /**
   * Animate new elements added dynamically
   * @param {HTMLElement} container - Container of new elements
   */
  function animateNewElements(container) {
    if (!isReady || !container) return;

    const elements = container.querySelectorAll('[data-animate]');
    elements.forEach(el => {
      const type = el.getAttribute('data-animate');
      const delay = parseFloat(el.getAttribute('data-delay')) || 0;

      if (type === 'fade-up') {
        gsap.fromTo(el, {
          y: 50,
          opacity: 0,
          filter: 'blur(5px)'
        }, {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          delay: delay,
          ease: 'power3.out'
        });
      }
    });
  }

  return { init, refresh, animateNewElements };
})();

/**
 * Force-trigger counters that are already visible
 * when the page first loads (above the fold)
 */
function _triggerVisibleCounters() {
  const counters = document.querySelectorAll('.counter');

  counters.forEach(counter => {
    const rect = counter.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible && !counter._counted) {
      counter._counted = true;

      const target   = parseInt(counter.getAttribute('data-count'), 10) || 0;
      const duration = 2000;
      const start    = performance.now();

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const current  = Math.round(easeOutCubic(progress) * target);
        counter.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(tick);
    }
  });
}