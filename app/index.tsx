// Ana sayfa: oyuncu isimlerini gir, hedef skoru ve oyun modunu seç.
// Tasarım: siyah-yeşil arka plan, neon yeşil aksan, tümü büyük harf.

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
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore, GameMode, WinScore } from '../src/store/gameStore';
import { C } from '../src/theme';

const WIN_SCORES: WinScore[] = [3, 5, 7, 10];

export default function HomePage() {
  const router = useRouter();
  const { setPlayers, setGameMode, setWinScore, resetGame } = useGameStore();

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [mode, setMode] = useState<GameMode>('mode1');
  const [score, setScore] = useState<WinScore>(3);

  function handleStart() {
    if (!p1.trim() || !p2.trim()) {
      Alert.alert('HATA', 'Her iki oyuncunun ismini giriniz.');
      return;
    }
    resetGame();
    setPlayers(p1.trim(), p2.trim());
    setGameMode(mode);
    setWinScore(score);
    router.push(mode === 'mode1' ? '/mode1' : '/mode2');
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Başlık */}
          <View style={s.headerBlock}>
            <Text style={s.title}>FUTBOL</Text>
            <Text style={s.subtitle}>TAHMİN OYUNU</Text>
          </View>

          {/* Oyuncu inputları */}
          <View style={s.section}>
            <TextInput
              style={s.input}
              placeholder="OYUNCU 1"
              placeholderTextColor={C.textMuted}
              value={p1}
              onChangeText={setP1}
              autoCapitalize="characters"
              returnKeyType="next"
            />
            <TextInput
              style={[s.input, { marginTop: 12 }]}
              placeholder="OYUNCU 2"
              placeholderTextColor={C.textMuted}
              value={p2}
              onChangeText={setP2}
              autoCapitalize="characters"
              returnKeyType="done"
            />
          </View>

          {/* Mod seçimi */}
          <View style={s.section}>
            <Text style={s.label}>OYUN MODU</Text>
            <View style={s.modeRow}>
              <TouchableOpacity
                style={[s.modeBtn, mode === 'mode1' && s.modeBtnActive]}
                onPress={() => setMode('mode1')}
              >
                <Text style={[s.modeBtnText, mode === 'mode1' && s.modeBtnTextActive]}>
                  MOD 1
                </Text>
                <Text style={s.modeDesc}>TAKIM TAHMİN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modeBtn, mode === 'mode2' && s.modeBtnActive]}
                onPress={() => setMode('mode2')}
              >
                <Text style={[s.modeBtnText, mode === 'mode2' && s.modeBtnTextActive]}>
                  MOD 2
                </Text>
                <Text style={s.modeDesc}>ÜLKE & TAKIM</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hedef skor */}
          <View style={s.section}>
            <Text style={s.label}>HEDEF SKOR</Text>
            <View style={s.scoreRow}>
              {WIN_SCORES.map((sc) => (
                <TouchableOpacity
                  key={sc}
                  style={[s.scoreBtn, score === sc && s.scoreBtnActive]}
                  onPress={() => setScore(sc)}
                >
                  <Text style={[s.scoreBtnText, score === sc && s.scoreBtnTextActive]}>
                    {sc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Başlat */}
          <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.8}>
            <Text style={s.startBtnText}>BAŞLA</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 },
  headerBlock: { alignItems: 'center', marginBottom: 36, marginTop: 16 },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: C.green,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.green,
    letterSpacing: 4,
    marginTop: 4,
  },
  section: { marginBottom: 24 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 3,
    marginBottom: 10,
  },
  input: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: C.green,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
  },
  modeRow: { flexDirection: 'row', gap: 12 },
  modeBtn: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modeBtnActive: {
    borderColor: C.green,
    backgroundColor: C.bgActive,
  },
  modeBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: C.textMuted,
    letterSpacing: 2,
  },
  modeBtnTextActive: { color: C.green },
  modeDesc: {
    fontSize: 9,
    color: C.textMuted,
    letterSpacing: 2,
    marginTop: 4,
    fontWeight: '600',
  },
  scoreRow: { flexDirection: 'row', gap: 10 },
  scoreBtn: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  scoreBtnActive: { borderColor: C.green, backgroundColor: C.bgActive },
  scoreBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: C.textMuted,
  },
  scoreBtnTextActive: { color: C.green },
  startBtn: {
    backgroundColor: C.greenBtn,
    borderRadius: 6,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  startBtnText: {
    color: C.bg,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
});
