import AsyncStorage from '@react-native-async-storage/async-storage';
import { FamilyProfileId, isFamilyProfileId } from '../constants/family';
import { CompetitionRun } from './competition';

const KEYS = {
  selectedProfile: '@wgg/familySelectedProfile',
  runs: '@wgg/competitionRuns',
};

export async function loadSelectedFamilyProfile(): Promise<FamilyProfileId | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.selectedProfile);
    if (raw && isFamilyProfileId(raw)) return raw;
    return null;
  } catch {
    return null;
  }
}

export async function saveSelectedFamilyProfile(id: FamilyProfileId): Promise<void> {
  await AsyncStorage.setItem(KEYS.selectedProfile, id);
}

export async function clearSelectedFamilyProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.selectedProfile);
}

export async function loadCompetitionRuns(): Promise<CompetitionRun[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.runs);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r) =>
        r &&
        typeof r.id === 'string' &&
        isFamilyProfileId(r.profileId) &&
        typeof r.gameId === 'string' &&
        typeof r.percent === 'number' &&
        typeof r.score === 'number' &&
        typeof r.total === 'number' &&
        typeof r.at === 'string' &&
        typeof r.official === 'boolean'
    ) as CompetitionRun[];
  } catch {
    return [];
  }
}

export async function saveCompetitionRuns(runs: CompetitionRun[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.runs, JSON.stringify(runs.slice(-500)));
}

export function makeRunId(): string {
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
