import { Settings } from '../types/game';

export const CONTINENT_ORDER = [
  'world',
  'oceania',
  'asia',
  'africa',
  'europe',
  'north_america',
  'south_america',
  'custom',
] as const;

export const SECTION_BOUNDS: Record<
  string,
  { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }
> = {
  oceania: { latitude: -18, longitude: 160, latitudeDelta: 55, longitudeDelta: 80 },
  oceania_australia_nz: { latitude: -32, longitude: 145, latitudeDelta: 30, longitudeDelta: 50 },
  oceania_melanesia: { latitude: -12, longitude: 162, latitudeDelta: 20, longitudeDelta: 40 },
  oceania_polynesia_micronesia: {
    latitude: -5,
    longitude: 175,
    latitudeDelta: 35,
    longitudeDelta: 60,
  },
  asia: { latitude: 30, longitude: 90, latitudeDelta: 55, longitudeDelta: 80 },
  asia_east: { latitude: 35, longitude: 120, latitudeDelta: 30, longitudeDelta: 40 },
  asia_southeast: { latitude: 8, longitude: 115, latitudeDelta: 30, longitudeDelta: 35 },
  asia_south: { latitude: 22, longitude: 80, latitudeDelta: 30, longitudeDelta: 35 },
  asia_central: { latitude: 42, longitude: 68, latitudeDelta: 20, longitudeDelta: 30 },
  asia_west: { latitude: 28, longitude: 45, latitudeDelta: 25, longitudeDelta: 35 },
  africa: { latitude: 5, longitude: 20, latitudeDelta: 70, longitudeDelta: 60 },
  africa_north: { latitude: 28, longitude: 15, latitudeDelta: 25, longitudeDelta: 45 },
  africa_west: { latitude: 10, longitude: -5, latitudeDelta: 25, longitudeDelta: 35 },
  africa_central: { latitude: 0, longitude: 20, latitudeDelta: 25, longitudeDelta: 30 },
  africa_east: { latitude: 0, longitude: 38, latitudeDelta: 35, longitudeDelta: 35 },
  africa_south: { latitude: -22, longitude: 28, latitudeDelta: 25, longitudeDelta: 30 },
  europe: { latitude: 54, longitude: 15, latitudeDelta: 35, longitudeDelta: 50 },
  europe_west: { latitude: 50, longitude: 5, latitudeDelta: 20, longitudeDelta: 25 },
  europe_north: { latitude: 60, longitude: 15, latitudeDelta: 20, longitudeDelta: 40 },
  europe_south: { latitude: 42, longitude: 12, latitudeDelta: 15, longitudeDelta: 30 },
  europe_east: { latitude: 52, longitude: 40, latitudeDelta: 25, longitudeDelta: 50 },
  north_america: { latitude: 30, longitude: -90, latitudeDelta: 50, longitudeDelta: 70 },
  na_canada_us: { latitude: 40, longitude: -100, latitudeDelta: 40, longitudeDelta: 60 },
  na_mexico_central: { latitude: 18, longitude: -90, latitudeDelta: 25, longitudeDelta: 35 },
  na_caribbean: { latitude: 18, longitude: -70, latitudeDelta: 20, longitudeDelta: 30 },
  south_america: { latitude: -20, longitude: -60, latitudeDelta: 55, longitudeDelta: 45 },
  sa_andes: { latitude: -5, longitude: -72, latitudeDelta: 30, longitudeDelta: 25 },
  sa_brazil_guianas: { latitude: -8, longitude: -50, latitudeDelta: 35, longitudeDelta: 30 },
  sa_south_cone: { latitude: -35, longitude: -62, latitudeDelta: 30, longitudeDelta: 25 },
  world: { latitude: 10, longitude: 20, latitudeDelta: 120, longitudeDelta: 160 },
  custom: { latitude: 10, longitude: 20, latitudeDelta: 120, longitudeDelta: 160 },
  custom_pop50: { latitude: 10, longitude: 20, latitudeDelta: 120, longitudeDelta: 160 },
  custom_area50: { latitude: 10, longitude: 20, latitudeDelta: 120, longitudeDelta: 160 },
  custom_small50: { latitude: 10, longitude: 20, latitudeDelta: 120, longitudeDelta: 160 },
  custom_islands: { latitude: 10, longitude: 20, latitudeDelta: 120, longitudeDelta: 160 },
  custom_landlocked: { latitude: 10, longitude: 20, latitudeDelta: 120, longitudeDelta: 160 },
};

export const DEFAULT_SETTINGS: Settings = {
  mode: 'capitals',
  sectionId: 'oceania',
  difficulty: 'explorer',
  answerStyle: 'auto',
  timer: 'off',
  freeTravel: true,
  lockExtraCities: false,
  showCityNames: 'after',
  showFactsAfterAnswer: true,
  questionsPerRound: 10,
  sound: true,
  colourBlindMap: false,
  profileName: 'Matt',
  activeProfileId: 'matt',
};

export function emptyLearned() {
  return { capitals: {}, cities: {}, facts: {}, seenCities: {} };
}

export function emptyStats() {
  return {
    overallCorrect: 0,
    overallAnswered: 0,
    capitalsCorrect: 0,
    capitalsAnswered: 0,
    citiesCorrect: 0,
    citiesAnswered: 0,
    factsCorrect: 0,
    factsAnswered: 0,
    locateCorrect: 0,
    locateAnswered: 0,
    locateDistanceSum: 0,
    continentStats: {},
    bestStreak: 0,
    sectionsCompleted: [],
    fastestClears: {},
  };
}
