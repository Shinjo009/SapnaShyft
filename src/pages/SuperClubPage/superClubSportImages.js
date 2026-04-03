import cricketImg from '../../images/Superclub/cricket.png';
import cyclingImg from '../../images/Superclub/Cycling.png';
import badmintonImg from '../../images/Superclub/badminton.png';
import basketballImg from '../../images/Superclub/basketball.png';
import footballImg from '../../images/Superclub/football.png';
import pickleballImg from '../../images/Superclub/pickelball.png';
import runningImg from '../../images/Superclub/running.png';
import swimmingImg from '../../images/Superclub/swimming.png';
import tableTennisImg from '../../images/Superclub/table tennis.png';
import tennisImg from '../../images/Superclub/tennis.png';
import volleyballImg from '../../images/Superclub/vollyball.png';
import yogaImg from '../../images/Superclub/yoga.png';

/**
 * `image` = full-card PNG (rounded art + panel). Button fills 142×182 with cover + label overlaid at bottom.
 * Carousel order: Cricket & Cycling first (design reference), then remaining sports A–Z by label.
 */
export const SUPER_CLUB_SPORTS = [
  { id: 'cricket', name: 'Cricket', image: cricketImg },
  { id: 'cycling', name: 'Cycling', image: cyclingImg },
  { id: 'badminton', name: 'Badminton', image: badmintonImg },
  { id: 'basketball', name: 'Basketball', image: basketballImg },
  { id: 'football', name: 'Football', image: footballImg },
  { id: 'pickleball', name: 'Pickleball', image: pickleballImg },
  { id: 'running', name: 'Running', image: runningImg },
  { id: 'swimming', name: 'Swimming', image: swimmingImg },
  { id: 'table-tennis', name: 'Table Tennis', image: tableTennisImg },
  { id: 'tennis', name: 'Tennis', image: tennisImg },
  { id: 'volleyball', name: 'Volleyball', image: volleyballImg },
  { id: 'yoga', name: 'Yoga', image: yogaImg },
];

/** Preserve order of `ids` when resolving to sport objects. */
export function getSuperClubSportsByIds(ids) {
  if (!ids?.length) return [];
  const byId = new Map(SUPER_CLUB_SPORTS.map((s) => [s.id, s]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}
