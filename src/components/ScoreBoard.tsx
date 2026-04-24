// Ekranda skoru gösteren ince üst şerit.
// İki oyuncunun adı ve skoru, ortada hedef skor ile gösterilir.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { C } from '../theme';

interface Props {
  rotated?: boolean;
}

export default function ScoreBoard({ rotated = false }: Props) {
  const { player1Name, player2Name, score1, score2, winScore } = useGameStore();

  return (
    <View style={[s.bar, rotated && { transform: [{ rotate: '180deg' }] }]}>
      <View style={s.side}>
        <Text style={s.name} numberOfLines={1}>{player1Name}</Text>
        <Text style={s.score}>{score1}</Text>
      </View>
      <View style={s.center}>
        <Text style={s.targetLabel}>HEDEF</Text>
        <Text style={s.target}>{winScore}</Text>
      </View>
      <View style={s.side}>
        <Text style={s.name} numberOfLines={1}>{player2Name}</Text>
        <Text style={s.score}>{score2}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: C.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: C.greenBorder,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  side: { flex: 1, alignItems: 'center' },
  name: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  score: {
    fontSize: 28,
    fontWeight: '900',
    color: C.green,
    marginTop: 2,
  },
  center: { alignItems: 'center', paddingHorizontal: 12 },
  targetLabel: { fontSize: 9, color: C.textMuted, letterSpacing: 2, fontWeight: '700' },
  target: { fontSize: 18, fontWeight: '900', color: C.greenDim },
});
