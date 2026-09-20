import {
  COUNTRIES_OFFICIAL_MODES,
  FAMILY_BY_ID,
  FamilyProfileId,
  CompetitionGameId,
  isFamilyProfileId,
} from '../constants/family';

export type { CompetitionGameId };
import { GameMode } from '../types/game';

export type CompetitionConfig = {
  started: boolean;
  startedAt: string | null;
};

export type CompetitionRun = {
  id: string;
  profileId: FamilyProfileId;
  gameId: CompetitionGameId;
  percent: number;
  score: number;
  total: number;
  at: string;
  official: boolean;
};

const bundled = require('../../assets/data/competition.json') as CompetitionConfig;

/** Bundled flag — flip in assets/data/competition.json and redeploy to start. */
export function getCompetitionConfig(): CompetitionConfig {
  return {
    started: Boolean(bundled?.started),
    startedAt: bundled?.startedAt ?? null,
  };
}

export function isCompetitionStarted(): boolean {
  return getCompetitionConfig().started === true;
}

export function gameIdForCountriesMode(mode: GameMode): CompetitionGameId | null {
  if ((COUNTRIES_OFFICIAL_MODES as readonly string[]).includes(mode)) return 'countries';
  return null;
}

/** Is this run on the player's official subject? (ignores competition gate) */
export function isOfficialSubject(
  profileId: string,
  gameId: CompetitionGameId
): boolean {
  if (!isFamilyProfileId(profileId)) return false;
  const def = FAMILY_BY_ID[profileId];
  return def.officialReady && def.officialGameId === gameId;
}

/**
 * Whether a completed session should be stored as official competition credit.
 * Requires: competition started + player's official ready game.
 */
export function shouldCountAsOfficial(
  profileId: string,
  gameId: CompetitionGameId
): boolean {
  return isCompetitionStarted() && isOfficialSubject(profileId, gameId);
}

export function runPercent(score: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((score / total) * 1000) / 10;
}

export type ProfileSeriesStats = {
  profileId: FamilyProfileId;
  runs: CompetitionRun[];
  latest: number | null;
  best: number | null;
  average: number | null;
};

export function statsForProfile(
  profileId: FamilyProfileId,
  allRuns: CompetitionRun[],
  officialOnly: boolean
): ProfileSeriesStats {
  const def = FAMILY_BY_ID[profileId];
  let runs = allRuns.filter(
    (r) => r.profileId === profileId && r.gameId === def.officialGameId
  );
  if (officialOnly) runs = runs.filter((r) => r.official);
  runs = [...runs].sort((a, b) => a.at.localeCompare(b.at));
  const percents = runs.map((r) => r.percent);
  const latest = percents.length ? percents[percents.length - 1] : null;
  const best = percents.length ? Math.max(...percents) : null;
  const average =
    percents.length
      ? Math.round((percents.reduce((s, n) => s + n, 0) / percents.length) * 10) / 10
      : null;
  return { profileId, runs, latest, best, average };
}
