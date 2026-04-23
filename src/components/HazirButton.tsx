// Yatay ekranda ekranın ortasında görünen büyük HAZIR butonu.
// İlk basan oyuncunun tarafını (1 veya 2) belirler.
// Telefon yatay tutulduğunda üst yarı P1, alt yarı P2 tarafıdır.

import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface HazirButtonProps {
  onPress: (side: 1 | 2) => void;
}

export default function HazirButton({ onPress }: HazirButtonProps) {
  const pressedRef = useRef(false);

  function handlePress(side: 1 | 2) {
    // İlk basıştan sonra diğer tarafın baskısını engelle
    if (pressedRef.current) return;
    pressedRef.current = true;
    onPress(side);
  }

  return (
    <View style={styles.container}>
      {/* P2 tarafı — üstte, 180 derece döndürülmüş */}
      <TouchableOpacity
        style={[styles.half, styles.topHalf]}
        onPress={() => handlePress(2)}
        activeOpacity={0.7}
      >
        <Text style={[styles.label, { transform: [{ rotate: '180deg' }] }]}>
          {/* P2'nin ismi store'dan alınabilir ama burada generic tutuyoruz */}
          HAZIR
        </Text>
        <Text style={[styles.sub, { transform: [{ rotate: '180deg' }] }]}>
          Oyuncu 2
        </Text>
      </TouchableOpacity>

      {/* Ortadaki çizgi */}
      <View style={styles.divider} />

      {/* P1 tarafı — altta, normal */}
      <TouchableOpacity
        style={[styles.half, styles.bottomHalf]}
        onPress={() => handlePress(1)}
        activeOpacity={0.7}
      >
        <Text style={styles.sub}>Oyuncu 1</Text>
        <Text style={styles.label}>HAZIR</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  half: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHalf: {
    backgroundColor: '#1e3a5f',
  },
  bottomHalf: {
    backgroundColor: '#1a3a2f',
  },
  divider: {
    height: 4,
    backgroundColor: '#f59e0b',
  },
  label: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f59e0b',
    letterSpacing: 4,
  },
  sub: {
    fontSize: 16,
    color: '#94a3b8',
    marginVertical: 8,
  },
});
