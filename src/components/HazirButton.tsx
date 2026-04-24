// Portrait split ekran: üstte P2 (180° dönmüş), altta P1.
// Her yarıda oyuncu adı, anlık skoru ve HAZIR butonu bulunur.
// İlk basan oyuncunun tarafı (1 veya 2) onPress ile bildirilir.

import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { C } from '../theme';

interface Props {
  onPress: (side: 1 | 2) => void;
}

export default function HazirButton({ onPress }: Props) {
  const pressed = useRef(false);
  const { player1Name, player2Name, score1, score2 } = useGameStore();

  function handlePress(side: 1 | 2) {
    if (pressed.current) return;
    pressed.current = true;
    onPress(side);
  }

  return (
    <View style={s.container}>
      {/* P2 tarafı — üstte, 180° döndürülmüş */}
      <View style={s.half}>
        <View style={s.rotated}>
          <Text style={s.playerLabel}>{player2Name.toUpperCase()}</Text>
          <Text style={s.scoreText}>{score2}</Text>
          <TouchableOpacity
            style={s.hazirBtn}
            onPress={() => handlePress(2)}
            activeOpacity={0.7}
          >
            <Text style={s.hazirText}>HAZIR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bölücü çizgi */}
      <View style={s.divider} />

      {/* P1 tarafı — altta, normal */}
      <View style={s.half}>
        <Text style={s.playerLabel}>{player1Name.toUpperCase()}</Text>
        <Text style={s.scoreText}>{score1}</Text>
        <TouchableOpacity
          style={s.hazirBtn}
          onPress={() => handlePress(1)}
          activeOpacity={0.7}
        >
          <Text style={s.hazirText}>HAZIR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  half: {
    flex: 1,
    backgroundColor: C.bgActive,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  // P2 içeriğini tutan wrapper — 180° döndürür
  rotated: {
    transform: [{ rotate: '180deg' }],
    alignItems: 'center',
    width: '100%',
  },
  divider: {
    height: 3,
    backgroundColor: C.divider,
  },
  playerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 3,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 64,
    fontWeight: '900',
    color: C.green,
    lineHeight: 70,
    marginBottom: 20,
  },
  hazirBtn: {
    backgroundColor: C.greenBtn,
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
  },
  hazirText: {
    color: C.bg,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
});
