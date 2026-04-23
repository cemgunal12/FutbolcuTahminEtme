// Mod 1 — Takım Tahmin oyun ekranı.
// Aşamalar: team-select → countdown → reveal → hazir → guessing → round-end
// expo-screen-orientation ile HAZIR ekranında yatay mod zorunlu tutulur.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useRouter } from 'expo-router';

import { useGameStore } from '../../src/store/gameStore';
import { useGameState } from '../../src/hooks/useGameState';
import ScoreBoard from '../../src/components/ScoreBoard';
import TeamSearch from '../../src/components/TeamSearch';
import PlayerSearch from '../../src/components/PlayerSearch';
import Countdown from '../../src/components/Countdown';
import HazirButton from '../../src/components/HazirButton';
import SplitScreen from '../../src/components/SplitScreen';

export default function Mode1Page() {
  const router = useRouter();
  const store = useGameStore();
  const { exitGame, scoreAndCheck, handleHazirPressed, handlePass } = useGameState();

  // Takım seçim aşamasında P2'nin girişini gizlemek için lokal state
  const [p2TeamVisible, setP2TeamVisible] = useState(false);

  // Geri sayım başladığında ekranı portrait kilitle
  useEffect(() => {
    if (store.mode1Phase === 'hazir') {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    } else if (store.mode1Phase === 'guessing') {
      // Tahmin aşamasında portrait'e dön (SplitScreen yönetecek)
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    } else {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    }

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, [store.mode1Phase]);

  // ─── Takım Seçim Aşaması ───────────────────────────────────────────────
  if (store.mode1Phase === 'team-select') {
    // İlk turda currentTurn ile seçim sırası belirleniyor
    const isP1Turn = store.teamSelectStep === 1
      ? store.currentTurn === 1
      : store.currentTurn !== 1;

    // Hangi oyuncu şu an seçiyor
    const activePlayerName = isP1Turn ? store.player1Name : store.player2Name;
    const activePlayer = isP1Turn ? 1 : 2;

    function handleTeamSelected(name: string, id: number) {
      store.setTeam(activePlayer, { name, apiId: id });
      if (store.teamSelectStep === 1) {
        // İlk oyuncu seçti, sıra diğerine geç
        store.setTeamSelectStep(2);
        setP2TeamVisible(false);
      } else {
        // İkinci oyuncu da seçti, geri sayıma geç
        store.setMode1Phase('countdown');
        setP2TeamVisible(false);
      }
    }

    // P1 seçtikten sonra ekranı temizlemek için P2'ye geç uyarısı
    const showHandoff = store.teamSelectStep === 2 && !p2TeamVisible;

    if (showHandoff) {
      return (
        <View className="flex-1 bg-slate-900 items-center justify-center px-8">
          <Text className="text-6xl mb-6">📱</Text>
          <Text className="text-white text-2xl font-bold text-center mb-3">
            Telefonu {store.currentTurn === 1 ? store.player2Name : store.player1Name}'e ver!
          </Text>
          <Text className="text-slate-400 text-base text-center mb-10">
            Diğer oyuncu takımını seçecek.
          </Text>
          <TouchableOpacity
            className="bg-blue-600 py-4 px-10 rounded-2xl w-full items-center"
            onPress={() => setP2TeamVisible(true)}
          >
            <Text className="text-white font-bold text-xl">HAZIR MIYIM</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        className="flex-1 bg-slate-900"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <ScoreBoard />
          <View className="flex-1 px-6 py-8">
            <Text className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">
              Takım Seçimi
            </Text>
            <Text className="text-white text-2xl font-bold mb-1">
              {activePlayerName}
            </Text>
            <Text className="text-slate-400 text-sm mb-6">
              Rakibinden ortak oyuncu çıkmasını istediğin takımı seç
            </Text>

            <TeamSearch
              placeholder="Takım ara..."
              onSelect={(name, id) => handleTeamSelected(name, id)}
            />

            <TouchableOpacity
              className="mt-6 py-3 rounded-xl border border-slate-600 items-center"
              onPress={exitGame}
            >
              <Text className="text-slate-400">Ana Menüye Dön</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── Geri Sayım Aşaması ────────────────────────────────────────────────
  if (store.mode1Phase === 'countdown') {
    return (
      <View className="flex-1 bg-slate-900">
        <ScoreBoard />
        <Countdown onFinish={() => store.setMode1Phase('reveal')} />
      </View>
    );
  }

  // ─── Takımları Göster Aşaması ──────────────────────────────────────────
  if (store.mode1Phase === 'reveal') {
    const sameTeam = store.team1.apiId === store.team2.apiId;
    return (
      <View className="flex-1 bg-slate-900">
        <ScoreBoard />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-slate-400 text-sm uppercase tracking-wider mb-6">
            Seçilen Takımlar
          </Text>

          <View className="w-full flex-row gap-4 mb-6">
            <View className="flex-1 bg-blue-900 rounded-2xl p-4 items-center">
              <Text className="text-slate-400 text-xs mb-1">{store.player1Name}</Text>
              <Text className="text-white font-bold text-lg text-center">
                {store.team1.name}
              </Text>
            </View>
            <View className="flex-1 bg-purple-900 rounded-2xl p-4 items-center">
              <Text className="text-slate-400 text-xs mb-1">{store.player2Name}</Text>
              <Text className="text-white font-bold text-lg text-center">
                {store.team2.name}
              </Text>
            </View>
          </View>

          {sameTeam && (
            <View className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 mb-6 w-full">
              <Text className="text-yellow-400 text-center font-bold">
                Aynı takımı seçtiniz!
              </Text>
              <Text className="text-yellow-300 text-center text-sm mt-1">
                Bu takımdan herhangi bir oyuncu oynanacak.
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="bg-yellow-500 py-4 rounded-2xl w-full items-center"
            onPress={() => store.setMode1Phase('hazir')}
          >
            <Text className="text-slate-900 font-bold text-xl">
              HAZIR EKRANINA GEÇ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── HAZIR Butonu Aşaması (Yatay ekran) ──────────────────────────────
  if (store.mode1Phase === 'hazir') {
    return (
      <HazirButton
        onPress={(side) => {
          handleHazirPressed(side);
        }}
      />
    );
  }

  // ─── Tahmin Aşaması (SplitScreen) ─────────────────────────────────────
  if (store.mode1Phase === 'guessing' && store.activeGuesser) {
    const activeGuesser = store.activeGuesser;
    const otherPlayer = activeGuesser === 1 ? 2 : 1;

    function handleCorrect(playerName: string) {
      scoreAndCheck(activeGuesser!);
      // Sonraki tura geç (skor kontrolü game-over'a yönlendirebilir)
      Alert.alert(
        '✅ Doğru!',
        `${playerName} her iki takımda da oynamış!`,
        [{ text: 'Sonraki Tur', onPress: () => store.nextMode1Round() }]
      );
    }

    function handleWrong(playerName: string) {
      Alert.alert(
        '❌ Yanlış',
        `${playerName} her iki takımda birden oynamamış.`,
        [
          {
            text: 'Hakkı Geç',
            onPress: () => handlePass(activeGuesser),
          },
        ]
      );
    }

    // Aktif oynayan oyuncunun içerik bölümü
    const activeContent = (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Text className="text-slate-400 text-xs mb-2">
          {store.team1.name} × {store.team2.name}
        </Text>
        <PlayerSearch
          team1Id={store.team1.apiId}
          team2Id={store.team2.apiId}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          disabled={store.activeGuesser !== activeGuesser}
        />
        <TouchableOpacity
          className="mt-3 py-2 rounded-xl border border-slate-600 items-center"
          onPress={() => handlePass(activeGuesser)}
        >
          <Text className="text-slate-400">Geç →</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );

    // Pasif oyuncunun bölümü
    const passiveContent = (
      <View className="flex-1 items-center justify-center">
        <Text className="text-slate-500 text-sm text-center">
          Rakibinin tahminini bekle...
        </Text>
      </View>
    );

    return (
      <View className="flex-1">
        <SplitScreen
          activePlayer={activeGuesser}
          player1Name={store.player1Name}
          player2Name={store.player2Name}
          topContent={activeGuesser === 2 ? activeContent : passiveContent}
          bottomContent={activeGuesser === 1 ? activeContent : passiveContent}
        />
      </View>
    );
  }

  // Fallback — beklenmedik durum
  return (
    <View className="flex-1 bg-slate-900 items-center justify-center">
      <Text className="text-white">Yükleniyor...</Text>
    </View>
  );
}
