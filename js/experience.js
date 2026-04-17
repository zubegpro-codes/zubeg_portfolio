/**
 * ═══════════════════════════════════════════════════
 * EXPERIENCE MODULE
 * Renders experience timeline + handles adding new entries
 * ═══════════════════════════════════════════════════
 */

const ExperienceModule = (() => {
  let container = null;

  /**
   * Initialize experience section
   * @param {Array} experiences - Array of experience objects
   */
  function init(experiences) {
    container = document.getElementById('experience-timeline');
    if (!container) return;

    render(experiences);
    _bindAddButton();
    _bindFormSubmit();
  }

  /**
   * Render experience entries
   * @param {Array} experiences
   */
  function render(experiences) {
    if (!container || !experiences) return;

    container.innerHTML = experiences.map((exp, index) => `
      <div class="exp-card" data-animate="fade-up" data-delay="${Math.min(index * 0.1, 0.5)}" data-experience="${exp.id}">
        <div class="exp-meta">
          <p class="text-sm font-semibold theme-text-heading">${_escapeHTML(exp.date)}</p>
          <p class="text-sm theme-text-muted mt-1">${_escapeHTML(exp.location || '')}</p>
          ${exp._isLocal ? '<span class="text-xs text-accent-blue font-semibold mt-2 inline-block">✦ Recently Added</span>' : ''}
        </div>
        <div class="exp-content">
          <h3 class="text-xl lg:text-2xl font-bold theme-text-heading mb-2">${_escapeHTML(exp.role)}</h3>
          <p class="text-base theme-text-muted font-medium mb-3">${_escapeHTML(exp.company)}</p>
          <p class="text-sm theme-text-muted leading-relaxed">${_escapeHTML(exp.description)}</p>
          ${exp.highlights && exp.highlights.length > 0 ? `
            <div class="exp-highlights">
              ${exp.highlights.map(h => `<span class="exp-highlight-tag">${_escapeHTML(h)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    // Animate new entries
    AnimationEngine.refresh();

    // Refresh smooth scroll body height
    if (typeof SmoothScroll !== 'undefined') {
      SmoothScroll.refresh();
    }

    // Refresh cursor bindings
    if (typeof CursorManager !== 'undefined') {
      CursorManager.refresh();
    }
  }

  /**
   * Bind the "Add Experience" button
   */
  function _bindAddButton() {
    const btn = document.getElementById('add-experience-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      AuthManager.requireAuth(() => {
        ModalManager.open('experience-form');
      });
    });
  }

  /**
   * Bind form submission
   */
  function _bindFormSubmit() {
    const submitBtn = document.getElementById('experience-form-submit');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', () => {
      const form = document.getElementById('experience-form');
      if (!form) return;

      // Validate
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);

      const entry = {
        role: formData.get('role'),
        company: formData.get('company'),
        location: formData.get('location') || '',
        date: formData.get('date'),
        description: formData.get('description'),
        highlights: formData.get('highlights')
          ? formData.get('highlights').split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      // Save to data
      // Save as draft
      const saved = DataManager.addExperience(entry);

      // Close modal
      ModalManager.close();

      // Re-render experience list
      render(DataManager.getSection('experience'));

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
        '💼 Experience saved as draft! Click "Publish All" in the navbar when ready.',
        'success', 5000
      );

      if (typeof SoundManager !== 'undefined') SoundManager.play('success');
    });
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} str
   * @returns {string}
   */
  function _escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init, render };
})();