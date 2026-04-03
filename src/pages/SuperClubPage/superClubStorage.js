const KEY_DONE = 'sapna_super_club_swipe_onboarding_done';
const KEY_LIKED = 'sapna_super_club_liked_sport_ids';

export function isSuperClubOnboardingComplete() {
  try {
    return window.localStorage.getItem(KEY_DONE) === '1';
  } catch {
    return false;
  }
}

/** Persists completion and ordered list of liked sport ids (may be empty). */
export function saveSuperClubOnboardingResult(likedSportIds) {
  try {
    window.localStorage.setItem(KEY_DONE, '1');
    window.localStorage.setItem(KEY_LIKED, JSON.stringify(likedSportIds));
  } catch {
    /* ignore quota / private mode */
  }
}

export function getSuperClubLikedSportIds() {
  try {
    const raw = window.localStorage.getItem(KEY_LIKED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/** Clears saved onboarding so Super Club page 1 always starts fresh on next visit. */
export function clearSuperClubOnboardingStorage() {
  try {
    window.localStorage.removeItem(KEY_DONE);
    window.localStorage.removeItem(KEY_LIKED);
  } catch {
    /* ignore */
  }
}
