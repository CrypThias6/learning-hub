import { CONTINENT_ORDER } from '../constants/defaults';
import { citiesInSection, countriesInSection, geoData } from './data';
import { LearnedFlags, Settings } from '../types/game';

export function sectionLearnedPercent(sectionId: string, learned: LearnedFlags): number {
  const cities = citiesInSection(sectionId);
  if (!cities.length) return 0;
  let n = 0;
  for (const c of cities) {
    if (learned.cities[c.id] || (c.role === 'capital' && learned.capitals[c.countryId])) n++;
  }
  return n / cities.length;
}

export function isContinentUnlocked(
  _continentId: string,
  _learned: LearnedFlags,
  settings: Settings
): boolean {
  if (settings.freeTravel !== false) return true;
  return true;
}

export function unlockedContinents(learned: LearnedFlags, settings: Settings): string[] {
  return CONTINENT_ORDER.filter((id) => isContinentUnlocked(id, learned, settings));
}

export function citiesLearnedCount(
  learned: LearnedFlags,
  sectionId?: string
): { learned: number; total: number } {
  const list =
    !sectionId || sectionId === 'world' || sectionId === 'unlocked_world'
      ? geoData.cities
      : citiesInSection(sectionId);
  let n = 0;
  for (const c of list) {
    if (learned.cities[c.id] || (c.role === 'capital' && learned.capitals[c.countryId])) n++;
  }
  return { learned: n, total: list.length };
}

export function sectionProgressLabel(sectionId: string, learned: LearnedFlags): string {
  const { learned: L, total } = citiesLearnedCount(learned, sectionId);
  return `${L}/${total} learned`;
}

export function countriesCountInSection(sectionId: string): number {
  return countriesInSection(sectionId).length;
}
