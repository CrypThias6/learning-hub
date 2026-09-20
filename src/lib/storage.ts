import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, emptyLearned, emptyStats } from '../constants/defaults';
import { LeaderboardEntry, Profile, Settings } from '../types/game';

const KEYS = {
  settings: '@wgg/settings',
  profiles: '@wgg/profiles',
  leaderboard: '@wgg/leaderboard',
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(raw),
      freeTravel: true,
      lockExtraCities: false,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(s));
}

function defaultProfile(id = 'profile-1', name = 'Player 1'): Profile {
  return {
    id,
    name,
    createdAt: new Date().toISOString(),
    learned: emptyLearned(),
    stats: emptyStats(),
    lastMode: 'learn',
    lastSectionId: 'oceania',
  };
}

export async function loadProfiles(): Promise<Profile[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.profiles);
    if (!raw) {
      const p = [defaultProfile()];
      await AsyncStorage.setItem(KEYS.profiles, JSON.stringify(p));
      return p;
    }
    return JSON.parse(raw);
  } catch {
    return [defaultProfile()];
  }
}

export async function saveProfiles(profiles: Profile[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.profiles, JSON.stringify(profiles));
}

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    await AsyncStorage.removeItem(KEYS.leaderboard);
  } catch {
    /* ignore */
  }
  return [];
}

export async function saveLeaderboard(_entries: LeaderboardEntry[]): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.leaderboard);
  } catch {
    /* ignore */
  }
}
