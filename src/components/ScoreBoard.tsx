// Ekranın üstünde her zaman görünen skor tablosu bileşeni.
// İki oyuncunun adını ve skorlarını yan yana gösterir.
// Rotated prop ile 180 derece çevrilmiş versiyonu (SplitScreen için) desteklenir.

import React from 'react';
import { View, Text } from 'react-native';
import { useGameStore } from '../store/gameStore';

interface ScoreBoardProps {
  rotated?: boolean;
}

export default function ScoreBoard({ rotated = false }: ScoreBoardProps) {
  const { player1Name, player2Name, score1, score2, winScore } = useGameStore();

  return (
    <View
      className="flex-row justify-between items-center px-4 py-2 bg-slate-800"
      style={rotated ? { transform: [{ rotate: '180deg' }] } : undefined}
    >
      {/* P1 skor */}
      <View className="items-center flex-1">
        <Text className="text-white font-bold text-base" numberOfLines={1}>
          {player1Name}
        </Text>
        <Text className="text-green-400 font-bold text-2xl">{score1}</Text>
      </View>

      {/* Orta: hedef skor */}
      <View className="items-center px-4">
        <Text className="text-slate-400 text-xs">HEDEF</Text>
        <Text className="text-yellow-400 font-bold text-lg">{winScore}</Text>
      </View>

      {/* P2 skor */}
      <View className="items-center flex-1">
        <Text className="text-white font-bold text-base" numberOfLines={1}>
          {player2Name}
        </Text>
        <Text className="text-green-400 font-bold text-2xl">{score2}</Text>
      </View>
    </View>
  );
}
