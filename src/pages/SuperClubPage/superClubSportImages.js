import cricketGif from '../../images/Superclub/gif/cricket.gif';
import cyclingGif from '../../images/Superclub/gif/cycling.gif';
import badmintonGif from '../../images/Superclub/gif/badminton.gif';
import basketballGif from '../../images/Superclub/gif/basketball.gif';
import footballGif from '../../images/Superclub/gif/football.gif';
import pickleballGif from '../../images/Superclub/gif/pickelball.gif';
import runningGif from '../../images/Superclub/gif/running.gif';
import swimmingGif from '../../images/Superclub/gif/swimming.gif';
import tableTennisGif from '../../images/Superclub/gif/table tennis.gif';
import tennisGif from '../../images/Superclub/gif/tennis.gif';
import volleyballGif from '../../images/Superclub/gif/vollyball.gif';
import yogaGif from '../../images/Superclub/gif/yoga.gif';

/**
 * `image` = sport GIF shown centered on the swipe card (card gradient is CSS on `.super-club-v1__card`).
 * Carousel order: Cricket & Cycling first (design reference), then remaining sports A–Z by label.
 */
export const SUPER_CLUB_SPORTS = [
  { id: 'cricket', name: 'Cricket', image: cricketGif, largeCardGif: true },
  { id: 'cycling', name: 'Cycling', image: cyclingGif, largeCardGif: true },
  { id: 'badminton', name: 'Badminton', image: badmintonGif },
  { id: 'basketball', name: 'Basketball', image: basketballGif },
  { id: 'football', name: 'Football', image: footballGif },
  { id: 'pickleball', name: 'Pickleball', image: pickleballGif },
  { id: 'running', name: 'Running', image: runningGif, largeCardGif: true },
  { id: 'swimming', name: 'Swimming', image: swimmingGif },
  { id: 'table-tennis', name: 'Table Tennis', image: tableTennisGif, largeCardGif: true },
  { id: 'tennis', name: 'Tennis', image: tennisGif },
  { id: 'volleyball', name: 'Volleyball', image: volleyballGif },
  { id: 'yoga', name: 'Yoga', image: yogaGif, xlCardGif: true },
];

/** Preserve order of `ids` when resolving to sport objects. */
export function getSuperClubSportsByIds(ids) {
  if (!ids?.length) return [];
  const byId = new Map(SUPER_CLUB_SPORTS.map((s) => [s.id, s]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}
