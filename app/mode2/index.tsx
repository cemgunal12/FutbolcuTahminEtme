// Mod 2 — Ülke & Takım oyun ekranı.
// ScrollView kaldırıldı, FlatList (TeamSearch) nested olmuyor.

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../src/store/gameStore';
import ScoreBoard from '../../src/components/ScoreBoard';
import TeamSearch from '../../src/components/TeamSearch';
import { C } from '../../src/theme';

export default function Mode2Page() {
  const store = useGameStore();
  const router = useRouter();
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);

  const chooserName = store.chooserIndex === 1 ? store.player1Name : store.player2Name;
  const guesserName = store.chooserIndex === 1 ? store.player2Name : store.player1Name;
  const guesserIndex: 1 | 2 = store.chooserIndex === 1 ? 2 : 1;

  function addScoreAndCheck(player: 1 | 2) {
    store.addScore(player);
    const newScore = player === 1 ? store.score1 + 1 : store.score2 + 1;
    if (newScore >= store.winScore) {
      const winnerName = player === 1 ? store.player1Name : store.player2Name;
      router.replace({ pathname: '/game-over', params: { winner: winnerName } });
    }
  }

  // ─────────────────────────────────────────────
  // SEÇİM AŞAMASI — ScrollView YOK
  // ─────────────────────────────────────────────
  if (store.mode2Phase === 'choosing') {
    return (
      <SafeAreaView style={s.safe}>
        <ScoreBoard />
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={s.playerHeader}>
            <Text style={s.playerNum}>{chooserName.toUpperCase()}</Text>
            <Text style={s.playerSubtitle}>ÜLKE VEYA TAKIM SEÇ</Text>
          </View>

          <View style={s.bottomSection}>
            <TeamSearch
              placeholder="TAKIM / ÜLKE ARA..."
              onSelect={(name) => store.setCurrentClue(name)}
            />

            {!!store.currentClue && (
              <View style={s.selectedBadge}>
                <Text style={s.selectedLabel}>SEÇİLEN</Text>
                <Text style={s.selectedValue}>{store.currentClue.toUpperCase()}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[s.primaryBtn, { marginTop: 12 }, !store.currentClue && s.btnDisabled]}
              disabled={!store.currentClue}
              onPress={() => store.setMode2Phase('hazir')}
            >
              <Text style={s.primaryBtnText}>HAZIR — TELEFONU VER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.skipBtn}
              onPress={() => { store.setCurrentClue(''); }}
            >
              <Text style={s.skipBtnText}>GEÇ</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────
  // HAZIR BEKLEME
  // ─────────────────────────────────────────────
  if (store.mode2Phase === 'hazir') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centerPage}>
          <Text style={s.bigEmoji}>🤔</Text>
          <Text style={s.playerNum}>{guesserName.toUpperCase()}</Text>
          <Text style={s.playerSubtitle}>TAHMİN ETMEYE HAZIR MISIN?</Text>
          <TouchableOpacity
            style={[s.primaryBtn, { marginTop: 40, width: '100%' }]}
            onPress={() => { setGuess(''); setRevealed(false); store.setMode2Phase('guessing'); }}
          >
            <Text style={s.primaryBtnText}>HAZIR!</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────
  // TAHMİN AŞAMASI
  // ─────────────────────────────────────────────
  if (store.mode2Phase === 'guessing') {
    function handleResult(correct: boolean) {
      if (correct) addScoreAndCheck(guesserIndex);
      store.nextMode2Round(correct);
      setGuess('');
      setRevealed(false);
    }

    return (
      <SafeAreaView style={s.safe}>
        <ScoreBoard />
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={s.playerHeader}>
            <Text style={s.playerNum}>{guesserName.toUpperCase()}</Text>
            <Text style={s.playerSubtitle}>TAHMİNİNİ YAZ</Text>
          </View>

          <View style={s.bottomSection}>
            <View style={s.inputBox}>
              <TextInput
                style={s.guessInput}
                placeholder="TAHMİN..."
                placeholderTextColor={C.textMuted}
                value={guess}
                onChangeText={setGuess}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {!revealed ? (
              <>
                <TouchableOpacity
                  style={[s.primaryBtn, { marginTop: 12 }]}
                  onPress={() => setRevealed(true)}
                >
                  <Text style={s.primaryBtnText}>CEVABI GÖSTER</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.skipBtn}
                  onPress={() => { store.setCurrentClue(''); store.setMode2Phase('choosing'); setGuess(''); setRevealed(false); }}
                >
                  <Text style={s.skipBtnText}>GEÇ — YENİ SEÇİM</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={s.revealBox}>
                <Text style={s.revealLabel}>DOĞRU CEVAP</Text>
                <Text style={s.revealAnswer}>{store.currentClue.toUpperCase()}</Text>
                <View style={s.resultRow}>
                  <TouchableOpacity style={[s.resultBtn, s.correctBtn]} onPress={() => handleResult(true)}>
                    <Text style={s.resultBtnText}>✓ DOĞRU</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.resultBtn, s.wrongBtn]} onPress={() => handleResult(false)}>
                    <Text style={s.resultBtnText}>✗ YANLIŞ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return null;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  centerPage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  bigEmoji: { fontSize: 64, marginBottom: 24 },
  playerHeader: { alignItems: 'center', paddingTop: 40, paddingBottom: 28 },
  playerNum: { fontSize: 36, fontWeight: '900', color: C.green, letterSpacing: 4, textAlign: 'center' },
  playerSubtitle: { fontSize: 13, fontWeight: '700', color: C.textMuted, letterSpacing: 4, marginTop: 6, textAlign: 'center' },
  bottomSection: { paddingHorizontal: 28, paddingBottom: 32 },
  selectedBadge: { marginTop: 12, backgroundColor: C.bgActive, borderWidth: 1, borderColor: C.greenBorder, borderRadius: 6, padding: 14 },
  selectedLabel: { fontSize: 10, color: C.textMuted, letterSpacing: 3, fontWeight: '700', marginBottom: 4 },
  selectedValue: { fontSize: 16, fontWeight: '900', color: C.green, letterSpacing: 2 },
  primaryBtn: { backgroundColor: C.greenBtn, borderRadius: 6, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.35 },
  primaryBtnText: { color: C.bg, fontSize: 16, fontWeight: '900', letterSpacing: 4 },
  skipBtn: { borderWidth: 1, borderColor: C.greenBorder, borderRadius: 6, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  skipBtnText: { color: C.textMuted, fontSize: 14, fontWeight: '700', letterSpacing: 3 },
  inputBox: { backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: C.greenBorder, borderRadius: 6 },
  guessInput: { color: C.textWhite, fontSize: 15, fontWeight: '700', letterSpacing: 2, paddingHorizontal: 16, paddingVertical: 14 },
  revealBox: { marginTop: 16, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.green, borderRadius: 8, padding: 20 },
  revealLabel: { fontSize: 10, color: C.textMuted, letterSpacing: 3, fontWeight: '700', marginBottom: 6 },
  revealAnswer: { fontSize: 22, fontWeight: '900', color: C.green, letterSpacing: 2, marginBottom: 20 },
  resultRow: { flexDirection: 'row', gap: 12 },
  resultBtn: { flex: 1, borderRadius: 6, paddingVertical: 14, alignItems: 'center' },
  correctBtn: { backgroundColor: '#1a5c2a' },
  wrongBtn: { backgroundColor: '#5c1a1a' },
  resultBtnText: { color: C.textWhite, fontSize: 14, fontWeight: '900', letterSpacing: 2 },
});
