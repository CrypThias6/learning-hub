import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import { HorseRoundSummary } from './HorseQuizScreen';

type Props = {
  summary: HorseRoundSummary;
  onHome: () => void;
  onReplay: () => void;
};

export default function HorseResultsScreen({ summary, onHome, onReplay }: Props) {
  const acc =
    summary.answered > 0
      ? Math.round((summary.correct / summary.answered) * 100)
      : 0;
  const lengthLabel =
    summary.length === 'full' ? `Full (${summary.answered})` : String(summary.length);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Horses · session</Text>
        <Text style={styles.title}>{acc}%</Text>
        <Text style={styles.score}>
          {summary.correct} / {summary.answered} correct
        </Text>
        <View style={styles.stats}>
          <Row label="Length" value={lengthLabel} />
          <Row label="Bank" value={`${summary.totalInBank} questions`} />
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
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
  statValue: { color: colors.text, fontWeight: '700', flexShrink: 1 },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryText: { color: '#06201C', fontWeight: '800', fontSize: 16 },
  secondary: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: { color: colors.text, fontWeight: '700', fontSize: 15 },
});
