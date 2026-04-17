/**
 * PUBLISHER.JS — Zubeg Studio
 * Shows draft count in navbar
 * Opens publish modal with all drafts listed
 * Downloads merged data.js on "Publish All"
 */
const Publisher = (() => {

  /* ── SET YOUR GITHUB LINKS HERE ── */
  const GITHUB_JS  = 'https://github.com/YOUR_USERNAME/YOUR_REPO/tree/main/js';
  const GITHUB_IMG = 'https://github.com/YOUR_USERNAME/YOUR_REPO/tree/main/img';
  /* ───────────────────────────────── */

  function init() {
    _bindNavBtn();
    _bindModalBtns();
    _setLinks();
    refreshBadge();
  }

  /* ── Update both desktop and mobile badge counts ── */
  function refreshBadge() {
    if (typeof DataManager === 'undefined') return;

    const count = DataManager.getDraftCount();

    /* ── Desktop button ── */
    const desktopBtn   = document.getElementById('publish-nav-btn');
    const desktopBadge = document.getElementById('publish-nav-badge');

    if (desktopBtn) {
      if (count > 0) {
        desktopBtn.classList.add('is-visible');
      } else {
        desktopBtn.classList.remove('is-visible');
      }
      if (desktopBadge) desktopBadge.textContent = count;
    }

    /* ── Mobile button ── */
    const mobileBtn   = document.getElementById('publish-nav-btn-mobile');
    const mobileBadge = document.getElementById('publish-nav-badge-mobile');

    if (mobileBtn) {
      if (count > 0) {
        mobileBtn.classList.add('is-visible');
      } else {
        mobileBtn.classList.remove('is-visible');
      }
      if (mobileBadge) mobileBadge.textContent = count;
    }
  }
  /* ── Open the modal ── */
  function openModal() {
    _goToStep(1);
    _buildDraftList();
    _refreshPreview();
    _syncCount();
    if (typeof ModalManager !== 'undefined') {
      ModalManager.open('publish-modal');
    }
  }

  /* ── Build the draft list inside the modal ── */
  function _buildDraftList() {
    const box = document.getElementById('pub-draft-list');
    if (!box || typeof DataManager === 'undefined') return;

    const { projects, experience, awards } = DataManager.getDraftBreakdown();

    const rows = [
      ...projects.map(p => ({
        section: 'projects',
        id:      p.id,
        icon:    '📁',
        badge:   'Project',
        name:    p.title || '—',
        hint:    p.image ? `Image: ${p.image}` : (p.category || '')
      })),
      ...experience.map(e => ({
        section: 'experience',
        id:      e.id,
        icon:    '💼',
        badge:   'Experience',
        name:    e.role || '—',
        hint:    e.company || ''
      })),
      ...awards.map(a => ({
        section: 'awards',
        id:      a.id,
        icon:    '🏆',
        badge:   'Award',
        name:    a.title || '—',
        hint:    a.organization || ''
      }))
    ];

    if (rows.length === 0) {
      box.innerHTML = `
        <div style="text-align:center;padding:32px 16px;">
          <p style="font-size:2.5rem;margin-bottom:8px;">📭</p>
          <p style="font-size:14px;color:var(--text-muted);">
            No drafts yet. Add a project, experience, or award first.
          </p>
        </div>`;
      return;
    }

    box.innerHTML = rows.map(r => `
      <div class="pub-draft-row" id="pub-row-${r.id}">
        <span class="pub-draft-icon">${r.icon}</span>
        <div class="pub-draft-info">
          <p class="pub-draft-name">${_esc(r.name)}</p>
          <p class="pub-draft-hint">
            <span class="pub-badge pub-badge-${r.section}">${r.badge}</span>
            ${r.hint ? `<span>${_esc(r.hint)}</span>` : ''}
          </p>
        </div>
        <button
          class="pub-delete-btn"
          data-section="${r.section}"
          data-id="${r.id}"
          title="Remove this draft"
        >✕</button>
      </div>
    `).join('');

    /* Bind delete buttons */
    box.querySelectorAll('.pub-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _removeOneDraft(
          btn.getAttribute('data-section'),
          btn.getAttribute('data-id')
        );
      });
    });
  }

  /* ── Remove one draft row ── */
  function _removeOneDraft(section, id) {
    if (typeof DataManager === 'undefined') return;
    DataManager.deleteDraft(section, id);

    const row = document.getElementById(`pub-row-${id}`);
    if (row) {
      row.style.transition = 'opacity .25s,transform .25s';
      row.style.opacity    = '0';
      row.style.transform  = 'translateX(16px)';
      setTimeout(() => row.remove(), 280);
    }

    _syncCount();
    _refreshPreview();
    refreshBadge();

    if (typeof ToastManager !== 'undefined') {
      ToastManager.show('Draft removed.', 'success');
    }
  }

  /* ── Sync the count shown in the modal header ── */
  function _syncCount() {
    const count = typeof DataManager !== 'undefined'
      ? DataManager.getDraftCount() : 0;

    document.querySelectorAll('.pub-total-count').forEach(el => {
      el.textContent = count;
    });

    const dlBtn = document.getElementById('pub-download-btn');
    if (dlBtn) {
      dlBtn.disabled      = count === 0;
      dlBtn.style.opacity = count === 0 ? '0.45' : '1';
    }
  }

  /* ── Refresh code preview textarea ── */
  function _refreshPreview() {
    const area = document.getElementById('pub-code-area');
    if (!area || typeof DataManager === 'undefined') return;
    area.value = DataManager.generateDataJS();
  }

  /* ── Bind the navbar Publish button ── */
  /* ── Bind both desktop and mobile nav buttons ── */
  function _bindNavBtn() {
    const desktopBtn = document.getElementById('publish-nav-btn');
    const mobileBtn  = document.getElementById('publish-nav-btn-mobile');

    if (desktopBtn) desktopBtn.addEventListener('click', openModal);
    if (mobileBtn)  mobileBtn.addEventListener('click', openModal);
  }

  /* ── Bind buttons inside the modal ── */
  function _bindModalBtns() {
    /* Download */
    const dlBtn = document.getElementById('pub-download-btn');
    if (dlBtn) dlBtn.addEventListener('click', _download);

    /* Copy code */
    const cpBtn = document.getElementById('pub-copy-btn');
    if (cpBtn) cpBtn.addEventListener('click', _copyCode);

    /* Done — after upload to GitHub */
    const doneBtn = document.getElementById('pub-done-btn');
    if (doneBtn) doneBtn.addEventListener('click', _finish);
  }

  /* ── Download the new data.js ── */
  function _download() {
    if (typeof DataManager === 'undefined') return;
    const count = DataManager.getDraftCount();
    if (count === 0) {
      if (typeof ToastManager !== 'undefined') {
        ToastManager.show('No drafts to publish.', 'error');
      }
      return;
    }

    const content = DataManager.generateDataJS();
    const blob    = new Blob([content], { type: 'text/javascript' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = 'data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    _goToStep(2);

    if (typeof ToastManager !== 'undefined') {
      ToastManager.show(
        `✅ data.js downloaded with ${count} item(s)! Now upload to GitHub.`,
        'success', 6000
      );
    }
  }

  /* ── Copy generated code ── */
  function _copyCode() {
    const area = document.getElementById('pub-code-area');
    if (!area?.value) return;
    navigator.clipboard.writeText(area.value).then(() => {
      const btn = document.getElementById('pub-copy-btn');
      if (btn) {
        const orig           = btn.textContent;
        btn.textContent      = '✓ Copied!';
        btn.style.background = '#34C759';
        setTimeout(() => {
          btn.textContent      = orig;
          btn.style.background = '';
        }, 2500);
      }
    }).catch(() => {
      area.select();
      document.execCommand('copy');
    });
  }

  /* ── Finish — clear drafts ── */
  function _finish() {
    if (typeof DataManager !== 'undefined') DataManager.clearAllDrafts();
    refreshBadge();
    if (typeof ModalManager !== 'undefined') ModalManager.close();
    if (typeof ToastManager !== 'undefined') {
      ToastManager.show(
        '🎉 Done! Your portfolio will be live in ~60 seconds.',
        'success', 6000
      );
    }
  }

  /* ── Switch between Step 1 and Step 2 ── */
  function _goToStep(n) {
    const s1 = document.getElementById('pub-step-1');
    const s2 = document.getElementById('pub-step-2');
    const dl = document.getElementById('pub-download-btn');
    const dn = document.getElementById('pub-done-btn');

    if (n === 1) {
      if (s1) s1.style.display = 'block';
      if (s2) s2.style.display = 'none';
      if (dl) dl.style.display = 'flex';
      if (dn) dn.style.display = 'none';
    } else {
      if (s1) s1.style.display = 'none';
      if (s2) s2.style.display = 'block';
      if (dl) dl.style.display = 'none';
      if (dn) dn.style.display = 'flex';
    }
  }

  /* ── Set GitHub links ── */
  function _setLinks() {
    document.querySelectorAll('.pub-gh-js').forEach(a  => { a.href = GITHUB_JS;  });
    document.querySelectorAll('.pub-gh-img').forEach(a => { a.href = GITHUB_IMG; });
  }

  function _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  return { init, refreshBadge, openModal };
})();