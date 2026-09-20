import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { emptyLearned, emptyStats } from '../constants/defaults';
import { loadLeaderboard, loadProfiles, loadSettings, saveSettings } from '../lib/storage';
import { LeaderboardEntry, Profile, Settings } from '../types/game';

type GameContextValue = {
  ready: boolean;
  selectedFamilyId: string | null;
  activeProfile: Profile;
  leaderboard: LeaderboardEntry[];
  selectFamilyProfile: (id: string) => void;
};

const fallbackProfile: Profile = {
  id: 'profile-1',
  name: 'Player 1',
  createdAt: new Date(0).toISOString(),
  learned: emptyLearned(),
  stats: emptyStats(),
  lastMode: 'learn',
  lastSectionId: 'oceania',
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [loadedSettings, loadedProfiles, loadedLeaderboard] = await Promise.all([
        loadSettings(),
        loadProfiles(),
        loadLeaderboard(),
      ]);
      if (!alive) return;

      const firstProfile = loadedProfiles[0] ?? fallbackProfile;
      const selectedId =
        loadedProfiles.find((p) => p.id === loadedSettings.activeProfileId)?.id ?? firstProfile.id;

      setSettings(loadedSettings);
      setProfiles(loadedProfiles.length ? loadedProfiles : [firstProfile]);
      setLeaderboard(loadedLeaderboard);
      setSelectedFamilyId(selectedId);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === selectedFamilyId) ?? profiles[0] ?? fallbackProfile,
    [profiles, selectedFamilyId]
  );

  const selectFamilyProfile = useCallback(
    (id: string) => {
      setSelectedFamilyId(id);
      setSettings((prev) => {
        if (!prev) return prev;
        const next = { ...prev, activeProfileId: id };
        void saveSettings(next);
        return next;
      });
    },
    [setSelectedFamilyId]
  );

  const value = useMemo(
    () => ({ ready, selectedFamilyId, activeProfile, leaderboard, selectFamilyProfile }),
    [ready, selectedFamilyId, activeProfile, leaderboard, selectFamilyProfile]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
