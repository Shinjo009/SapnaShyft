/**
 * English ordinals for whole-number ranks (e.g. 1 → "1st", 72 → "72nd", 11 → "11th").
 * @param {number|string} n
 * @returns {string}
 */
export function formatOrdinal(n) {
  const i = Math.floor(Number(n));
  if (!Number.isFinite(i)) {
    return `${n}`;
  }
  const abs = Math.abs(i);
  const teenBand = abs % 100;
  if (teenBand >= 11 && teenBand <= 13) {
    return `${i}th`;
  }
  switch (abs % 10) {
    case 1:
      return `${i}st`;
    case 2:
      return `${i}nd`;
    case 3:
      return `${i}rd`;
    default:
      return `${i}th`;
  }
}
