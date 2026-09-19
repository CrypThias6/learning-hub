import React, { useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/constants/theme';
import { GameProvider, useGame } from './src/context/GameContext';
import ChallengeScreen, { RoundSummary } from './src/screens/ChallengeScreen';
import HomeScreen from './src/screens/HomeScreen';
import HorseQuizScreen, { HorseRoundSummary } from './src/screens/HorseQuizScreen';
import HorseResultsScreen from './src/screens/HorseResultsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import LearnScreen from './src/screens/LearnScreen';
import MainHubScreen from './src/screens/MainHubScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { GameMode } from './src/types/game';

type Screen =
  | { name: 'hub' }
  | { name: 'countries' }
  | { name: 'horses' }
  | { name: 'horseResults'; summary: HorseRoundSummary }
  | { name: 'learn' }
  | { name: 'challenge'; mode: GameMode }
  | { name: 'settings'; from: 'hub' | 'countries' }
  | { name: 'leaderboard' }
  | { name: 'results'; summary: RoundSummary };

function Root() {
  const { ready } = useGame();
  const [screen, setScreen] = useState<Screen>({ name: 'hub' });
  const [challengeKey, setChallengeKey] = useState(0);
  const [horseKey, setHorseKey] = useState(0);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const goHub = () => setScreen({ name: 'hub' });
  const goCountries = () => setScreen({ name: 'countries' });

  if (screen.name === 'learn') {
    return <LearnScreen onBack={goCountries} />;
  }
  if (screen.name === 'challenge') {
    return (
      <ChallengeScreen
        key={challengeKey}
        mode={screen.mode}
        onBack={goCountries}
        onDone={(summary) => setScreen({ name: 'results', summary })}
      />
    );
  }
  if (screen.name === 'settings') {
    return (
      <SettingsScreen
        onBack={() =>
          setScreen({ name: screen.from === 'countries' ? 'countries' : 'hub' })
        }
      />
    );
  }
  if (screen.name === 'leaderboard') {
    return <LeaderboardScreen onBack={goCountries} />;
  }
  if (screen.name === 'results') {
    return (
      <ResultsScreen
        summary={screen.summary}
        onHome={goCountries}
        onReplay={() => {
          setChallengeKey((k) => k + 1);
          setScreen({ name: 'challenge', mode: screen.summary.mode });
        }}
      />
    );
  }
  if (screen.name === 'horses') {
    return (
      <HorseQuizScreen
        key={horseKey}
        onBack={goHub}
        onDone={(summary) => setScreen({ name: 'horseResults', summary })}
      />
    );
  }
  if (screen.name === 'horseResults') {
    return (
      <HorseResultsScreen
        summary={screen.summary}
        onHome={goHub}
        onReplay={() => {
          setHorseKey((k) => k + 1);
          setScreen({ name: 'horses' });
        }}
      />
    );
  }
  if (screen.name === 'countries') {
    return (
      <HomeScreen
        onBackToHub={goHub}
        onNavigate={(name, params) => {
          if (name === 'learn') setScreen({ name: 'learn' });
          else if (name === 'settings') setScreen({ name: 'settings', from: 'countries' });
          else if (name === 'leaderboard') setScreen({ name: 'leaderboard' });
          else if (name === 'challenge') {
            setChallengeKey((k) => k + 1);
            setScreen({
              name: 'challenge',
              mode: (params?.mode as GameMode) || 'capitals',
            });
          }
        }}
      />
    );
  }

  return (
    <MainHubScreen
      onCountries={goCountries}
      onHorses={() => {
        setHorseKey((k) => k + 1);
        setScreen({ name: 'horses' });
      }}
      onSettings={() => setScreen({ name: 'settings', from: 'hub' })}
    />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <GameProvider>
          <StatusBar barStyle="light-content" backgroundColor={colors.bg} translucent />
          <View style={styles.root}>
            <Root />
          </View>
        </GameProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
