import React, { useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import { useGame } from '../context/GameContext';
import { getSection } from '../lib/data';

type Props = { onBack: () => void };

export default function LeaderboardScreen({ onBack }: Props) {
  const { leaderboard, activeProfile } = useGame();

  const rows = useMemo(
    () =>
      leaderboard.map((e) => ({
        id: e.id,
        title: e.scoreLabel,
        sub: `${e.mode} · ${getSection(e.sectionId)?.label || e.sectionId}`,
        meta: e.category.replace(/_/g, ' '),
        highlight: e.profileId === activeProfile.id,
        name: e.profileName,
      })),
    [leaderboard, activeProfile.id]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.top}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.link}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>This session</Text>
        <View style={{ width: 48 }} />
      </View>

      <Text style={styles.hint}>Round results only · cleared on reload</Text>

      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Play a round to see scores here.</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, item.highlight && styles.cardHl]}>
            <View style={styles.cardTop}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.score}>{item.title}</Text>
            </View>
            <Text style={styles.cat}>{item.sub}</Text>
            <Text style={styles.meta}>{item.meta}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
  },
  link: { color: colors.accent, fontWeight: '700' },
  title: { color: colors.text, fontWeight: '800', fontSize: 17 },
  hint: { color: colors.muted, fontSize: 12, paddingHorizontal: 16, marginBottom: 4 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHl: { borderColor: colors.accent },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  score: { color: colors.accent, fontWeight: '800', fontSize: 15 },
  cat: { color: colors.warn, marginTop: 4, fontWeight: '600', fontSize: 12 },
  meta: { color: colors.muted, marginTop: 2, fontSize: 11 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40 },
});
