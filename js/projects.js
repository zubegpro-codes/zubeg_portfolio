/**
 * ═══════════════════════════════════════════════════
 * PROJECTS MODULE
 * Renders project cards + handles filtering, adding,
 * and image viewing
 * ═══════════════════════════════════════════════════
 */

const ProjectsModule = (() => {
  let container = null;
  let allProjects = [];
  let currentFilter = 'all';

  /**
   * Initialize projects section
   * @param {Array} projects - Array of project objects
   */
  function init(projects) {
    container = document.getElementById('projects-grid');
    if (!container) return;

    allProjects = projects || [];
    render(allProjects);

    _bindFilters();
    _bindAddButton();
    _bindFormSubmit();
  }

  /**
   * Render project cards
   * @param {Array} projects
   */
  function render(projects) {
    if (!container) return;

    if (projects.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-20">
          <p class="text-xl theme-text-muted">No projects found in this category.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = projects.map((proj, index) => `
      <div class="project-card group" 
           data-project="${proj.id}" 
           data-category="${_escapeAttr(proj.category)}"
           data-cursor="pointer"
           data-cursor-label="View"
           data-animate="fade-up" 
           data-delay="${Math.min(index * 0.1, 0.6)}">
        <div class="project-card-glow"></div>
        ${proj.featured ? '<span class="project-featured-badge">Featured</span>' : ''}
        <div class="project-card-image" 
             data-modal-trigger="image-viewer"
             data-image="${proj.image ? _escapeAttr('img/' + proj.image) : ''}">
          ${proj.image ? `
            <img src="img/${_escapeAttr(proj.image)}" 
                 alt="${_escapeAttr(proj.title)}" 
                 loading="lazy"
                 onerror="this.parentElement.innerHTML='<div class=\\'project-card-placeholder\\'>🖼️</div>'" />
          ` : `
            <div class="project-card-placeholder">
              ${_getCategoryIcon(proj.category)}
            </div>
          `}
          <div class="project-overlay">
            ${proj.link ? `
              <a href="${_escapeAttr(proj.link)}" target="_blank" rel="noopener" 
                 class="text-white text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
                 data-cursor="pointer" data-cursor-label="Open"
                 onclick="event.stopPropagation()">
                Visit Live ↗
              </a>
            ` : ''}
          </div>
        </div>
        <div class="project-card-body">
          <p class="project-card-category">${_escapeHTML(proj.category)}</p>
          <h3 class="project-card-title">${_escapeHTML(proj.title)}</h3>
          <p class="project-card-desc">${_escapeHTML(proj.description)}</p>
          <div class="project-card-techs">
            ${(proj.technologies || []).map(tech => 
              `<span class="project-tech-tag">${_escapeHTML(tech)}</span>`
            ).join('')}
          </div>
        </div>
      </div>
    `).join('');

    // Re-bind image click events
    _bindImageViewers();

    // Refresh animations
    AnimationEngine.refresh();

    // Refresh smooth scroll
    if (typeof SmoothScroll !== 'undefined') {
      SmoothScroll.refresh();
    }

    // Refresh cursor
    if (typeof CursorManager !== 'undefined') {
      CursorManager.refresh();
    }
  }

  /**
   * Bind filter buttons
   */
  function _bindFilters() {
    const filterContainer = document.getElementById('project-filters');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      const filter = btn.getAttribute('data-filter');

      // Update active state
      filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentFilter = filter;

      // Filter and render
      const filtered = filter === 'all'
        ? allProjects
        : allProjects.filter(p => p.category === filter);

      render(filtered);
    });
  }

  /**
   * Bind image viewer click events
   */
  function _bindImageViewers() {
    const triggers = container.querySelectorAll('[data-modal-trigger="image-viewer"]');

    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        const imageSrc = trigger.getAttribute('data-image');
        if (!imageSrc) return;

        _openImageViewer(imageSrc);
      });
    });
  }

  /**
   * Open fullscreen image viewer
   * @param {string} src - Image source path
   */
  function _openImageViewer(src) {
    const img = document.getElementById('image-viewer-img');
    const viewerContainer = document.getElementById('image-viewer-container');

    if (!img) return;

    img.src = src;
    img.onerror = () => {
      img.src = '';
      img.alt = 'Image not available';
    };

    ModalManager.open('image-viewer');

    // 3D tilt on mouse move
    if (viewerContainer && window.innerWidth >= 1024) {
      const _tiltHandler = (e) => {
        const rect = viewerContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        img.style.transform = `
          perspective(1000px) 
          rotateY(${x * 10}deg) 
          rotateX(${-y * 10}deg) 
          scale(1.02)
        `;
      };

      viewerContainer._tiltHandler = _tiltHandler;
      viewerContainer.addEventListener('mousemove', _tiltHandler);

      // Cleanup on close
      const observer = new MutationObserver(() => {
        const modal = document.getElementById('image-viewer-modal');
        if (modal && !modal.classList.contains('active')) {
          viewerContainer.removeEventListener('mousemove', _tiltHandler);
          img.style.transform = '';
          observer.disconnect();
        }
      });

      observer.observe(document.getElementById('image-viewer-modal'), {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    // Drag to move
    _enableDrag(img);
  }

  /**
   * Enable drag-to-move on image
   * @param {HTMLElement} el
   */
  function _enableDrag(el) {
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    el.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      el.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      el.style.transform = `translate(${translateX}px, ${translateY}px)`;
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        el.style.cursor = 'grab';
        // Smooth return to center
        translateX = 0;
        translateY = 0;
        el.style.transition = 'transform 0.4s ease';
        el.style.transform = '';
        setTimeout(() => el.style.transition = '', 400);
      }
    });
  }

  /**
   * Bind "Add Project" button
   */
  function _bindAddButton() {
    const btn = document.getElementById('add-project-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      AuthManager.requireAuth(() => {
        ModalManager.open('project-form');
      });
    });
  }

  /**
   * Bind form submission
   */
  function _bindFormSubmit() {
    const submitBtn = document.getElementById('project-form-submit');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', () => {
      const form = document.getElementById('project-form');
      if (!form) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);

      const entry = {
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        image: formData.get('image') || '',
        technologies: formData.get('technologies')
          ? formData.get('technologies').split(',').map(s => s.trim()).filter(Boolean)
          : [],
        link: formData.get('link') || '',
        featured: form.querySelector('[name="featured"]').checked
      };

// Save as draft
      const saved = DataManager.addProject(entry);

      // Update local reference
      allProjects = DataManager.getSection('projects');

      // Close modal
      ModalManager.close();

      // Re-render with current filter
      const filtered = currentFilter === 'all'
        ? allProjects
        : allProjects.filter(p => p.category === currentFilter);
      render(filtered);

      // Update publish badge
      if (typeof Publisher !== 'undefined') Publisher.refreshBadge();

      // Refresh layout engines
      setTimeout(() => {
        if (typeof AnimationEngine !== 'undefined') AnimationEngine.refresh();
        if (typeof SmoothScroll   !== 'undefined') SmoothScroll.refresh();
        if (typeof CursorManager  !== 'undefined') CursorManager.refresh();
      }, 200);

      // Toast
      ToastManager.show(
        '📁 Project saved as draft! Click "Publish All" in the navbar when ready.',
        'success', 5000
      );

      if (typeof SoundManager !== 'undefined') SoundManager.play('success');
      
    });
  }

  /**
   * Get category icon
   * @param {string} category
   * @returns {string}
   */
  function _getCategoryIcon(category) {
    const icons = {
      'Web Development': '🌐',
      'Full-Stack Web App': '⚡',
      'Desktop Application': '🖥️',
      'Landing Page': '📄',
      'Front-end': '🎨',
      'Mobile App': '📱'
    };
    return icons[category] || '🚀';
  }

  function _escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function _escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return { init, render };
})();