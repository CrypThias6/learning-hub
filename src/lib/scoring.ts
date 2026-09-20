import { Difficulty, QuestionResult } from '../types/game';
import { answersMatch, distanceKm, factKeyMatch, normalizeAnswer } from './normalize';
import { ChallengeQuestion } from '../types/game';
import { citiesForCountry, getCity, getCountry } from './data';

export function scoreTextAnswer(
  q: ChallengeQuestion,
  input: string,
  attempt: number, // 1 or 2
  revealed: boolean,
  streak: number,
  secondsLeft?: number
): QuestionResult {
  let correct = false;
  if (q.kind === 'fact' && q.answerStyle === 'type' && q.note?.startsWith('Key:')) {
    const key = q.note.replace(/^Key:\s*/, '');
    correct = factKeyMatch(input, key) || answersMatch(input, q.correctAnswers);
  } else if (q.kind === 'city_is_capital') {
    const n = normalizeAnswer(input);
    correct = q.correctAnswers.includes(n) || answersMatch(input, q.correctAnswers.map((a) => a));
  } else {
    correct = answersMatch(input, q.correctAnswers);
  }

  return finalize(correct, attempt, revealed, streak, secondsLeft);
}

export function scoreChoice(
  q: ChallengeQuestion,
  choice: string,
  attempt: number,
  revealed: boolean,
  streak: number,
  secondsLeft?: number
): QuestionResult {
  let correct = false;
  if (q.kind === 'city_is_capital') {
    correct = normalizeAnswer(choice) === normalizeAnswer(q.correctAnswers[0]);
  } else if (q.kind === 'fact') {
    correct = normalizeAnswer(choice) === normalizeAnswer(q.correctAnswers[0]);
  } else {
    correct = answersMatch(choice, q.correctAnswers);
  }
  return finalize(correct, attempt, revealed, streak, secondsLeft);
}

/** Role-based perfect radius (km) before difficulty scaling. */
export function baseLocateRadiusKm(role: string, sizeBand: string, cityCountInCountry: number): number {
  const band = (sizeBand || '').toLowerCase();
  const r = (role || '').toLowerCase();
  if (cityCountInCountry <= 1 || band.includes('island') || band.includes('atoll')) return 40;
  if (r === 'capital') return 80;
  if (
    r === 'largest' ||
    band.includes('metro') ||
    band.includes('5m') ||
    band.includes('10m') ||
    band.includes('15m') ||
    band.includes('19m') ||
    band.includes('20m') ||
    band.includes('22m') ||
    band.includes('25m') ||
    band.includes('huge') ||
    band.includes('1.5m') ||
    band.includes('2m') ||
    band.includes('3m') ||
    band.includes('4m') ||
    band.includes('6m') ||
    band.includes('7m') ||
    band.includes('8m') ||
    band.includes('9m') ||
    band.includes('13m')
  ) {
    return 120;
  }
  return 80;
}

type CountryBBox = { minLat: number; maxLat: number; minLng: number; maxLng: number };

/** Bounding box from all cities in a country, with degree padding. */
export function countryBBoxFromCities(countryId: string, padDeg = 1.5): CountryBBox | null {
  const cities = citiesForCountry(countryId);
  if (!cities.length) return null;
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;
  for (const c of cities) {
    minLat = Math.min(minLat, c.lat);
    maxLat = Math.max(maxLat, c.lat);
    minLng = Math.min(minLng, c.lng);
    maxLng = Math.max(maxLng, c.lng);
  }
  // Single-city / tiny countries: widen pad
  if (cities.length === 1) padDeg = Math.max(padDeg, 2.5);
  return {
    minLat: minLat - padDeg,
    maxLat: maxLat + padDeg,
    minLng: minLng - padDeg,
    maxLng: maxLng + padDeg,
  };
}

function pointInBBox(lat: number, lng: number, box: CountryBBox): boolean {
  // Handle antimeridian simply: if box crosses 180, skip strict check (Kiribati etc.)
  if (box.maxLng - box.minLng > 180) {
    // wide box — use nearest same-country city threshold instead
    return false;
  }
  return lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng;
}

/** True if tap is "in country": bbox hit OR nearest city in same country within large threshold. */
export function isTapInCountry(lat: number, lng: number, countryId: string): boolean {
  const box = countryBBoxFromCities(countryId);
  if (box && pointInBBox(lat, lng, box)) return true;

  // Nearest-city-in-same-country within large threshold (NOT capital-distance proxy)
  const cities = citiesForCountry(countryId);
  if (!cities.length) return false;
  let nearest = Infinity;
  for (const c of cities) {
    nearest = Math.min(nearest, distanceKm(lat, lng, c.lat, c.lng));
  }
  // Large threshold only for same-country nearest city (handles elongated countries)
  const threshold = Math.max(400, cities.length <= 2 ? 350 : 500);
  return nearest <= threshold;
}

export function scoreLocate(
  q: ChallengeQuestion,
  lat: number,
  lng: number,
  streak: number,
  secondsLeft?: number
): QuestionResult {
  if (q.lat == null || q.lng == null) {
    return { correct: false, firstTry: true, points: 0, distanceKm: 9999 };
  }
  const d = distanceKm(lat, lng, q.lat, q.lng);
  const radius = q.locateRadiusKm ?? 80;
  let points = 0;

  if (d <= radius) {
    points = 100;
  } else {
    const city = q.cityId ? getCity(q.cityId) : undefined;
    const countryId = city?.countryId || q.countryId;
    if (countryId && getCountry(countryId) && isTapInCountry(lat, lng, countryId)) {
      points = 50;
    }
  }

  const streakBonus = streakBonusPoints(streak);
  const timerBonus = timerBonusPoints(secondsLeft);
  if (points >= 100) {
    return {
      correct: true,
      firstTry: true,
      points: 100 + streakBonus + timerBonus,
      distanceKm: d,
    };
  }
  return {
    correct: false,
    firstTry: true,
    points,
    distanceKm: d,
  };
}

function finalize(
  correct: boolean,
  attempt: number,
  revealed: boolean,
  streak: number,
  secondsLeft?: number
): QuestionResult {
  if (revealed) return { correct: false, firstTry: false, points: 0, revealed: true };
  if (!correct) return { correct: false, firstTry: attempt === 1, points: 0 };
  let points = attempt === 1 ? 100 : 60;
  points += streakBonusPoints(streak);
  points += timerBonusPoints(secondsLeft);
  return { correct: true, firstTry: attempt === 1, points };
}

export function streakBonusPoints(streakBeforeThisCorrect: number): number {
  const after = streakBeforeThisCorrect + 1;
  if (after <= 3) return 0;
  return Math.min(40, (after - 3) * 5);
}

export function timerBonusPoints(secondsLeft?: number): number {
  if (secondsLeft == null || secondsLeft <= 0) return 0;
  return Math.min(15, Math.floor(secondsLeft));
}

export function locateRadiusForDifficulty(base: number, d: Difficulty): number {
  if (d === 'scout') return base * 1.4;
  if (d === 'cartographer') return base * 0.7;
  return base;
}
