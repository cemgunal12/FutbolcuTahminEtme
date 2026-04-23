// Oyun akışı mantığını merkezi olarak yöneten custom hook.
// Skor kontrolü, tur geçişleri ve oyun bitiş koşullarını burada yönetiyoruz.
// Store'u doğrudan mutate etmek yerine bu hook üzerinden aksiyonlar tetiklenir.

import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';

export function useGameState() {
  const router = useRouter();
  const store = useGameStore();

  // Oyunu tamamen sıfırla ve ana sayfaya dön
  const exitGame = useCallback(() => {
    store.resetGame();
    router.replace('/');
  }, [store, router]);

  // Skor ekle ve kazanma kontrolü yap
  const scoreAndCheck = useCallback(
    (player: 1 | 2) => {
      store.addScore(player);
      const newScore =
        player === 1 ? store.score1 + 1 : store.score2 + 1;

      if (newScore >= store.winScore) {
        // Kazanan var, oyun bitti
        router.push({
          pathname: '/game-over',
          params: { winner: player === 1 ? store.player1Name : store.player2Name },
        });
      }
    },
    [store, router]
  );

  // Mod 1: HAZIR butonuna basıldı, ekran yatay moddan dikey moda geçiş aşaması
  const handleHazirPressed = useCallback(
    (side: 1 | 2) => {
      store.setActiveGuesser(side);
      store.setMode1Phase('guessing');
    },
    [store]
  );

  // Mod 1: Oyuncu geç dedi
  const handlePass = useCallback(
    (player: 1 | 2) => {
      store.setPass(player, true);
      // Her iki oyuncu da geçtiyse yeni tur
      const p1Done = player === 1 ? true : store.p1Passed;
      const p2Done = player === 2 ? true : store.p2Passed;

      if (p1Done && p2Done) {
        store.nextMode1Round();
      } else {
        // Hak diğer oyuncuya geçti
        const other = player === 1 ? 2 : 1;
        store.setActiveGuesser(other);
      }
    },
    [store]
  );

  return {
    exitGame,
    scoreAndCheck,
    handleHazirPressed,
    handlePass,
  };
}
