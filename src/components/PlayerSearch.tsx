// Oyuncu arama bileşeni — kullanıcı yazarken API'dan oyuncu önerileri getirir.
// İki takım ID'si verildiğinde sadece her iki takımda da oynamış oyuncuları filtreler.
// Doğrulama sonucunu onResult callback'iyle üst bileşene bildirir.

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { searchPlayers, PlayerResult } from '../services/footballApi';

interface PlayerSearchProps {
  team1Id: number | null;
  team2Id: number | null;
  placeholder?: string;
  onCorrect: (playerName: string) => void;
  onWrong: (playerName: string) => void;
  disabled?: boolean;
}

export default function PlayerSearch({
  team1Id,
  team2Id,
  placeholder = 'Oyuncu adı yaz...',
  onCorrect,
  onWrong,
  disabled = false,
}: PlayerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (text: string) => {
      if (disabled) return;
      setQuery(text);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (text.length < 2) {
        setResults([]);
        return;
      }

      debounceTimer.current = setTimeout(async () => {
        setLoading(true);
        const data = await searchPlayers(text);

        // Her iki takım ID'si de varsa filtrele
        const filtered =
          team1Id && team2Id
            ? data.filter((p) => {
                const ids = p.statistics.map((s) => s.team.id);
                return ids.includes(team1Id) && ids.includes(team2Id);
              })
            : data;

        setResults(filtered.slice(0, 8));
        setLoading(false);
      }, 400);
    },
    [disabled, team1Id, team2Id]
  );

  async function handleSelect(item: PlayerResult) {
    setResults([]);
    setQuery(item.player.name);
    setVerifying(true);

    // Seçilen oyuncunun her iki takımda da oynadığını doğrula
    if (team1Id && team2Id) {
      const teamIds = item.statistics.map((s) => s.team.id);
      const isCorrect =
        teamIds.includes(team1Id) && teamIds.includes(team2Id);

      setVerifying(false);
      if (isCorrect) {
        onCorrect(item.player.name);
      } else {
        onWrong(item.player.name);
        setQuery('');
      }
    } else {
      setVerifying(false);
      onCorrect(item.player.name);
    }
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
          editable={!disabled && !verifying}
        />
        {(loading || verifying) && (
          <ActivityIndicator size="small" color="#f59e0b" />
        )}
      </View>

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.player.id)}
          className="bg-slate-800 rounded-xl mt-1 border border-slate-600 max-h-52"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 border-b border-slate-700"
              onPress={() => handleSelect(item)}
            >
              {item.player.photo ? (
                <Image
                  source={{ uri: item.player.photo }}
                  className="w-8 h-8 rounded-full mr-3"
                />
              ) : null}
              <View>
                <Text className="text-white font-medium">{item.player.name}</Text>
                <Text className="text-slate-400 text-xs">
                  {item.statistics[0]?.team?.name ?? ''}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
