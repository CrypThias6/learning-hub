import { Alert, Platform } from 'react-native';

export type ContentFlag = {
  ts: string;
  countryId: string;
  cityId?: string;
  screen: string;
  note?: string;
};

/** Prompt for optional note, then append a content flag (server + local fallback). */
export function requestContentFlag(args: {
  countryId: string;
  cityId?: string;
  screen: string;
}): void {
  const send = (note?: string) => {
    void submitFlag({
      ts: new Date().toISOString(),
      countryId: args.countryId,
      cityId: args.cityId,
      screen: args.screen,
      note: note?.trim() || undefined,
    });
  };

  // Web: window.prompt works in Safari
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.prompt === 'function') {
    const note = window.prompt('Optional note for this flag (Cancel to abort):');
    if (note === null) return;
    send(note);
    return;
  }

  // iOS Alert.prompt
  const promptFn = (Alert as { prompt?: typeof Alert.prompt }).prompt;
  if (typeof promptFn === 'function') {
    promptFn(
      'Request change',
      'Short note (optional)',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: (text?: string) => send(text) },
      ],
      'plain-text'
    );
    return;
  }

  Alert.alert('Request change', 'Flag this content?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Flag', onPress: () => send() },
  ]);
}

async function submitFlag(flag: ContentFlag): Promise<void> {
  const line = JSON.stringify(flag);

  try {
    if (typeof localStorage !== 'undefined') {
      const key = 'wgg/content-flags';
      const prev = localStorage.getItem(key);
      localStorage.setItem(key, prev ? `${prev}\n${line}` : line);
    }
  } catch {
    /* ignore */
  }

  try {
    const res = await fetch('/api/content-flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: line,
    });
    if (res.ok) {
      Alert.alert('Thanks', 'Flag saved.');
      return;
    }
  } catch {
    /* fall through */
  }

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    try {
      const blob = new Blob([line + '\n'], { type: 'application/x-ndjson' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-flag-${flag.countryId}-${Date.now()}.jsonl`;
      a.click();
      URL.revokeObjectURL(url);
      Alert.alert('Saved locally', 'Flag downloaded (server unreachable).');
      return;
    } catch {
      /* ignore */
    }
  }
  Alert.alert('Flagged', 'Saved on this device.');
}
