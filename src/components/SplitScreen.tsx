// Ekranı dikey olarak ikiye bölen bileşen.
// Aktif olmayan oyuncunun tarafı 180 derece döndürülmüştür,
// böylece her oyuncu kendi tarafından okuyabilir.
// activePlayer: hangi oyuncu şu an tahmin yapıyor (alt taraf aktif görünür).

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface SplitScreenProps {
  activePlayer: 1 | 2;
  player1Name: string;
  player2Name: string;
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
}

export default function SplitScreen({
  activePlayer,
  player1Name,
  player2Name,
  topContent,
  bottomContent,
}: SplitScreenProps) {
  // P1 altta, P2 üstte (yatay ekranda)
  // activePlayer=1 → alt (P1) aktif, üst (P2) soluk
  // activePlayer=2 → üst (P2) aktif, alt (P1) soluk

  return (
    <View style={styles.container}>
      {/* P2 tarafı — üstte, 180° döndürülmüş */}
      <View
        style={[
          styles.half,
          activePlayer === 2 ? styles.activeHalf : styles.inactiveHalf,
        ]}
      >
        <View style={{ transform: [{ rotate: '180deg' }], flex: 1, width: '100%' }}>
          <View style={styles.playerLabel}>
            <Text style={styles.playerName}>{player2Name}</Text>
            {activePlayer === 2 && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>SIRA SENİN</Text>
              </View>
            )}
          </View>
          <View style={styles.content}>{topContent}</View>
        </View>
      </View>

      {/* Orta çizgi */}
      <View style={styles.divider} />

      {/* P1 tarafı — altta, normal */}
      <View
        style={[
          styles.half,
          activePlayer === 1 ? styles.activeHalf : styles.inactiveHalf,
        ]}
      >
        <View style={styles.playerLabel}>
          <Text style={styles.playerName}>{player1Name}</Text>
          {activePlayer === 1 && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>SIRA SENİN</Text>
            </View>
          )}
        </View>
        <View style={styles.content}>{bottomContent}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  half: {
    flex: 1,
    padding: 16,
  },
  activeHalf: {
    backgroundColor: '#1e293b',
  },
  inactiveHalf: {
    backgroundColor: '#0f172a',
    opacity: 0.5,
  },
  divider: {
    height: 3,
    backgroundColor: '#f59e0b',
  },
  playerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  playerName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: {
    color: '#0f172a',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});
