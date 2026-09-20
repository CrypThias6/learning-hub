import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

type Props = {
  title: string;
  blurb?: string;
  onBack: () => void;
};

export default function ComingSoonScreen({ title, blurb, onBack }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.wrap}>
        <TouchableOpacity onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>← Home</Text>
        </TouchableOpacity>
        <View style={styles.card}>
          <Text style={styles.emoji}>🚧</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.blurb}>{blurb || 'Game coming soon'}</Text>
          <Text style={styles.note}>
            You can browse and try other quizzes meanwhile. Official scoring starts when this game
            ships and the competition flag is on.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, padding: spacing.md },
  back: { marginBottom: 16, alignSelf: 'flex-start' },
  backText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  blurb: { color: colors.warn, fontSize: 16, fontWeight: '700', marginBottom: 16 },
  note: { color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
