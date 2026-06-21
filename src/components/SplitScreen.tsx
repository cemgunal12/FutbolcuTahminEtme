// Tahmin aşaması için dikey split ekran.
// Aktif oyuncu üstte (input + GÖNDER), pasif oyuncu altta (bekliyor).
// Pasif taraf soluk gösterilir; SplitScreen içeriği dışarıdan prop ile gelir.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../theme';

interface Props {
  activePlayer: 1 | 2;
  player1Name: string;
  player2Name: string;
  activeContent: React.ReactNode;
  onHomePress: () => void;
}

export default function SplitScreen({
  activePlayer,
  player1Name,
  player2Name,
  activeContent,
  onHomePress,
}: Props) {
  const activeName  = activePlayer === 1 ? player1Name  : player2Name;
  const passiveName = activePlayer === 1 ? player2Name  : player1Name;

  return (
    <View style={s.container}>
      {/* Üst yarı — aktif oyuncu */}
      <View style={s.activeHalf}>
        <Text style={s.playerLabel}>{activeName.toUpperCase()}</Text>
        <View style={s.content}>{activeContent}</View>
      </View>

      {/* Orta bant — ana sayfa butonu */}
      <View style={s.centerBand}>
        <TouchableOpacity style={s.homeBtn} onPress={onHomePress} activeOpacity={0.7}>
          <Text style={s.homeText}>⌂  ANA SAYFA</Text>
        </TouchableOpacity>
      </View>

      {/* Alt yarı — pasif oyuncu */}
      <View style={s.passiveHalf}>
        <Text style={s.passiveLabel}>{passiveName.toUpperCase()}</Text>
        <Text style={s.waitText}>BEKLİYOR...</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  activeHalf: {
    flex: 3,
    backgroundColor: C.bgActive,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    overflow: 'visible',
    zIndex: 10,
  },
  centerBand: {
    height: 44,
    backgroundColor: C.bgCard,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.divider,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  homeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  homeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 3,
  },
  passiveHalf: {
    flex: 2,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  playerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 3,
    marginBottom: 16,
  },
  content: { flex: 1, overflow: 'visible', zIndex: 10 },
  passiveLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.greenDim,
    letterSpacing: 3,
    marginBottom: 8,
  },
  waitText: {
    fontSize: 11,
    color: C.greenDim,
    letterSpacing: 2,
    fontWeight: '600',
  },
});
