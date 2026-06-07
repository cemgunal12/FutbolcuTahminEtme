import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { searchTeams, searchNationalTeams, TeamResult } from '../services/footballApi';
import { C } from '../theme';

interface Props {
  placeholder?: string;
  onSelect: (name: string, id: string) => void;
  initialValue?: string;
  searchType?: 'club' | 'national';
}

export default function TeamSearch({
  placeholder = 'TAKIM ARA...',
  onSelect,
  initialValue = '',
  searchType = 'club',
}: Props) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<TeamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(!!initialValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((text: string) => {
    setQuery(text);
    setConfirmed(false);
    if (timer.current) clearTimeout(timer.current);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(() => {
      setLoading(true);
      const data = searchType === 'national'
        ? searchNationalTeams(text)
        : searchTeams(text);
      setResults(data);
      setLoading(false);
    }, 200);
  }, [searchType]);

  function handleSelect(item: TeamResult) {
    setQuery(item.team.name);
    setResults([]);
    setConfirmed(true);
    onSelect(item.team.name, item.team.id);
  }

  return (
    <View style={s.wrapper}>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          value={query}
          onChangeText={handleChange}
          autoCorrect={false}
          autoCapitalize="words"
        />
        {loading
          ? <ActivityIndicator size="small" color={C.green} style={{ marginRight: 12 }} />
          : confirmed
          ? <Text style={s.tick}>✓</Text>
          : <Text style={s.chevron}>▾</Text>
        }
      </View>

      {results.length > 0 && (
        <View style={s.dropdownContainer}>
          <ScrollView
            style={{ maxHeight: 240 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {results.map((item) => (
              <TouchableOpacity
                key={String(item.team.id)}
                style={s.dropItem}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                {item.team.logo ? (
                  <Image
                    source={{ uri: item.team.logo }}
                    style={s.logo}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={s.logoPlaceholder} />
                )}
                <View>
                  <Text style={s.dropName}>{item.team.name}</Text>
                  {item.team.country ? (
                    <Text style={s.dropSub}>{item.team.country}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const INPUT_HEIGHT = 52;

const s = StyleSheet.create({
  wrapper: {
    zIndex: 999,
    elevation: 999,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 6,
    height: INPUT_HEIGHT,
  },
  input: {
    flex: 1,
    color: C.green,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 16,
  },
  tick: { color: C.green, fontSize: 18, marginRight: 14, fontWeight: '700' },
  chevron: { color: C.textMuted, fontSize: 18, marginRight: 14 },
  dropdownContainer: {
    position: 'absolute',
    top: INPUT_HEIGHT + 2,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 6,
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
  logoPlaceholder: {
    width: 26,
    height: 26,
    marginRight: 12,
    backgroundColor: C.bgActive,
    borderRadius: 4,
  },
  dropName: { color: C.green, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  dropSub: { color: C.textMuted, fontSize: 10, marginTop: 2 },
});
