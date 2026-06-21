import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Platform,
  KeyboardAvoidingView,
  InputAccessoryView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  searchPlayers,
  verifyAndGetCareer,
  PlayerResult,
  PlayerCareerDetail,
} from '../services/footballApi';
import { C } from '../theme';

const PASS_ACCESSORY_ID = 'player-search-pass';

interface Props {
  team1Id: string | null;
  team2Id: string | null;
  searchType?: 'club-club' | 'national-club';
  placeholder?: string;
  onCorrect: (detail: PlayerCareerDetail) => void;
  onWrong: (detail: PlayerCareerDetail) => void;
  onPass?: () => void;
  disabled?: boolean;
}

export default function PlayerSearch({
  team1Id,
  team2Id,
  searchType = 'club-club',
  placeholder = 'Oyuncu ara...',
  onCorrect,
  onWrong,
  onPass,
  disabled = false,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (timer.current) clearTimeout(timer.current);
      if (text.length < 3) { setResults([]); return; }

      timer.current = setTimeout(() => {
        setLoading(true);
        const data = searchPlayers(text, team1Id, team2Id, searchType);
        setResults(data);
        setLoading(false);
      }, 150);
    },
    [team1Id, team2Id, searchType]
  );

  async function handleSelect(item: PlayerResult) {
    setModalOpen(false);
    setQuery('');
    setResults([]);
    setSelectedName(item.player.name);

    const detail = await verifyAndGetCareer(
      item.player.id,
      item.player.name,
      item.player.photo,
      team1Id,
      team2Id,
      searchType,
    );

    if (detail.isCorrect) {
      onCorrect(detail);
    } else {
      setSelectedName('');
      onWrong(detail);
    }
  }

  function openModal() {
    if (disabled) return;
    setQuery('');
    setResults([]);
    setModalOpen(true);
  }

  function handlePass() {
    setModalOpen(false);
    onPass?.();
  }

  return (
    <>
      <TouchableOpacity
        style={[s.trigger, disabled && { opacity: 0.4 }]}
        onPress={openModal}
        activeOpacity={0.8}
      >
        <Text style={selectedName ? s.triggerFilled : s.triggerMuted}>
          {selectedName || placeholder}
        </Text>
        <Text style={{ fontSize: 16 }}>🔍</Text>
      </TouchableOpacity>

      <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <SafeAreaView style={s.modalSafe}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={s.header}>
              <Text style={s.headerTitle}>OYUNCU ARA</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)} style={s.closeBtn}>
                <Text style={s.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="Oyuncu adı yaz..."
                placeholderTextColor={C.textMuted}
                value={query}
                onChangeText={handleChange}
                autoFocus
                autoCorrect={false}
                autoCapitalize="words"
                clearButtonMode="while-editing"
                inputAccessoryViewID={onPass && Platform.OS === 'ios' ? PASS_ACCESSORY_ID : undefined}
              />
              {loading && (
                <ActivityIndicator size="small" color={C.green} style={{ marginRight: 14 }} />
              )}
            </View>

            {results.length > 0 ? (
              <FlatList
                data={results}
                keyExtractor={item => item.player.id}
                keyboardShouldPersistTaps="handled"
                style={s.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.listItem}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    {item.player.photo ? (
                      <Image
                        source={{ uri: item.player.photo, headers: { Referer: 'https://www.transfermarkt.com/' } }}
                        style={s.photo}
                      />
                    ) : (
                      <View style={s.photoPlaceholder} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={s.playerName}>{item.player.name}</Text>
                    </View>
                    <Text style={s.arrow}>›</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={s.sep} />}
              />
            ) : (
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>
                  {query.length < 3 ? 'En az 3 harf yaz...' : loading ? '' : 'Sonuç bulunamadı'}
                </Text>
              </View>
            )}

            {/* Android: klavye üstü GEÇ butonu */}
            {onPass && Platform.OS === 'android' && (
              <TouchableOpacity style={s.passBar} onPress={handlePass} activeOpacity={0.8}>
                <Text style={s.passBarText}>GEÇ</Text>
              </TouchableOpacity>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* iOS: klavyenin hemen üstüne yapışan toolbar */}
      {onPass && Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={PASS_ACCESSORY_ID}>
          <View style={s.passBar}>
            <TouchableOpacity onPress={handlePass} activeOpacity={0.8} style={s.passBarBtn}>
              <Text style={s.passBarText}>GEÇ</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </>
  );
}

const s = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  triggerMuted: { flex: 1, color: C.textMuted, fontSize: 14, letterSpacing: 1 },
  triggerFilled: { flex: 1, color: C.green, fontSize: 14, fontWeight: '700', letterSpacing: 1 },

  modalSafe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.greenBorder,
  },
  headerTitle: { fontSize: 14, fontWeight: '900', color: C.green, letterSpacing: 4 },
  closeBtn: { padding: 8 },
  closeBtnText: { color: C.textMuted, fontSize: 18, fontWeight: '700' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: C.greenBorder,
  },
  input: {
    flex: 1,
    color: C.textWhite,
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  list: { flex: 1 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sep: { height: 1, backgroundColor: C.greenBorder, marginLeft: 74 },
  photo: { width: 46, height: 46, borderRadius: 23, marginRight: 14 },
  photoPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.bgActive,
    marginRight: 14,
  },
  playerName: { color: C.textWhite, fontSize: 15, fontWeight: '700' },
  arrow: { color: C.greenBorder, fontSize: 24 },

  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: C.textMuted, fontSize: 13, letterSpacing: 2 },

  passBar: {
    backgroundColor: C.bgCard,
    borderTopWidth: 1,
    borderTopColor: C.greenBorder,
    paddingVertical: 12,
    alignItems: 'center',
  },
  passBarBtn: { paddingHorizontal: 32, paddingVertical: 4 },
  passBarText: { color: C.textMuted, fontSize: 14, fontWeight: '700', letterSpacing: 4 },
});
