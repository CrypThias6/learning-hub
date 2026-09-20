import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

export type HorseRoundSummary = {
  correct: number;
  answered: number;
  length: 10 | 20 | 40 | 'full';
  totalInBank: number;
};

type Props = {
  onBack: () => void;
  onDone: (summary: HorseRoundSummary) => void;
};

export default function HorseQuizScreen({ onBack, onDone }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.wrap}>
        <Text style={styles.title}>Horse quiz coming soon</Text>
        <TouchableOpacity
          style={styles.primary}
          onPress={() => onDone({ correct: 0, answered: 0, length: 10, totalInBank: 0 })}
        >
          <Text style={styles.primaryText}>Finish quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={onBack}>
          <Text style={styles.secondaryText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, justifyContent: 'center', padding: spacing.md, gap: 10 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
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
