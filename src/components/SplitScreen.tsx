// Tahmin aşaması için dikey split ekran.
// Aktif oyuncu üstte (input + GÖNDER), pasif oyuncu altta (bekliyor).
// Pasif taraf soluk gösterilir; SplitScreen içeriği dışarıdan prop ile gelir.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../theme';

interface Props {
  activePlayer: 1 | 2;
  player1Name: string;
  player2Name: string;
  // Aktif oyuncunun içeriği (input, butonlar)
  activeContent: React.ReactNode;
}

export default function SplitScreen({
  activePlayer,
  player1Name,
  player2Name,
  activeContent,
}: Props) {
  const activeName  = activePlayer === 1 ? player1Name  : player2Name;
  const passiveName = activePlayer === 1 ? player2Name  : player1Name;

  return (
    <View style={s.container}>
      {/* Üst yarı — her zaman aktif oyuncuyu gösterir */}
      <View style={s.activeHalf}>
        <Text style={s.playerLabel}>{activeName.toUpperCase()}</Text>
        <View style={s.content}>{activeContent}</View>
      </View>

      {/* Bölücü */}
      <View style={s.divider} />

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
    // Dropdown'ın taşmasına izin ver (iOS), Android'de elevation devreye girer
    overflow: 'visible',
    zIndex: 10,
  },
  passiveHalf: {
    flex: 2,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  divider: { height: 2, backgroundColor: C.divider, zIndex: 5 },
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
