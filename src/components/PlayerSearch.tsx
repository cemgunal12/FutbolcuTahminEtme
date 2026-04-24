// Oyuncu arama ve tahmin bileşeni.
// Kullanıcı yazarken API'dan öneriler gelir. İki takım ID'si varsa filtreler.
// onCorrect / onWrong ile sonucu üst bileşene bildirir.

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { searchPlayers, PlayerResult } from '../services/footballApi';
import { C } from '../theme';

interface Props {
  team1Id: number | null;
  team2Id: number | null;
  placeholder?: string;
  onCorrect: (name: string) => void;
  onWrong: (name: string) => void;
  disabled?: boolean;
}

export default function PlayerSearch({
  team1Id, team2Id,
  placeholder = 'TAHMİN',
  onCorrect, onWrong,
  disabled = false,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((text: string) => {
    if (disabled) return;
    setQuery(text);
    if (timer.current) clearTimeout(timer.current);
    if (text.length < 2) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchPlayers(text);
      // Her iki takımda oynamış oyuncuları filtrele
      const filtered = (team1Id && team2Id)
        ? data.filter(p => {
            const ids = p.statistics.map(s => s.team.id);
            return ids.includes(team1Id) && ids.includes(team2Id);
          })
        : data;
      setResults(filtered.slice(0, 7));
      setLoading(false);
    }, 400);
  }, [disabled, team1Id, team2Id]);

  function handleSelect(item: PlayerResult) {
    setResults([]);
    setQuery(item.player.name.toUpperCase());
    if (team1Id && team2Id) {
      const ids = item.statistics.map(s => s.team.id);
      if (ids.includes(team1Id) && ids.includes(team2Id)) {
        onCorrect(item.player.name);
      } else {
        onWrong(item.player.name);
        setQuery('');
      }
    } else {
      onCorrect(item.player.name);
    }
  }

  return (
    <View>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          value={query}
          onChangeText={handleChange}
          autoCorrect={false}
          autoCapitalize="characters"
          editable={!disabled}
        />
        {loading && <ActivityIndicator size="small" color={C.green} style={{ marginRight: 12 }} />}
      </View>

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={item => String(item.player.id)}
          style={s.dropdown}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={s.dropItem} onPress={() => handleSelect(item)}>
              {item.player.photo
                ? <Image source={{ uri: item.player.photo }} style={s.photo} />
                : null
              }
              <View>
                <Text style={s.dropName}>{item.player.name.toUpperCase()}</Text>
                <Text style={s.dropSub}>{item.statistics[0]?.team?.name ?? ''}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 6,
  },
  input: {
    flex: 1,
    color: C.textWhite,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdown: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 6,
    marginTop: 4,
    maxHeight: 200,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.greenDim,
  },
  photo: { width: 28, height: 28, borderRadius: 14, marginRight: 12 },
  dropName: { color: C.green, fontWeight: '700', fontSize: 13, letterSpacing: 1 },
  dropSub: { color: C.textMuted, fontSize: 10, marginTop: 1 },
});
