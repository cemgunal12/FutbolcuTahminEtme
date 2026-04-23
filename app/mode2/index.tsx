// Mod 2 — Ülke & Takım oyun ekranı.
// Satranç mantığıyla roller değişir: chooser → hazir → guessing → round-end
// Her tur seçen oyuncu değişir, doğru cevapta skor kazanılır.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useGameStore } from '../../src/store/gameStore';
import { useGameState } from '../../src/hooks/useGameState';
import ScoreBoard from '../../src/components/ScoreBoard';
import TeamSearch from '../../src/components/TeamSearch';

export default function Mode2Page() {
  const store = useGameStore();
  const { exitGame, scoreAndCheck } = useGameState();

  // Tahmin input state'i
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);

  // Seçen oyuncunun adı (chooserIndex 1 → P1, 2 → P2)
  const chooserName =
    store.chooserIndex === 1 ? store.player1Name : store.player2Name;
  // Tahmin eden oyuncunun adı
  const guesserName =
    store.chooserIndex === 1 ? store.player2Name : store.player1Name;
  const guesserIndex: 1 | 2 = store.chooserIndex === 1 ? 2 : 1;

  // ─── Seçim Aşaması ─────────────────────────────────────────────────────
  if (store.mode2Phase === 'choosing') {
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
            <Text className="text-slate-400 text-sm uppercase tracking-wider mb-2">
              Mod 2 — Ülke & Takım
            </Text>
            <Text className="text-white text-2xl font-bold mb-1">
              {chooserName}
            </Text>
            <Text className="text-slate-400 text-sm mb-8">
              Bir ülke veya takım seç. Rakibin tahmin edecek!
            </Text>

            <Text className="text-slate-300 font-semibold mb-3">
              Takım Ara
            </Text>
            <TeamSearch
              placeholder="Takım veya ülke..."
              onSelect={(name, _id) => {
                store.setCurrentClue(name);
              }}
            />

            {store.currentClue ? (
              <View className="mt-6 bg-green-900/40 border border-green-600 rounded-xl p-4">
                <Text className="text-green-400 text-sm font-semibold mb-1">
                  Seçilen
                </Text>
                <Text className="text-white font-bold text-lg">
                  {store.currentClue}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              className={`mt-8 py-4 rounded-2xl items-center ${
                store.currentClue ? 'bg-blue-600' : 'bg-slate-700'
              }`}
              disabled={!store.currentClue}
              onPress={() => store.setMode2Phase('hazir')}
            >
              <Text className="text-white font-bold text-xl">
                HAZIR — Telefonu Ver
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 py-3 items-center"
              onPress={exitGame}
            >
              <Text className="text-slate-500">Ana Menüye Dön</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── HAZIR Bekleme Aşaması ─────────────────────────────────────────────
  if (store.mode2Phase === 'hazir') {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center px-8">
        <Text className="text-6xl mb-6">🤔</Text>
        <Text className="text-white text-2xl font-bold text-center mb-2">
          {guesserName}
        </Text>
        <Text className="text-slate-400 text-base text-center mb-12">
          Tahmin etmeye hazır mısın?
        </Text>
        <TouchableOpacity
          className="bg-yellow-500 py-4 rounded-2xl w-full items-center"
          onPress={() => {
            setGuess('');
            setRevealed(false);
            store.setMode2Phase('guessing');
          }}
        >
          <Text className="text-slate-900 font-bold text-xl">HAZIR!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Tahmin Aşaması ────────────────────────────────────────────────────
  if (store.mode2Phase === 'guessing') {
    function handleReveal() {
      setRevealed(true);
    }

    function handleResult(correct: boolean) {
      if (correct) {
        scoreAndCheck(guesserIndex);
      }
      store.nextMode2Round(correct);
      setGuess('');
      setRevealed(false);
    }

    function handlePass() {
      // Geç denirse puan yok, seçim aşamasına dön
      store.setMode2Phase('choosing');
      store.setCurrentClue('');
      setGuess('');
      setRevealed(false);
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
            <Text className="text-white text-2xl font-bold mb-1">
              {guesserName}
            </Text>
            <Text className="text-slate-400 text-sm mb-8">
              Ülke veya takımı tahmin et!
            </Text>

            <TextInput
              className="bg-slate-700 text-white px-4 py-3 rounded-xl mb-4 text-base border border-slate-600"
              placeholder="Cevabını yaz..."
              placeholderTextColor="#64748b"
              value={guess}
              onChangeText={setGuess}
              autoCapitalize="words"
            />

            {/* Cevabı göster butonu */}
            {!revealed ? (
              <TouchableOpacity
                className="bg-slate-700 border border-slate-500 py-3 rounded-xl items-center mb-4"
                onPress={handleReveal}
              >
                <Text className="text-slate-300 font-semibold">
                  Cevabı Göster
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-slate-800 border border-yellow-500 rounded-xl p-4 mb-6">
                <Text className="text-slate-400 text-xs mb-1 uppercase tracking-wider">
                  Doğru Cevap
                </Text>
                <Text className="text-yellow-400 font-bold text-xl">
                  {store.currentClue}
                </Text>

                <View className="flex-row gap-3 mt-4">
                  <TouchableOpacity
                    className="flex-1 bg-green-600 py-3 rounded-xl items-center"
                    onPress={() => handleResult(true)}
                  >
                    <Text className="text-white font-bold">✅ Doğru</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-red-700 py-3 rounded-xl items-center"
                    onPress={() => handleResult(false)}
                  >
                    <Text className="text-white font-bold">❌ Yanlış</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!revealed && (
              <TouchableOpacity
                className="py-3 rounded-xl border border-slate-600 items-center"
                onPress={handlePass}
              >
                <Text className="text-slate-400">Geç — Yeni Seçim</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return null;
}
