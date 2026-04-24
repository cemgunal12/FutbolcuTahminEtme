// Takım arama bileşeni: kullanıcı yazar, dropdown listesi açılır.
// Seçim sonrası onSelect callback'i tetiklenir. Debounce ile API yükü azaltılır.

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
import { searchTeams, TeamResult } from '../services/footballApi';
import { C } from '../theme';

interface Props {
  placeholder?: string;
  onSelect: (name: string, id: number) => void;
  initialValue?: string;
}

export default function TeamSearch({ placeholder = 'TAKIM ARA...', onSelect, initialValue = '' }: Props) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<TeamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(!!initialValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((text: string) => {
    setQuery(text);
    setConfirmed(false);
    if (timer.current) clearTimeout(timer.current);
    if (text.length < 2) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchTeams(text);
      setResults(data.slice(0, 7));
      setLoading(false);
    }, 400);
  }, []);

  function handleSelect(item: TeamResult) {
    setQuery(item.team.name.toUpperCase());
    setResults([]);
    setConfirmed(true);
    onSelect(item.team.name, item.team.id);
  }

  return (
    <View>
      {/* Input satırı */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          value={query}
          onChangeText={handleChange}
          autoCorrect={false}
          autoCapitalize="characters"
        />
        {loading
          ? <ActivityIndicator size="small" color={C.green} style={{ marginRight: 12 }} />
          : confirmed
          ? <Text style={s.tick}>✓</Text>
          : <Text style={s.chevron}>▾</Text>
        }
      </View>

      {/* Dropdown sonuçları */}
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.team.id)}
          style={s.dropdown}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={s.dropItem} onPress={() => handleSelect(item)}>
              {item.team.logo ? (
                <Image source={{ uri: item.team.logo }} style={s.logo} resizeMode="contain" />
              ) : null}
              <View>
                <Text style={s.dropName}>{item.team.name.toUpperCase()}</Text>
                <Text style={s.dropSub}>{item.team.country}</Text>
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
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 6,
  },
  input: {
    flex: 1,
    color: C.green,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tick: { color: C.green, fontSize: 18, marginRight: 14, fontWeight: '700' },
  chevron: { color: C.textMuted, fontSize: 18, marginRight: 14 },
  dropdown: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 6,
    marginTop: 4,
    maxHeight: 230,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.greenDim,
  },
  logo: { width: 26, height: 26, marginRight: 12 },
  dropName: { color: C.green, fontWeight: '700', fontSize: 13, letterSpacing: 1 },
  dropSub: { color: C.textMuted, fontSize: 10, marginTop: 1, letterSpacing: 1 },
});
