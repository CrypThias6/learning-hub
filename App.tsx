import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { colors } from './src/constants/theme';

type Profile = { id: string; name: string; best: number; plays: number };
type Question = { country: string; correct: string; choices: string[] };

const QUESTIONS: Question[] = [
  { country: 'France', correct: 'Paris', choices: ['Paris', 'Lyon', 'Marseille', 'Nice'] },
  { country: 'Japan', correct: 'Tokyo', choices: ['Kyoto', 'Tokyo', 'Osaka', 'Nagoya'] },
  { country: 'Brazil', correct: 'Brasília', choices: ['São Paulo', 'Brasília', 'Rio de Janeiro', 'Salvador'] },
  { country: 'Australia', correct: 'Canberra', choices: ['Sydney', 'Melbourne', 'Canberra', 'Perth'] },
  { country: 'Canada', correct: 'Ottawa', choices: ['Toronto', 'Ottawa', 'Vancouver', 'Montreal'] },
];

const DEFAULT_PROFILES: Profile[] = [
  { id: 'p1', name: 'Player 1', best: 0, plays: 0 },
  { id: 'p2', name: 'Player 2', best: 0, plays: 0 },
];

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>(() => DEFAULT_PROFILES);
  const [profileId, setProfileId] = useState('p1');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [inRound, setInRound] = useState(false);
  const [finished, setFinished] = useState(false);
  const answerLockedRef = useRef(false);
  const gameInProgress = inRound && !finished;
  const hasQuestions = QUESTIONS.length > 0;

  const current = QUESTIONS[index];
  const leaderboard = useMemo(
    () => [...profiles].sort((a, b) => b.best - a.best || a.name.localeCompare(b.name)),
    [profiles]
  );

  useEffect(() => {
    answerLockedRef.current = false;
  }, [index, inRound]);

  const answer = (choice: string) => {
    if (!hasQuestions || !current || answerLockedRef.current) return;
    answerLockedRef.current = true;
    const nextScore = score + (choice === current.correct ? 1 : 0);
    if (index === QUESTIONS.length - 1) {
      setScore(nextScore);
      setFinished(true);
      setInRound(false);
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profileId ? { ...p, plays: p.plays + 1, best: Math.max(p.best, nextScore) } : p
        )
      );
      return;
    }
    setScore(nextScore);
    setIndex((v) => v + 1);
  };

  const reset = () => {
    setIndex(0);
    setScore(0);
    setInRound(false);
    setFinished(false);
    answerLockedRef.current = false;
  };

  const startRound = () => {
    setIndex(0);
    setScore(0);
    setFinished(false);
    setInRound(true);
    answerLockedRef.current = false;
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={styles.panel}>
        <Text style={styles.title} accessibilityRole="header">
          World Geo Game
        </Text>
        <Text style={styles.subtitle}>Profiles + Leaderboard enabled</Text>

        <View style={styles.row}>
          {profiles.map((p) => (
            <Pressable
              key={p.id}
              style={[
                styles.profile,
                p.id === profileId && styles.profileActive,
                gameInProgress && styles.profileDisabled,
              ]}
              disabled={gameInProgress}
              onPress={() => {
                setProfileId(p.id);
                reset();
              }}
            >
              <Text style={styles.profileText}>{p.name}</Text>
            </Pressable>
          ))}
        </View>

        {!hasQuestions ? (
          <View style={styles.quiz}>
            <Text style={styles.question}>No quiz data available.</Text>
          </View>
        ) : !inRound && !finished ? (
          <View style={styles.quiz}>
            <Text style={styles.question}>Ready for a new round?</Text>
            <Pressable style={styles.choice} onPress={startRound}>
              <Text style={styles.choiceText}>Start quiz</Text>
            </Pressable>
          </View>
        ) : !finished && current ? (
          <View style={styles.quiz}>
            <Text style={styles.progress}>
              {index + 1}/{QUESTIONS.length} • Score {score}
            </Text>
            <Text style={styles.question}>Capital of {current.country}?</Text>
            {current.choices.map((c) => (
              <Pressable key={c} style={styles.choice} onPress={() => answer(c)}>
                <Text style={styles.choiceText}>{c}</Text>
              </Pressable>
            ))}
          </View>
        ) : !finished ? (
          <View style={styles.quiz}>
            <Text style={styles.question}>No active question.</Text>
          </View>
        ) : (
          <View style={styles.quiz}>
            <Text style={styles.question}>Final score: {score}</Text>
            <Pressable style={styles.choice} onPress={startRound}>
              <Text style={styles.choiceText}>Play again</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.board}>
          <Text style={styles.boardTitle}>Leaderboard</Text>
          {leaderboard.map((p, i) => (
            <Text key={p.id} style={styles.boardRow}>
              {i + 1}. {p.name} — best {p.best}/{QUESTIONS.length} ({p.plays} plays)
            </Text>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  panel: { flex: 1, padding: 16, gap: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 14 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  profile: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  profileActive: { borderColor: colors.accent, backgroundColor: colors.cardAlt },
  profileDisabled: { opacity: 0.6 },
  profileText: { color: colors.text, fontWeight: '600' },
  quiz: { backgroundColor: colors.card, borderRadius: 12, padding: 14, gap: 10 },
  progress: { color: colors.muted, fontSize: 13 },
  question: { color: colors.text, fontSize: 20, fontWeight: '700' },
  choice: {
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  choiceText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  board: { marginTop: 8, backgroundColor: colors.card, borderRadius: 12, padding: 14, gap: 6 },
  boardTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  boardRow: { color: colors.muted, fontSize: 14 },
});
