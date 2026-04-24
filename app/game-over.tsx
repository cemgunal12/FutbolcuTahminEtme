// Oyun bitti ekranı — kazananı büyük neon yeşil harflerle gösterir.
// Yeniden oyna butonu store'u sıfırlayıp ana sayfaya döner.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGameStore } from '../src/store/gameStore';
import { C } from '../src/theme';

export default function GameOverPage() {
  const { winner } = useLocalSearchParams<{ winner: string }>();
  const router = useRouter();
  const { resetGame } = useGameStore();

  function handlePlayAgain() {
    resetGame();
    router.replace('/');
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.trophy}>🏆</Text>
        <Text style={s.winnerName}>{winner?.toUpperCase()}</Text>
        <Text style={s.winnerLabel}>KAZANDI!</Text>
        <Text style={s.sub}>Tebrikler, hedef skora ulaştın!</Text>

        <TouchableOpacity style={s.btn} onPress={handlePlayAgain} activeOpacity={0.8}>
          <Text style={s.btnText}>TEKRAR OYNA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  trophy: { fontSize: 80, marginBottom: 24 },
  winnerName: {
    fontSize: 40,
    fontWeight: '900',
    color: C.green,
    letterSpacing: 4,
    textAlign: 'center',
  },
  winnerLabel: {
    fontSize: 22,
    fontWeight: '900',
    color: C.textWhite,
    letterSpacing: 6,
    marginTop: 8,
  },
  sub: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 12,
    marginBottom: 48,
    letterSpacing: 1,
  },
  btn: {
    backgroundColor: C.greenBtn,
    borderRadius: 6,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
  },
  btnText: {
    color: C.bg,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
});
