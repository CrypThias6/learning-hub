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
import McqQuizScreen, { McqRoundSummary } from './src/screens/McqQuizScreen';
import McqResultsScreen from './src/screens/McqResultsScreen';
import ProfileSelectScreen from './src/screens/ProfileSelectScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { kenQuiz, KEN_CATEGORY_LABELS } from './src/lib/kenQuiz';
import { mumQuiz, MUM_CATEGORY_LABELS } from './src/lib/mumQuiz';
import { GameMode } from './src/types/game';

type Screen =
  | { name: 'hub' }
  | { name: 'countries' }
  | { name: 'horses' }
  | { name: 'horseResults'; summary: HorseRoundSummary }
  | { name: 'mum' }
  | { name: 'mumResults'; summary: McqRoundSummary }
  | { name: 'ken' }
  | { name: 'kenResults'; summary: McqRoundSummary }
  | { name: 'learn' }
  | { name: 'challenge'; mode: GameMode }
  | { name: 'settings'; from: 'hub' | 'countries' }
  | { name: 'leaderboard'; from: 'hub' | 'countries' }
  | { name: 'results'; summary: RoundSummary };

function Root() {
  const { ready, selectedFamilyId, selectFamilyProfile } = useGame();
  const [screen, setScreen] = useState<Screen>({ name: 'hub' });
  const [challengeKey, setChallengeKey] = useState(0);
  const [horseKey, setHorseKey] = useState(0);
  const [mumKey, setMumKey] = useState(0);
  const [kenKey, setKenKey] = useState(0);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!selectedFamilyId) {
    return (
      <ProfileSelectScreen
        onSelect={(id) => {
          selectFamilyProfile(id);
          setScreen({ name: 'hub' });
        }}
      />
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
    const from = screen.from;
    return (
      <SettingsScreen
        onBack={() => setScreen(from === 'countries' ? { name: 'countries' } : { name: 'hub' })}
      />
    );
  }
  if (screen.name === 'leaderboard') {
    const from = screen.from;
    return (
      <LeaderboardScreen
        onBack={() => setScreen(from === 'countries' ? { name: 'countries' } : { name: 'hub' })}
      />
    );
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
  if (screen.name === 'mum') {
    return (
      <McqQuizScreen
        key={mumKey}
        title="Counselling & Guidance"
        accentColor="#C77DFF"
        gameId="mum_counselling"
        quiz={mumQuiz}
        categoryLabels={MUM_CATEGORY_LABELS}
        hint="NZAC · Te Tiriti · theories · skills · supervision"
        onBack={goHub}
        onDone={(summary) => setScreen({ name: 'mumResults', summary })}
      />
    );
  }
  if (screen.name === 'mumResults') {
    return (
      <McqResultsScreen
        summary={screen.summary}
        onHome={goHub}
        onReplay={() => {
          setMumKey((k) => k + 1);
          setScreen({ name: 'mum' });
        }}
      />
    );
  }
  if (screen.name === 'ken') {
    return (
      <McqQuizScreen
        key={kenKey}
        title="Ken's Quiz"
        accentColor="#5B9CF5"
        gameId="ken_multi"
        quiz={kenQuiz}
        categoryLabels={KEN_CATEGORY_LABELS}
        hint="Axe · rugby · trucks · farm · decks · Türkiye"
        onBack={goHub}
        onDone={(summary) => setScreen({ name: 'kenResults', summary })}
      />
    );
  }
  if (screen.name === 'kenResults') {
    return (
      <McqResultsScreen
        summary={screen.summary}
        onHome={goHub}
        onReplay={() => {
          setKenKey((k) => k + 1);
          setScreen({ name: 'ken' });
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
          else if (name === 'leaderboard')
            setScreen({ name: 'leaderboard', from: 'countries' });
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
      onMum={() => {
        setMumKey((k) => k + 1);
        setScreen({ name: 'mum' });
      }}
      onKen={() => {
        setKenKey((k) => k + 1);
        setScreen({ name: 'ken' });
      }}
      onSettings={() => setScreen({ name: 'settings', from: 'hub' })}
      onLeaderboard={() => setScreen({ name: 'leaderboard', from: 'hub' })}
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
  root: { flex: 1, backgroundColor: colors.bg },
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
