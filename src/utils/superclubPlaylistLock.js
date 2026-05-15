const LOCK_KEY = 'ss_superclub_playlist_flow_done';
const PAYLOAD_KEY = 'ss_superclub_playlist_payload';

/**
 * Temporary: allow Super Club landing → MCQ → confirm navigation without skipping to confirm.
 * Set to `false` before release to restore post-MCQ lock behavior.
 */
export const SUPERCLUB_PLAYLIST_FLOW_DEV_UNLOCK = true;

/** Matches empty-submit default on early-access (four chips in list order). */
export function getDefaultSuperclubPlaylistPayload() {
  return {
    sportIds: ['pickleball', 'padel', 'calisthenics', 'functional'],
    otherSelected: false,
    otherNote: '',
  };
}

/**
 * @returns {{ locked: boolean, payload: { sportIds: string[], otherSelected: boolean, otherNote: string } | null }}
 */
export function readSuperclubPlaylistLock() {
  if (typeof window === 'undefined') {
    return { locked: false, payload: null };
  }
  try {
    const hasLock = window.localStorage.getItem(LOCK_KEY) === '1';
    if (!hasLock) {
      return { locked: false, payload: null };
    }

    let payload = null;
    const raw = window.localStorage.getItem(PAYLOAD_KEY);
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = null;
      }
    }
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.sportIds)) {
      payload = getDefaultSuperclubPlaylistPayload();
    }
    const normalizedPayload = {
      sportIds: payload.sportIds,
      otherSelected: Boolean(payload.otherSelected),
      otherNote: String(payload.otherNote || '').trim(),
    };

    if (SUPERCLUB_PLAYLIST_FLOW_DEV_UNLOCK) {
      return { locked: false, payload: normalizedPayload };
    }

    return {
      locked: true,
      payload: normalizedPayload,
    };
  } catch {
    return { locked: false, payload: null };
  }
}

export function persistSuperclubPlaylistLock(payload) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(LOCK_KEY, '1');
    const safe = {
      sportIds: Array.isArray(payload?.sportIds) ? payload.sportIds : [],
      otherSelected: Boolean(payload?.otherSelected),
      otherNote: String(payload?.otherNote || '').trim(),
    };
    window.localStorage.setItem(PAYLOAD_KEY, JSON.stringify(safe));
  } catch {
    /* private mode / quota */
  }
}

export function clearSuperclubPlaylistLock() {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(LOCK_KEY);
    window.localStorage.removeItem(PAYLOAD_KEY);
  } catch {
    /* */
  }
}

/**
 * @param {string} targetPage
 * @param {'default-auth' | 'superclub-nav'} mode
 *   default-auth — explicit post-login redirect targets only; does not remap the normal
 *   health-insights landing (so reopening the app always follows the default home/insights flow).
 *   superclub-nav — Super Club tab / in-flow super-club routes only (plain Home navigation is not remapped).
 * @returns {{ page: string, updatePayload: boolean, payload: object | null }}
 */
export function resolvePageWithSuperclubLock(targetPage, mode = 'default-auth') {
  const { locked, payload } = readSuperclubPlaylistLock();
  if (!locked || !payload) {
    return { page: targetPage, updatePayload: false, payload: null };
  }

  if (mode === 'superclub-nav') {
    const branch = new Set(['super-club', 'super-club-early-access', 'super-club-playlist-confirm']);
    if (branch.has(targetPage)) {
      return { page: 'super-club-playlist-confirm', updatePayload: true, payload };
    }
    return { page: targetPage, updatePayload: false, payload: null };
  }

  /* Only remap explicit Superclub routes from URL/deep-link — not the default session landing. */
  const authLandings = new Set(['super-club', 'super-club-early-access', 'super-club-playlist-confirm']);
  if (authLandings.has(targetPage)) {
    return { page: 'super-club-playlist-confirm', updatePayload: true, payload };
  }
  return { page: targetPage, updatePayload: false, payload: null };
}
