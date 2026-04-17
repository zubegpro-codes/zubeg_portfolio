/**
 * DATA MANAGER — Zubeg Studio
 * Drafts save to localStorage
 * Publish downloads a new data.js
 */
const DataManager = (() => {
  const DRAFT_KEY = 'zubeg_drafts_v2';
  let _live = null;

  function init() {
    return new Promise((resolve) => {
      try {
        if (typeof SITE_DATA === 'undefined') {
          throw new Error('SITE_DATA missing — check data.js loads first');
        }

        const base   = JSON.parse(JSON.stringify(SITE_DATA));
        const drafts = _getDrafts();

        _live = {
          ...base,
          projects:   [...(drafts.projects   || []), ...base.projects],
          experience: [...(drafts.experience || []), ...base.experience],
          awards:     [...(drafts.awards     || []), ...base.awards]
        };

        resolve(_live);
      } catch (err) {
        console.error('[DataManager]', err.message);
        _live = {
          profile:{}, stats:[], skills:[],
          experience:[], projects:[], education:[], awards:[]
        };
        resolve(_live);
      }
    });
  }

  /* GETTERS */
  const getData       = ()    => _live;
  const getSection    = (key) => _live?.[key] ?? null;

  function getDraftCount() {
    const d = _getDrafts();
    return (d.projects?.length || 0) +
           (d.experience?.length || 0) +
           (d.awards?.length || 0);
  }

  function getDraftBreakdown() {
    const d = _getDrafts();
    return {
      projects:   d.projects   || [],
      experience: d.experience || [],
      awards:     d.awards     || [],
      total:      getDraftCount()
    };
  }

  /* ADD FUNCTIONS */
  function addProject(entry) {
    const draft = {
      ...entry,
      id: `proj_${Date.now()}`,
      _isDraft: true,
      _draftedAt: new Date().toISOString()
    };
    _live.projects.unshift(draft);
    _appendDraft('projects', draft);
    return draft;
  }

  function addExperience(entry) {
    const draft = {
      ...entry,
      id: `exp_${Date.now()}`,
      _isDraft: true,
      _draftedAt: new Date().toISOString()
    };
    _live.experience.unshift(draft);
    _appendDraft('experience', draft);
    return draft;
  }

  function addAward(entry) {
    const draft = {
      ...entry,
      id: `award_${Date.now()}`,
      _isDraft: true,
      _draftedAt: new Date().toISOString()
    };
    _live.awards.unshift(draft);
    _appendDraft('awards', draft);
    return draft;
  }

  /* DELETE ONE DRAFT */
  function deleteDraft(section, id) {
    if (_live[section]) {
      _live[section] = _live[section].filter(i => i.id !== id);
    }
    const drafts = _getDrafts();
    if (drafts[section]) {
      drafts[section] = drafts[section].filter(i => i.id !== id);
      _saveDrafts(drafts);
    }
  }

  /* GENERATE the new data.js file content */
  function generateDataJS() {
    if (!_live) return '';

    function clean(arr) {
      return (arr || []).map(item => {
        const c = { ...item };
        delete c._isDraft;
        delete c._draftedAt;
        return c;
      });
    }

    const out = {
      ...JSON.parse(JSON.stringify(_live)),
      projects:   clean(_live.projects),
      experience: clean(_live.experience),
      awards:     clean(_live.awards)
    };

    return `/**
 * DATA.JS — Zubeg Studio
 * Published: ${new Date().toLocaleString('en-GB')}
 * Projects: ${out.projects.length} | Experience: ${out.experience.length} | Awards: ${out.awards.length}
 */

const SITE_DATA = ${JSON.stringify(out, null, 2)};

Object.freeze(SITE_DATA);
`;
  }

  /* CLEAR all drafts after GitHub push */
  function clearAllDrafts() {
    localStorage.removeItem(DRAFT_KEY);
  }

  /* PRIVATE */
  function _getDrafts() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  function _saveDrafts(d) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch(e) {
      console.warn('[DataManager] Storage error:', e.message);
    }
  }

  function _appendDraft(section, item) {
    const d = _getDrafts();
    if (!Array.isArray(d[section])) d[section] = [];
    d[section].unshift(item);
    _saveDrafts(d);
  }

  return {
    init, getData, getSection,
    addProject, addExperience, addAward,
    deleteDraft,
    getDraftCount, getDraftBreakdown,
    generateDataJS, clearAllDrafts
  };
})();