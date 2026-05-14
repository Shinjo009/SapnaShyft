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
 * @returns {Array<{ id: string, title: string, category: string, subtitle: string, image: string, skin: string }>}
 */
export function buildPlaylistCardsFromSelection(payload) {
  const sportIds = Array.isArray(payload?.sportIds) ? payload.sportIds : [];
  const otherSelected = Boolean(payload?.otherSelected);
  const otherNote = String(payload?.otherNote || '').trim();

  const order = SPORT_CHIPS.map((c) => c.id).filter((id) => sportIds.includes(id));
  const cards = order.map((id, i) => {
    const chip = SPORT_CHIPS.find((c) => c.id === id);
    const m = META[id] || META.padel;
    return {
      id,
      title: chip?.label || id,
      category: m.category,
      subtitle: m.subtitle,
      image: m.image,
      skin: SKINS[i % SKINS.length],
    };
  });

  if (otherSelected) {
    const m = META.other;
    const title = otherNote || 'Other';
    cards.push({
      id: 'other',
      title,
      category: m.category,
      subtitle: otherNote ? 'As you specified' : m.subtitle,
      image: m.image,
      skin: SKINS[cards.length % SKINS.length],
    });
  }

  return cards;
}
