import { City, Country, GeoData, Section } from '../types/game';

const raw = require('../../assets/data/world_geo_game.json') as GeoData;

export const geoData: GeoData = raw;

const countryById = new Map<string, Country>();
const cityById = new Map<string, City>();
const sectionById = new Map<string, Section>();

for (const s of geoData.sections) sectionById.set(s.id, s);
for (const c of geoData.countries) countryById.set(c.id, c);
for (const c of geoData.cities) cityById.set(c.id, c);

export function getCountry(id: string): Country | undefined {
  return countryById.get(id);
}
export function getCity(id: string): City | undefined {
  return cityById.get(id);
}
export function getSection(id: string): Section | undefined {
  return sectionById.get(id);
}

export function getTopSections(): Section[] {
  return geoData.sections.filter((s) => s.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getSubsections(parentId: string): Section[] {
  return geoData.sections
    .filter((s) => s.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function countriesInSection(sectionId: string): Country[] {
  if (sectionId === 'world' || sectionId === 'unlocked_world') {
    return geoData.countries;
  }
  const sec = sectionById.get(sectionId);
  if (!sec) return [];
  if (sec.parentId === null) {
    return geoData.countries.filter(
      (c) =>
        c.parentSectionId === sectionId ||
        c.continent.toLowerCase().replace(/\s+/g, '_') === sectionId ||
        c.sectionId === sectionId ||
        c.sectionId.startsWith(sectionId + '_')
    );
  }
  return geoData.countries.filter((c) => c.sectionId === sectionId);
}

export function citiesInSection(sectionId: string): City[] {
  const countries = countriesInSection(sectionId);
  const ids = new Set(countries.map((c) => c.id));
  return geoData.cities.filter((c) => ids.has(c.countryId));
}

export function citiesForCountry(countryId: string): City[] {
  const country = countryById.get(countryId);
  if (!country) return [];
  return country.cityIds.map((id) => cityById.get(id)!).filter(Boolean);
}

export function getCapital(country: Country): City | undefined {
  return cityById.get(country.capitalCityId);
}

export function parentContinentId(sectionId: string): string {
  const sec = sectionById.get(sectionId);
  if (!sec) return sectionId;
  return sec.parentId ?? sec.id;
}
