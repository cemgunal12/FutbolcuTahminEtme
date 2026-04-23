// Oyun bitti ekranı — kazananı gösterir ve yeniden oynamak için ana sayfaya döner.
// Router params üzerinden kazananın adı alınır.

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGameStore } from '../src/store/gameStore';

export default function GameOverPage() {
  const { winner } = useLocalSearchParams<{ winner: string }>();
  const router = useRouter();
  const { resetGame } = useGameStore();

  function handlePlayAgain() {
    resetGame();
    router.replace('/');
  }

  return (
    <View className="flex-1 bg-slate-900 items-center justify-center px-8">
      {/* Konfeti efekti yerine emoji kullanıyoruz */}
      <Text className="text-8xl mb-6">🏆</Text>

      <Text className="text-yellow-400 text-4xl font-bold text-center mb-2">
        {winner}
      </Text>
      <Text className="text-white text-2xl font-bold text-center mb-2">
        KAZANDI!
      </Text>
      <Text className="text-slate-400 text-base text-center mb-12">
        Tebrikler, hedef skora ulaştın!
      </Text>

      <TouchableOpacity
        className="bg-green-500 py-4 px-10 rounded-2xl items-center w-full"
        onPress={handlePlayAgain}
        activeOpacity={0.8}
      >
        <Text className="text-white font-bold text-xl">TEKRAR OYNA</Text>
      </TouchableOpacity>
    </View>
  );
}
