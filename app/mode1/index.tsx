// Mod 1 — Takım Tahmin oyun ekranı.
// Aşama akışı: team-select → countdown → reveal → hazir → guessing

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useGameStore } from '../../src/store/gameStore';
import ScoreBoard from '../../src/components/ScoreBoard';
import TeamSearch from '../../src/components/TeamSearch';
import PlayerSearch from '../../src/components/PlayerSearch';
import Countdown from '../../src/components/Countdown';
import HazirButton from '../../src/components/HazirButton';
import SplitScreen from '../../src/components/SplitScreen';
import { C } from '../../src/theme';

export default function Mode1Page() {
  const router = useRouter();
  const store = useGameStore();
  const [showHandoff, setShowHandoff] = useState(false);

  // ─────────────────────────────────────────────
  // TAKIM SEÇİM AŞAMASI
  // ─────────────────────────────────────────────
  if (store.mode1Phase === 'team-select') {
    const isFirstPicker = store.teamSelectStep === 1;
    const activePlayerNum: 1 | 2 = isFirstPicker
      ? store.currentTurn
      : store.currentTurn === 1 ? 2 : 1;
    const activeName = activePlayerNum === 1 ? store.player1Name : store.player2Name;
    const currentTeam = activePlayerNum === 1 ? store.team1 : store.team2;

    // Telefon geçiş ekranı
    if (showHandoff) {
      const nextName = activePlayerNum === 1 ? store.player2Name : store.player1Name;
      return (
        <SafeAreaView style={s.safe}>
          <View style={s.centerPage}>
            <Text style={s.bigEmoji}>📱</Text>
            <Text style={s.handoffTitle}>TELEFONU{'\n'}{nextName.toUpperCase()}'E VER</Text>
            <Text style={s.handoffSub}>Diğer oyuncu takımını seçecek</Text>
            <TouchableOpacity style={s.primaryBtn} onPress={() => setShowHandoff(false)}>
              <Text style={s.primaryBtnText}>HAZIR</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    function handleTeamSelected(name: string, id: number) {
      store.setTeam(activePlayerNum, { name, apiId: id });
    }

    function handleConfirm() {
      if (!currentTeam.name) {
        Alert.alert('HATA', 'Önce bir takım seçmelisin.');
        return;
      }
      if (isFirstPicker) {
        store.setTeamSelectStep(2);
        setShowHandoff(true);
      } else {
        store.setMode1Phase('countdown');
      }
    }

    function handleSkip() {
      Alert.alert('GEÇ', 'Bu turu geçmek istediğine emin misin?', [
        { text: 'İptal', style: 'cancel' },
        { text: 'GEÇ', onPress: () => { store.nextMode1Round(); setShowHandoff(false); } },
      ]);
    }

    // ScrollView YOK — FlatList (TeamSearch dropdown) iç içe geçmez
    return (
      <SafeAreaView style={s.safe}>
        <ScoreBoard />
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Başlık */}
          <View style={s.playerHeader}>
            <Text style={s.playerNum}>{activePlayerNum}. OYUNCU</Text>
            <Text style={s.playerSubtitle}>TAKIMINI SEÇSİN</Text>
          </View>

          {/* Alt kısım — takım arama + butonlar */}
          <View style={s.bottomSection}>
            <TeamSearch placeholder="TAKIM ARA..." onSelect={handleTeamSelected} />
            <TouchableOpacity
              style={[s.primaryBtn, { marginTop: 12 }, !currentTeam.name && s.btnDisabled]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={s.primaryBtnText}>ONAYLA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.skipBtn} onPress={handleSkip}>
              <Text style={s.skipBtnText}>GEÇ</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────
  // GERİ SAYIM
  // ─────────────────────────────────────────────
  if (store.mode1Phase === 'countdown') {
    return (
      <SafeAreaView style={s.safe}>
        <ScoreBoard />
        <Countdown onFinish={() => store.setMode1Phase('hazir')} />
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────
  // TAKIM AÇIKLAMA
  // ─────────────────────────────────────────────
  if (store.mode1Phase === 'reveal') {
    const sameTeam = store.team1.apiId !== null && store.team1.apiId === store.team2.apiId;
    return (
      <SafeAreaView style={s.safe}>
        <ScoreBoard />
        <View style={s.revealPage}>
          <Text style={s.sectionLabel}>TAKIMLAR</Text>
          <View style={s.teamsRow}>
            <View style={s.teamCard}>
              <Text style={s.teamCardPlayer}>{store.player1Name.toUpperCase()}</Text>
              <Text style={s.teamCardName}>{store.team1.name.toUpperCase()}</Text>
            </View>
            <Text style={s.vsText}>VS</Text>
            <View style={s.teamCard}>
              <Text style={s.teamCardPlayer}>{store.player2Name.toUpperCase()}</Text>
              <Text style={s.teamCardName}>{store.team2.name.toUpperCase()}</Text>
            </View>
          </View>
          {sameTeam && (
            <View style={s.sameTeamBadge}>
              <Text style={s.sameTeamText}>AYNI TAKIM — O TAKIMDAN BİR OYUNCU</Text>
            </View>
          )}
          <TouchableOpacity
            style={[s.primaryBtn, { marginTop: 32 }]}
            onPress={() => store.setMode1Phase('hazir')}
          >
            <Text style={s.primaryBtnText}>HAZIR EKRANI →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────
  // HAZIR BUTONU
  // ─────────────────────────────────────────────
  if (store.mode1Phase === 'hazir') {
    return (
      <HazirButton
        onPress={(side) => {
          store.setActiveGuesser(side);
          store.setMode1Phase('guessing');
        }}
      />
    );
  }

  // ─────────────────────────────────────────────
  // TAHMİN AŞAMASI
  // ─────────────────────────────────────────────
  if (store.mode1Phase === 'guessing' && store.activeGuesser) {
    const guesser = store.activeGuesser;

    function handleCorrect(playerName: string) {
      store.addScore(guesser);
      const newScore = guesser === 1 ? store.score1 + 1 : store.score2 + 1;
      if (newScore >= store.winScore) {
        const winnerName = guesser === 1 ? store.player1Name : store.player2Name;
        router.replace({ pathname: '/game-over', params: { winner: winnerName } });
        return;
      }
      Alert.alert('✅ DOĞRU!', `${playerName} her iki takımda oynamış!`, [
        { text: 'SONRAKI TUR', onPress: () => store.nextMode1Round() },
      ]);
    }

    function handleWrong(playerName: string) {
      const other: 1 | 2 = guesser === 1 ? 2 : 1;
      const otherPassed = other === 1 ? store.p1Passed : store.p2Passed;
      if (otherPassed) {
        Alert.alert('❌ YANLIŞ', `${playerName} ortak değil. Tur bitti.`, [
          { text: 'YENİ TUR', onPress: () => store.nextMode1Round() },
        ]);
        return;
      }
      const otherName = other === 1 ? store.player1Name : store.player2Name;
      Alert.alert('❌ YANLIŞ', `${playerName} ortak değil. Hak ${otherName}'e geçti.`, [
        { text: 'TAMAM', onPress: () => { store.setPass(guesser, true); store.setActiveGuesser(other); } },
      ]);
    }

    function handlePassPress() {
      const other: 1 | 2 = guesser === 1 ? 2 : 1;
      const otherPassed = other === 1 ? store.p1Passed : store.p2Passed;
      store.setPass(guesser, true);
      if (otherPassed) { store.nextMode1Round(); }
      else { store.setActiveGuesser(other); }
    }

    // KeyboardAvoidingView SplitScreen içinde — FlatList nested ScrollView içinde değil
    const activeContent = (
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={s.teamHint}>
          {store.team1.name.toUpperCase()} × {store.team2.name.toUpperCase()}
        </Text>
        <PlayerSearch
          team1Id={store.team1.apiId}
          team2Id={store.team2.apiId}
          placeholder="TAHMİN"
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
        <TouchableOpacity style={[s.primaryBtn, { marginTop: 10 }]} onPress={handlePassPress}>
          <Text style={s.primaryBtnText}>GÖNDER / GEÇ</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );

    return (
      <SplitScreen
        activePlayer={guesser}
        player1Name={store.player1Name}
        player2Name={store.player2Name}
        activeContent={activeContent}
      />
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.centerPage}>
        <Text style={{ color: C.green }}>Yükleniyor...</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  centerPage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  bigEmoji: { fontSize: 64, marginBottom: 24 },
  playerHeader: { alignItems: 'center', paddingTop: 40, paddingBottom: 28 },
  playerNum: { fontSize: 36, fontWeight: '900', color: C.green, letterSpacing: 4 },
  playerSubtitle: { fontSize: 13, fontWeight: '700', color: C.textMuted, letterSpacing: 4, marginTop: 6 },
  bottomSection: { paddingHorizontal: 28, paddingBottom: 32 },
  primaryBtn: { backgroundColor: C.greenBtn, borderRadius: 6, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.35 },
  primaryBtnText: { color: C.bg, fontSize: 16, fontWeight: '900', letterSpacing: 4 },
  skipBtn: { borderWidth: 1, borderColor: C.greenBorder, borderRadius: 6, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  skipBtnText: { color: C.textMuted, fontSize: 14, fontWeight: '700', letterSpacing: 3 },
  handoffTitle: { fontSize: 26, fontWeight: '900', color: C.green, letterSpacing: 3, textAlign: 'center', marginBottom: 12 },
  handoffSub: { fontSize: 13, color: C.textMuted, letterSpacing: 2, marginBottom: 40, textAlign: 'center' },
  revealPage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: C.textMuted, letterSpacing: 4, marginBottom: 28 },
  teamsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  teamCard: { flex: 1, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.greenBorder, borderRadius: 8, padding: 16, alignItems: 'center' },
  teamCardPlayer: { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 2, marginBottom: 8 },
  teamCardName: { fontSize: 14, fontWeight: '900', color: C.green, letterSpacing: 1, textAlign: 'center' },
  vsText: { fontSize: 16, fontWeight: '900', color: C.textMuted, letterSpacing: 2 },
  sameTeamBadge: { marginTop: 16, borderWidth: 1, borderColor: C.green, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 10 },
  sameTeamText: { color: C.green, fontSize: 11, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  teamHint: { fontSize: 10, color: C.textMuted, letterSpacing: 2, fontWeight: '700', marginBottom: 12 },
});
