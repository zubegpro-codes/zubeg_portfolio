/**
 * ═══════════════════════════════════════════════════
 * MODAL MODULE
 * Reusable modal system using data attributes
 * data-modal="modalName" on overlay
 * data-modal-close on close buttons
 * ═══════════════════════════════════════════════════
 */

const ModalManager = (() => {
  const modals = {};
  let activeModal = null;

  /**
   * Initialize all modals
   */
  function init() {
    // Register all modal overlays
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      const name = overlay.getAttribute('data-modal');
      if (name) {
        modals[name] = overlay;
      }
    });

    // Bind close buttons
    document.addEventListener('click', (e) => {
      // Close button
      if (e.target.closest('[data-modal-close]')) {
        close();
        return;
      }

      // Click outside modal container
      if (activeModal && e.target === activeModal) {
        close();
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && activeModal) {
        close();
      }
    });
  }

  /**
   * Open a modal by name
   * @param {string} name - Modal identifier
   * @param {Function} onOpen - Callback after opening
   */
  function open(name, onOpen) {
    const modal = modals[name];
    if (!modal) {
      console.warn(`Modal "${name}" not found`);
      return;
    }

    // Close any active modal first
    if (activeModal) {
      close();
    }

    modal.classList.add('active');
    activeModal = modal;
    document.body.style.overflow = 'hidden';

    if (typeof onOpen === 'function') {
      setTimeout(onOpen, 100);
    }
  }

  /**
   * Close the active modal
   * @param {Function} onClose - Callback after closing
   */
  function close(onClose) {
    if (!activeModal) return;

    activeModal.classList.remove('active');
    document.body.style.overflow = '';

    const closedModal = activeModal;
    activeModal = null;

    if (typeof onClose === 'function') {
      setTimeout(onClose, 400);
    }

    // Reset forms inside
    const forms = closedModal.querySelectorAll('form');
    forms.forEach(form => form.reset());

    // Clear error messages
    const errors = closedModal.querySelectorAll('.text-red-500');
    errors.forEach(err => err.classList.add('hidden'));
  }

  /**
   * Check if a modal is currently open
   * @returns {boolean}
   */
  function isOpen() {
    return activeModal !== null;
  }

  /**
   * Get the active modal element
   * @returns {HTMLElement|null}
   */
  function getActive() {
    return activeModal;
  }

  return { init, open, close, isOpen, getActive };
})();