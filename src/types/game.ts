export type Difficulty = 'scout' | 'explorer' | 'cartographer';
export type AnswerStyle = 'multiple' | 'type' | 'tap';
export type GameMode = 'learn' | 'capitals' | 'cities' | 'facts' | 'locate' | 'mixed';
export type TimerSetting = 'off' | '15' | '30';
export type ShowNames = 'off' | 'after' | 'always';
export type QuestionsPerRound = 10 | 20 | 40 | 'full';

export interface Section {
  id: string;
  label: string;
  parentId: string | null;
  sortOrder: number;
  unlockAfterId: string | null;
  mapColor: string;
}

export interface Country {
  id: string;
  iso2: string;
  iso3: string;
  name: string;
  aliases: string[];
  sectionId: string;
  continent: string;
  parentSectionId?: string;
  capitalCityId: string;
  hook: string;
  /** Short punchy fact cards for Facts mode (split from hook). */
  facts?: string[];
  hookKey?: string;
  cityIds: string[];
}

export interface City {
  id: string;
  name: string;
  aliases: string[];
  countryId: string;
  role: string;
  capitalKind: string | null;
  sectionId: string;
  lat: number;
  lng: number;
  sizeBand: string;
  fact: string;
  /** Short punchy fact cards for Facts mode (split from fact). */
  facts?: string[];
  factKey: string;
  unlockAfterCityId: string | null;
}

export interface GeoData {
  meta: {
    version: string;
    countrySet: string;
    countryCount: number;
    cityCount: number;
    attribution: string;
    simplemapsUrl?: string;
  };
  sections: Section[];
  countries: Country[];
  cities: City[];
  quizBanks: {
    countryAliases?: Record<string, string[]>;
    capitalAliases?: Record<string, string[]>;
  };
}

export interface Settings {
  mode: GameMode;
  sectionId: string;
  difficulty: Difficulty;
  answerStyle: AnswerStyle | 'auto';
  timer: TimerSetting;
  freeTravel: boolean;
  lockExtraCities: boolean;
  showCityNames: ShowNames;
  showFactsAfterAnswer: boolean;
  questionsPerRound: QuestionsPerRound;
  sound: boolean;
  colourBlindMap: boolean;
  profileName: string;
  activeProfileId: string;
}

export interface LearnedFlags {
  capitals: Record<string, boolean>; // countryId
  cities: Record<string, boolean>; // cityId
  facts: Record<string, boolean>; // cityId or countryId for hook
  seenCities: Record<string, boolean>; // cityId — seen in Learn/Cities
}

export interface ProfileStats {
  overallCorrect: number;
  overallAnswered: number;
  capitalsCorrect: number;
  capitalsAnswered: number;
  citiesCorrect: number;
  citiesAnswered: number;
  factsCorrect: number;
  factsAnswered: number;
  locateCorrect: number;
  locateAnswered: number;
  locateDistanceSum: number;
  continentStats: Record<string, { correct: number; answered: number }>;
  bestStreak: number;
  sectionsCompleted: string[];
  fastestClears: Record<string, number>; // sectionId -> seconds
}

export interface Profile {
  id: string;
  name: string;
  createdAt: string;
  learned: LearnedFlags;
  stats: ProfileStats;
  lastMode: GameMode;
  lastSectionId: string;
}

export interface LeaderboardEntry {
  id: string;
  profileId: string;
  profileName: string;
  category: string;
  score: number;
  scoreLabel: string;
  mode: GameMode | 'all';
  difficulty: Difficulty;
  sectionId: string;
  date: string;
}

export interface QuestionResult {
  correct: boolean;
  firstTry: boolean;
  points: number;
  distanceKm?: number;
  revealed?: boolean;
}

export type ChallengeKind =
  | 'capital'
  | 'city_name'
  | 'city_country'
  | 'city_is_capital'
  | 'city_largest'
  | 'fact'
  | 'locate';

export interface ChallengeQuestion {
  kind: ChallengeKind;
  prompt: string;
  countryId?: string;
  cityId?: string;
  correctAnswers: string[];
  correctId?: string;
  options?: string[];
  answerStyle: AnswerStyle;
  factText?: string;
  /** Study cards for Facts mode. */
  facts?: string[];
  /** @deprecated Wave 3+ Facts mode no longer uses distractors. */
  factOptions?: string[];
  lat?: number;
  lng?: number;
  locateRadiusKm?: number;
  note?: string;
}
