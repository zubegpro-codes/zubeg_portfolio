/**
 * ═══════════════════════════════════════════════════
 * AUTH MODULE
 * Simple passkey authentication for admin features
 * ═══════════════════════════════════════════════════
 */

const AuthManager = (() => {
  const PASSKEY = 'zubeg123';
  let isAuthenticated = false;
  let pendingAction = null;

  /**
   * Initialize auth UI bindings
   */
  function init() {
    const authSubmit = document.getElementById('auth-submit');
    const authInput = document.getElementById('auth-passkey');

    if (authSubmit) {
      authSubmit.addEventListener('click', _handleSubmit);
    }

    if (authInput) {
      authInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          _handleSubmit();
        }
      });
    }
  }

  /**
   * Request authentication before an action
   * @param {Function} action - Callback to execute after auth
   */
  function requireAuth(action) {
    if (isAuthenticated) {
      action();
      return;
    }

    pendingAction = action;
    ModalManager.open('auth', () => {
      const input = document.getElementById('auth-passkey');
      if (input) input.focus();
    });
  }

  function _handleSubmit() {
    const input = document.getElementById('auth-passkey');
    const error = document.getElementById('auth-error');

    if (!input) return;

    const value = input.value.trim();

    if (value === PASSKEY) {
      isAuthenticated = true;

      if (error) error.classList.add('hidden');

      ModalManager.close(() => {
        input.value = '';
        if (typeof pendingAction === 'function') {
          pendingAction();
          pendingAction = null;
        }
      });

      _showToast('Access granted!', 'success');
    } else {
      if (error) error.classList.remove('hidden');

      // Shake effect
      const container = input.closest('.modal-container');
      if (container) {
        container.style.animation = 'shake 0.4s';
        setTimeout(() => container.style.animation = '', 400);
      }
    }
  }

  function _showToast(message, type) {
    if (typeof ToastManager !== 'undefined') {
      ToastManager.show(message, type);
    }
  }

  return { init, requireAuth };
})();

/**
 * Toast notification helper
 */
const ToastManager = (() => {
  function show(message, type = 'success', duration = 3000) {
    // Remove existing
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  return { show };
})();

// Shake keyframes (add dynamically)
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);