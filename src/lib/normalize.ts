/** Case-insensitive trim, fold accents, strip punctuation for answer matching. */
export function normalizeAnswer(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`‘’]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 99;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function answersMatch(input: string, accepted: string[]): boolean {
  const n = normalizeAnswer(input);
  if (!n) return false;
  for (const a of accepted) {
    const t = normalizeAnswer(a);
    if (n === t) return true;
    // single-word soft spelling
    const nw = n.split(' ');
    const tw = t.split(' ');
    if (nw.length === 1 && tw.length === 1 && editDistance(n, t) <= 2) return true;
    if (nw.length === tw.length && nw.length <= 3) {
      let ok = true;
      for (let i = 0; i < nw.length; i++) {
        if (editDistance(nw[i], tw[i]) > 1) {
          ok = false;
          break;
        }
      }
      if (ok) return true;
    }
  }
  return false;
}

export function factKeyMatch(input: string, factKey: string): boolean {
  const n = normalizeAnswer(input);
  const tokens = factKey.split(/\s+/).map((t) => normalizeAnswer(t)).filter(Boolean);
  if (!tokens.length) return false;
  return tokens.every((t) => n.includes(t));
}

/** Haversine distance in km */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}
