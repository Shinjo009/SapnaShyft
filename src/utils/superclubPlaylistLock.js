const LOCK_KEY = 'ss_superclub_playlist_flow_done';
const PAYLOAD_KEY = 'ss_superclub_playlist_payload';

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
    if (window.localStorage.getItem(LOCK_KEY) !== '1') {
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
    return {
      locked: true,
      payload: {
        sportIds: payload.sportIds,
        otherSelected: Boolean(payload.otherSelected),
        otherNote: String(payload.otherNote || '').trim(),
      },
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
 *   default-auth — session restore / OTP / account-pick defaults (health-insights → confirm when locked).
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

  const authLandings = new Set([
    'health-insights',
    'super-club',
    'super-club-early-access',
    'super-club-playlist-confirm',
  ]);
  if (authLandings.has(targetPage)) {
    return { page: 'super-club-playlist-confirm', updatePayload: true, payload };
  }
  return { page: targetPage, updatePayload: false, payload: null };
}
