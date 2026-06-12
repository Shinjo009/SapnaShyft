/**
 * Super Club grid tile backgrounds — warm the browser image cache before navigation.
 * Keeps URLs in one place so prefetch matches Superclub2Page imports.
 */
import imgPaddle2 from '../images/Superclub2/Paddle 2.svg';
import imgCycling from '../images/Superclub2/Cycling.svg';
import imgRunning from '../images/Superclub2/Running.svg';
import imgBadminton from '../images/Superclub2/Badminton2.svg';
import imgYoga from '../images/Superclub2/Yoga2.svg';
import imgPilates from '../images/Superclub2/Pilates.svg';
import imgGym from '../images/Superclub2/Gym.svg';
import imgFootball from '../images/Superclub2/Football.svg';
import imgCricket from '../images/Superclub2/Cricket (1).svg';
import imgMeditation from '../images/Superclub2/Meditation.svg';

export const SUPERCLUB2_TILE_IMAGE_URLS = Object.freeze([
  imgPaddle2,
  imgCycling,
  imgRunning,
  imgBadminton,
  imgYoga,
  imgPilates,
  imgGym,
  imgFootball,
  imgCricket,
  imgMeditation,
]);

let preloadPromise = null;

const warmImage = (src) => new Promise((resolve) => {
  if (!src) {
    resolve();
    return;
  }

  const img = new Image();
  img.decoding = 'async';
  const finish = () => resolve();
  img.onload = finish;
  img.onerror = finish;
  img.src = src;
});

/** Start downloading tile images (idempotent). */
export const preloadSuperclub2TileImages = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (!preloadPromise) {
    preloadPromise = Promise.all(
      SUPERCLUB2_TILE_IMAGE_URLS.map((src) => warmImage(src)),
    );
  }

  return preloadPromise;
};
