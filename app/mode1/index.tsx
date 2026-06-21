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
  Image,
  Modal,
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
import { PlayerCareerDetail } from '../../src/services/footballApi';
import { C } from '../../src/theme';

export default function Mode1Page() {
  const router = useRouter();
  const store = useGameStore();
  const [showHandoff, setShowHandoff] = useState(false);
  const [resultCard, setResultCard] = useState<PlayerCareerDetail | null>(null);
  const [resultOnClose, setResultOnClose] = useState<(() => void) | null>(null);

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
      const nextName = activePlayerNum === 1 ? store.player1Name : store.player2Name;
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

    function handleTeamSelected(name: string, id: string) {
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
            <Text style={s.playerNum}>{activeName.toUpperCase()}</Text>
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

    function handleCorrect(detail: PlayerCareerDetail) {
      store.addScore(guesser);
      const newScore = guesser === 1 ? store.score1 + 1 : store.score2 + 1;
      if (newScore >= store.winScore) {
        const winnerName = guesser === 1 ? store.player1Name : store.player2Name;
        setResultCard(detail);
        setResultOnClose(() => () => router.replace({ pathname: '/game-over', params: { winner: winnerName } }));
        return;
      }
      setResultCard(detail);
      setResultOnClose(() => () => { setResultCard(null); setResultOnClose(null); store.nextMode1Round(); });
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

    function handleHomePress() {
      Alert.alert(
        'ANA SAYFAYA DÖN',
        'Oyundan çıkmak istediğinize emin misiniz?',
        [
          { text: 'İPTAL', style: 'cancel' },
          { text: 'ÇIKIŞ', style: 'destructive', onPress: () => { store.resetGame(); router.replace('/'); } },
        ],
      );
    }

    const activeContent = (
      <View style={s.flex}>
        <Text style={s.teamHint}>
          {store.team1.name.toUpperCase()} × {store.team2.name.toUpperCase()}
        </Text>
        <PlayerSearch
          team1Id={store.team1.apiId}
          team2Id={store.team2.apiId}
          placeholder="Oyuncu ara..."
          onCorrect={(detail) => handleCorrect(detail)}
          onWrong={handleWrong}
        />
        <TouchableOpacity style={[s.skipBtn, { marginTop: 16 }]} onPress={handlePassPress} activeOpacity={0.8}>
          <Text style={s.skipBtnText}>GEÇ</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <>
        <SplitScreen
          activePlayer={guesser}
          player1Name={store.player1Name}
          player2Name={store.player2Name}
          activeContent={activeContent}
          onHomePress={handleHomePress}
        />
        <Modal
          visible={!!resultCard}
          transparent
          animationType="fade"
          onRequestClose={() => resultOnClose?.()}
        >
          <View style={s.resultOverlay}>
            <View style={s.resultCard}>
              <Text style={s.resultBadge}>✅ DOĞRU!</Text>
              {resultCard?.playerPhoto ? (
                <Image
                  source={{ uri: resultCard.playerPhoto, headers: { Referer: 'https://www.transfermarkt.com/' } }}
                  style={s.resultPhoto}
                />
              ) : (
                <View style={s.resultPhotoPlaceholder} />
              )}
              <Text style={s.resultName}>{resultCard?.playerName}</Text>
              <View style={s.resultPeriods}>
                <View style={s.periodRow}>
                  <Text style={s.periodTeam}>{store.team1.name.toUpperCase()}</Text>
                  <Text style={s.periodYears}>{resultCard?.team1Period}</Text>
                </View>
                <View style={s.periodDivider} />
                <View style={s.periodRow}>
                  <Text style={s.periodTeam}>{store.team2.name.toUpperCase()}</Text>
                  <Text style={s.periodYears}>{resultCard?.team2Period}</Text>
                </View>
              </View>
              <TouchableOpacity style={s.resultBtn} onPress={() => resultOnClose?.()} activeOpacity={0.8}>
                <Text style={s.resultBtnText}>DEVAM →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
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
  homeBtn: { borderWidth: 1, borderColor: C.greenBorder, borderRadius: 6, paddingVertical: 12, alignItems: 'center' },
  homeBtnText: { color: C.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 3 },
  handoffTitle: { fontSize: 26, fontWeight: '900', color: C.green, letterSpacing: 3, textAlign: 'center', marginBottom: 12 },
  handoffSub: { fontSize: 13, color: C.textMuted, letterSpacing: 2, marginBottom: 40, textAlign: 'center' },
  teamHint: { fontSize: 10, color: C.textMuted, letterSpacing: 2, fontWeight: '700', marginBottom: 12 },

  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  resultCard: {
    width: '100%',
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.green,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  resultBadge: {
    fontSize: 13,
    fontWeight: '900',
    color: C.green,
    letterSpacing: 4,
    marginBottom: 20,
  },
  resultPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: C.green,
    marginBottom: 16,
  },
  resultPhotoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.bgActive,
    marginBottom: 16,
  },
  resultName: {
    fontSize: 20,
    fontWeight: '900',
    color: C.textWhite,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 24,
  },
  resultPeriods: {
    width: '100%',
    backgroundColor: C.bgActive,
    borderRadius: 8,
    paddingVertical: 4,
    marginBottom: 28,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  periodDivider: { height: 1, backgroundColor: C.greenBorder, marginHorizontal: 16 },
  periodTeam: { fontSize: 11, fontWeight: '700', color: C.textMuted, letterSpacing: 1, flex: 1 },
  periodYears: { fontSize: 13, fontWeight: '900', color: C.green, letterSpacing: 1 },
  resultBtn: {
    backgroundColor: C.greenBtn,
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  resultBtnText: { color: C.bg, fontSize: 15, fontWeight: '900', letterSpacing: 4 },
});
