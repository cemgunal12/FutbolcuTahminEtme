// Takım arama bileşeni — kullanıcı yazarken API'dan takım önerileri getirir.
// Seçim yapıldığında onSelect callback'ine takım adı ve ID'si iletilir.
// Debounce ile API istek sayısı sınırlandırılır.

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { searchTeams, TeamResult } from '../services/footballApi';

interface TeamSearchProps {
  placeholder?: string;
  onSelect: (name: string, id: number) => void;
  value?: string;
}

export default function TeamSearch({
  placeholder = 'Takım adı girin...',
  onSelect,
  value = '',
}: TeamSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<TeamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((text: string) => {
    setQuery(text);
    setSelected(false);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (text.length < 2) {
      setResults([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchTeams(text);
      setResults(data.slice(0, 8)); // Maksimum 8 öneri
      setLoading(false);
    }, 400);
  }, []);

  function handleSelect(item: TeamResult) {
    setQuery(item.team.name);
    setResults([]);
    setSelected(true);
    onSelect(item.team.name, item.team.id);
  }

  return (
    <View className="w-full">
      <View className="flex-row items-center bg-slate-700 rounded-xl px-4 py-3 border border-slate-600">
        <TextInput
          className="flex-1 text-white text-base"
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          value={query}
          onChangeText={handleChange}
          autoCorrect={false}
          autoCapitalize="words"
        />
        {loading && <ActivityIndicator size="small" color="#f59e0b" />}
        {selected && !loading && (
          <Text className="text-green-400 text-lg">✓</Text>
        )}
      </View>

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.team.id)}
          className="bg-slate-800 rounded-xl mt-1 border border-slate-600 max-h-48"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 border-b border-slate-700"
              onPress={() => handleSelect(item)}
            >
              {item.team.logo ? (
                <Image
                  source={{ uri: item.team.logo }}
                  className="w-7 h-7 mr-3"
                  resizeMode="contain"
                />
              ) : null}
              <View>
                <Text className="text-white font-medium">{item.team.name}</Text>
                <Text className="text-slate-400 text-xs">{item.team.country}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
