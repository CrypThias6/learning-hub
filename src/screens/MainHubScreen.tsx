import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

type Props = {
  onCountries: () => void;
  onHorses: () => void;
  onMum: () => void;
  onKen: () => void;
  onSettings: () => void;
  onLeaderboard: () => void;
};

export default function MainHubScreen({
  onCountries,
  onHorses,
  onMum,
  onKen,
  onSettings,
  onLeaderboard,
}: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.wrap}>
        <Text style={styles.title}>Learning Hub</Text>
        <Button title="Countries" onPress={onCountries} />
        <Button title="Horses" onPress={onHorses} />
        <Button title="Counselling" onPress={onMum} />
        <Button title="Ken's Quiz" onPress={onKen} />
        <Button title="Leaderboard" onPress={onLeaderboard} />
        <Button title="Settings" onPress={onSettings} />
      </View>
    </SafeAreaView>
  );
}

function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, justifyContent: 'center', padding: spacing.md, gap: 10 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  btn: { backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border },
  btnText: { color: colors.text, fontWeight: '700', textAlign: 'center' },
});
