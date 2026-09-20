import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import { McqRoundSummary } from './McqQuizScreen';

type Props = {
  summary: McqRoundSummary;
  onHome: () => void;
  onReplay: () => void;
};

export default function McqResultsScreen({ summary, onHome, onReplay }: Props) {
  const acc = summary.answered > 0 ? Math.round((summary.correct / summary.answered) * 100) : 0;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.card}>
        <Text style={styles.title}>{summary.title}</Text>
        <Text style={styles.score}>{acc}%</Text>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  score: { color: colors.warn, fontSize: 30, fontWeight: '800', textAlign: 'center' },
  primary: { backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: 'center' },
  primaryText: { color: '#06201C', fontWeight: '800', fontSize: 15 },
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
