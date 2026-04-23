// Ana sayfa: oyuncu isimlerini gir, oyun modunu ve kazanma skorunu seç.
// Tüm seçimler Zustand store'a kaydedilir.
// Validasyon geçtikten sonra seçilen moda yönlendirme yapılır.

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
import { useRouter } from 'expo-router';
import { useGameStore, GameMode, WinScore } from '../src/store/gameStore';

const WIN_SCORES: WinScore[] = [3, 5, 7, 10];

export default function HomePage() {
  const router = useRouter();
  const { setPlayers, setGameMode, setWinScore, resetGame } = useGameStore();

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [mode, setMode] = useState<GameMode>('mode1');
  const [score, setScore] = useState<WinScore>(5);

  function handleStart() {
    if (!p1.trim() || !p2.trim()) {
      Alert.alert('Hata', 'Her iki oyuncunun ismini giriniz.');
      return;
    }
    if (p1.trim() === p2.trim()) {
      Alert.alert('Hata', 'Oyuncu isimleri farklı olmalı.');
      return;
    }

    resetGame();
    setPlayers(p1.trim(), p2.trim());
    setGameMode(mode);
    setWinScore(score);

    router.push(mode === 'mode1' ? '/mode1' : '/mode2');
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
        <View className="flex-1 px-6 py-12 justify-center">
          {/* Başlık */}
          <View className="items-center mb-10">
            <Text className="text-5xl">⚽</Text>
            <Text className="text-white text-3xl font-bold mt-3">
              Futbolcu Tahmin
            </Text>
            <Text className="text-slate-400 text-base mt-1">
              İki kişilik bilgi oyunu
            </Text>
          </View>

          {/* Oyuncu isimleri */}
          <View className="mb-8">
            <Text className="text-slate-300 text-sm font-semibold mb-2 uppercase tracking-wider">
              Oyuncu İsimleri
            </Text>
            <TextInput
              className="bg-slate-700 text-white px-4 py-3 rounded-xl mb-3 text-base border border-slate-600"
              placeholder="Oyuncu 1 adı"
              placeholderTextColor="#64748b"
              value={p1}
              onChangeText={setP1}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <TextInput
              className="bg-slate-700 text-white px-4 py-3 rounded-xl text-base border border-slate-600"
              placeholder="Oyuncu 2 adı"
              placeholderTextColor="#64748b"
              value={p2}
              onChangeText={setP2}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          {/* Oyun modu seçimi */}
          <View className="mb-8">
            <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
              Oyun Modu
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 rounded-xl p-4 border-2 ${
                  mode === 'mode1'
                    ? 'bg-blue-600 border-blue-400'
                    : 'bg-slate-700 border-slate-600'
                }`}
                onPress={() => setMode('mode1')}
              >
                <Text className="text-white font-bold text-center text-base">
                  Mod 1
                </Text>
                <Text className="text-slate-300 text-center text-xs mt-1">
                  Takım Tahmin
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 rounded-xl p-4 border-2 ${
                  mode === 'mode2'
                    ? 'bg-purple-600 border-purple-400'
                    : 'bg-slate-700 border-slate-600'
                }`}
                onPress={() => setMode('mode2')}
              >
                <Text className="text-white font-bold text-center text-base">
                  Mod 2
                </Text>
                <Text className="text-slate-300 text-center text-xs mt-1">
                  Ülke & Takım
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mod açıklaması */}
            <View className="mt-3 bg-slate-800 rounded-xl p-3">
              {mode === 'mode1' ? (
                <Text className="text-slate-400 text-sm">
                  Her oyuncu bir takım seçer. Ortak oyuncuyu tahmin et!
                </Text>
              ) : (
                <Text className="text-slate-400 text-sm">
                  Sıradaki oyuncu ülke veya takım seçer, diğeri tahmin eder.
                </Text>
              )}
            </View>
          </View>

          {/* Kazanma skoru */}
          <View className="mb-10">
            <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
              Kazanma Skoru
            </Text>
            <View className="flex-row gap-3">
              {WIN_SCORES.map((s) => (
                <TouchableOpacity
                  key={s}
                  className={`flex-1 py-3 rounded-xl border-2 ${
                    score === s
                      ? 'bg-yellow-500 border-yellow-400'
                      : 'bg-slate-700 border-slate-600'
                  }`}
                  onPress={() => setScore(s)}
                >
                  <Text
                    className={`text-center font-bold text-lg ${
                      score === s ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Başlat butonu */}
          <TouchableOpacity
            className="bg-green-500 py-4 rounded-2xl items-center"
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-xl tracking-wider">
              OYUNU BAŞLAT
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
