import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import { getSection } from '../lib/data';
import { RoundSummary } from './ChallengeScreen';

type Props = {
  summary: RoundSummary;
  onHome: () => void;
  onReplay: () => void;
};

export default function ResultsScreen({ summary, onHome, onReplay }: Props) {
  const acc = Math.round(summary.accuracy * 100);
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Round results</Text>
        <Text style={styles.title}>{acc}%</Text>
        <Text style={styles.score}>{summary.score} pts</Text>
        <View style={styles.stats}>
          <Stat label="Mode" value={summary.mode} />
          <Stat label="Section" value={getSection(summary.sectionId)?.label || summary.sectionId} />
          <Stat label="Level" value={summary.difficulty} />
          <Stat label="First-try" value={`${summary.firstTryCorrect}/${summary.answered}`} />
          <Stat label="Streak" value={`${summary.bestStreak}`} />
        </View>
        <TouchableOpacity style={styles.primary} onPress={onReplay}>
          <Text style={styles.primaryText}>Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={onHome}>
          <Text style={styles.secondaryText}>Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kicker: { color: colors.accent, fontWeight: '700', marginBottom: 4, fontSize: 13 },
  title: { color: colors.text, fontSize: 36, fontWeight: '800' },
  score: { color: colors.warn, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  stats: { gap: 4, marginBottom: 16 },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 7,
    gap: 8,
  },
  statLabel: { color: colors.muted, fontSize: 13 },
  statValue: { color: colors.text, fontWeight: '700', textTransform: 'capitalize', flexShrink: 1 },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryText: { color: '#062A26', fontWeight: '800', fontSize: 15 },
  secondary: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  secondaryText: { color: colors.text, fontWeight: '700' },
});
