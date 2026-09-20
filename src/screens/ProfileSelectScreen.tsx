import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAMILY_PROFILES, FamilyProfileId } from '../constants/family';
import { colors, spacing } from '../constants/theme';

type Props = {
  onSelect: (id: FamilyProfileId) => void;
};

export default function ProfileSelectScreen({ onSelect }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.wrap}>
        <Text style={styles.kicker}>Family play</Text>
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.sub}>Pick your name — you can switch later</Text>

        <View style={styles.grid}>
          {FAMILY_PROFILES.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.btn, { borderColor: p.color }]}
              onPress={() => onSelect(p.id)}
              activeOpacity={0.85}
              accessibilityLabel={p.name}
            >
              <Text style={styles.emoji}>{p.emoji}</Text>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.badge}>{p.officialLabel}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  kicker: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  sub: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  btn: {
    width: '46%',
    minWidth: 140,
    maxWidth: 200,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 28,
    paddingHorizontal: 12,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  emoji: { fontSize: 36, marginBottom: 8 },
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  badge: { color: colors.muted, fontSize: 12, marginTop: 6, fontWeight: '600' },
});
