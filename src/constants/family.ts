/** Fixed family competition profiles. Spelling: Lyla (not Lila). */

export type FamilyProfileId = 'matt' | 'lyla' | 'ken' | 'mum';

export type CompetitionGameId = 'countries' | 'horses' | 'ken_soon' | 'mum_soon';

export type FamilyProfileDef = {
  id: FamilyProfileId;
  name: string;
  emoji: string;
  color: string;
  /** Official competition subject for this person */
  officialGameId: CompetitionGameId;
  officialLabel: string;
  /** Whether their official game is playable yet */
  officialReady: boolean;
};

export const FAMILY_PROFILES: FamilyProfileDef[] = [
  {
    id: 'matt',
    name: 'Matt',
    emoji: '🌍',
    color: '#3D5A80',
    officialGameId: 'countries',
    officialLabel: 'Countries',
    officialReady: true,
  },
  {
    id: 'lyla',
    name: 'Lyla',
    emoji: '🐴',
    color: '#C4A35A',
    officialGameId: 'horses',
    officialLabel: 'Horses',
    officialReady: true,
  },
  {
    id: 'ken',
    name: 'Ken',
    emoji: '🎮',
    color: '#5B9CF5',
    officialGameId: 'ken_soon',
    officialLabel: 'Coming soon',
    officialReady: false,
  },
  {
    id: 'mum',
    name: 'Mum',
    emoji: '✨',
    color: '#C77DFF',
    officialGameId: 'mum_soon',
    officialLabel: 'Coming soon',
    officialReady: false,
  },
];

export const FAMILY_BY_ID: Record<FamilyProfileId, FamilyProfileDef> = Object.fromEntries(
  FAMILY_PROFILES.map((p) => [p.id, p])
) as Record<FamilyProfileId, FamilyProfileDef>;

export function isFamilyProfileId(id: string): id is FamilyProfileId {
  return id === 'matt' || id === 'lyla' || id === 'ken' || id === 'mum';
}

/** Modes that count toward Matt's Countries official subject */
export const COUNTRIES_OFFICIAL_MODES = ['capitals', 'cities', 'facts'] as const;
