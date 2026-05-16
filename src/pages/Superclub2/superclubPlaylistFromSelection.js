import imgPaddle2 from '../../images/Superclub2/Paddle 2.svg';
import imgCycling from '../../images/Superclub2/Cycling.svg';
import imgRunning from '../../images/Superclub2/Running.svg';
import imgBadminton from '../../images/Superclub2/Badminton.svg';
import imgYoga from '../../images/Superclub2/Yoga2.svg';
import imgPilates from '../../images/Superclub2/Pilates.svg';
import imgGym from '../../images/Superclub2/Gym.svg';
import imgFootball from '../../images/Superclub2/Football.svg';
import imgCricket from '../../images/Superclub2/Cricket.svg';
import imgMeditation from '../../images/Superclub2/Meditation.svg';
import { SPORT_CHIPS } from './superclubEarlyAccessSports';

/** Visual skins cycle like Figma tiles (4558:17391). */
const SKINS = ['violet', 'mint', 'fitness', 'performance'];

const META = {
  pickleball: { category: 'RACKET', subtitle: 'Social • Outdoor', image: imgPaddle2 },
  padel: { category: 'RACKET', subtitle: 'Indoor Motion', image: imgPaddle2 },
  calisthenics: { category: 'FITNESS', subtitle: 'Bodyweight • Skill', image: imgGym },
  functional: { category: 'FITNESS', subtitle: '50 Mins • Functional', image: imgFootball },
  pilates: { category: 'WELLNESS', subtitle: '30 Mins • Hybrid', image: imgPilates },
  hyrox: { category: 'PERFORMANCE', subtitle: '50 Mins • Intense', image: imgCycling },
  football: { category: 'TEAM', subtitle: 'Field • Group', image: imgFootball },
  running: { category: 'CARDIO', subtitle: 'Outdoor • Clubs', image: imgRunning },
  cycling: { category: 'CARDIO', subtitle: 'Outdoor • Ride', image: imgCycling },
  yoga: { category: 'MINDFULNESS', subtitle: 'Flow • Restore', image: imgYoga },
  badminton: { category: 'RACKET', subtitle: 'Indoor Motion', image: imgBadminton },
  cricket: { category: 'TEAM', subtitle: 'Turf • Social', image: imgCricket },
  other: { category: 'YOU', subtitle: 'Your pick', image: imgMeditation },
};

/**
 * @param {{ sportIds: string[], otherSelected?: boolean, otherNote?: string }} payload
 * @returns {Array<{ id: string, title: string, category: string, subtitle: string, image: string, skin: string, userSelected: boolean }>}
 */
export const PLAYLIST_FAN_TILE_MAX = 4;

function shuffleIds(ids) {
  const list = [...ids];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/** Random sport chip ids not already chosen (stable chip order when merged). */
function pickRandomFillSportIds(selectedIds, count) {
  if (count <= 0) {
    return [];
  }
  const pool = SPORT_CHIPS.map((c) => c.id).filter((id) => !selectedIds.includes(id));
  const picked = new Set(shuffleIds(pool).slice(0, Math.min(count, pool.length)));
  return SPORT_CHIPS.map((c) => c.id).filter((id) => picked.has(id));
}

function sportCardFromId(id, skinIndex, userSelected) {
  const chip = SPORT_CHIPS.find((c) => c.id === id);
  const m = META[id] || META.padel;
  return {
    id,
    title: chip?.label || id,
    category: m.category,
    subtitle: m.subtitle,
    image: m.image,
    skin: SKINS[skinIndex % SKINS.length],
    userSelected,
  };
}

export function buildPlaylistCardsFromSelection(payload) {
  const selectedSportIds = Array.isArray(payload?.sportIds) ? payload.sportIds : [];
  const otherNote = String(payload?.otherNote || '').trim();
  const includeOther = Boolean(payload?.otherSelected) || otherNote.length > 0;

  const userSportIds = SPORT_CHIPS.map((c) => c.id).filter((id) => selectedSportIds.includes(id));
  const userPickCount = userSportIds.length + (includeOther ? 1 : 0);

  let orderedSportIds = [...userSportIds];

  if (userPickCount === 0) {
    orderedSportIds = SPORT_CHIPS.slice(0, PLAYLIST_FAN_TILE_MAX).map((c) => c.id);
  } else if (userPickCount < PLAYLIST_FAN_TILE_MAX) {
    const fillersNeeded = PLAYLIST_FAN_TILE_MAX - userPickCount;
    orderedSportIds = [...orderedSportIds, ...pickRandomFillSportIds(orderedSportIds, fillersNeeded)];
  }

  const userSportSet = new Set(userSportIds);
  const cards = orderedSportIds.map((id, i) => sportCardFromId(id, i, userSportSet.has(id)));

  if (includeOther) {
    const m = META.other;
    cards.push({
      id: 'other',
      title: otherNote || 'Other',
      category: m.category,
      subtitle: otherNote ? 'As you specified' : 'Your pick',
      image: m.image,
      skin: SKINS[cards.length % SKINS.length],
      userSelected: true,
    });
  }

  return cards;
}

/** Fan playlist: show every built card (no dropping user picks when they chose 4+). */
export function pickPlaylistCardsForFan(cards) {
  return Array.isArray(cards) ? cards : [];
}
