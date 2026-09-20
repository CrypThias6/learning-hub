import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import { GameMode } from '../types/game';

type Props = {
  onBackToHub: () => void;
  onNavigate: (
    name: 'learn' | 'settings' | 'leaderboard' | 'challenge',
    params?: { mode?: GameMode }
  ) => void;
};

export default function HomeScreen({ onBackToHub, onNavigate }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.wrap}>
        <Text style={styles.title}>Countries</Text>
        <TouchableOpacity style={styles.btn} onPress={() => onNavigate('challenge', { mode: 'capitals' })}>
          <Text style={styles.btnText}>Start challenge</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => onNavigate('learn')}>
          <Text style={styles.btnText}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => onNavigate('leaderboard')}>
          <Text style={styles.btnText}>Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => onNavigate('settings')}>
          <Text style={styles.btnText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.back} onPress={onBackToHub}>
          <Text style={styles.backText}>← Hub</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, justifyContent: 'center', padding: spacing.md, gap: 10 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  btn: { backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border },
  btnText: { color: colors.text, fontWeight: '700', textAlign: 'center' },
  back: { marginTop: 12, alignItems: 'center' },
  backText: { color: colors.accent, fontWeight: '700' },
});
