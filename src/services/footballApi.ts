// API-Football v3 ile tüm iletişimi bu dosya yönetir.
// fetch çağrıları yalnızca bu dosyada yapılır; başka hiçbir yerde API çağrısı olmaz.
// Hata durumlarında null veya boş dizi döner, üst katman buna göre davranır.

const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? '';
const BASE_URL = 'https://v3.football.api-sports.io';

const headers = {
  'x-apisports-key': API_KEY,
  'Content-Type': 'application/json',
};

async function apiFetch<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
    if (!response.ok) {
      console.error(`API hatası: ${response.status} - ${endpoint}`);
      return null;
    }
    const data = await response.json();
    // API-Football her zaman { response: [...] } formatında döner
    return data.response as T;
  } catch (error) {
    console.error(`Ağ hatası: ${endpoint}`, error);
    return null;
  }
}

// Takım adına göre arama (autocomplete için)
export interface TeamResult {
  team: {
    id: number;
    name: string;
    logo: string;
    country: string;
  };
}

export async function searchTeams(query: string): Promise<TeamResult[]> {
  if (query.length < 2) return [];
  const result = await apiFetch<TeamResult[]>(`/teams?search=${encodeURIComponent(query)}`);
  return result ?? [];
}

// Oyuncu adına göre arama — belirli bir takımda arama yapar
export interface PlayerResult {
  player: {
    id: number;
    name: string;
    photo: string;
    nationality: string;
  };
  statistics: Array<{
    team: { id: number; name: string };
  }>;
}

export async function searchPlayers(query: string): Promise<PlayerResult[]> {
  if (query.length < 2) return [];
  const result = await apiFetch<PlayerResult[]>(`/players?search=${encodeURIComponent(query)}&season=2024`);
  return result ?? [];
}

// Belirli bir takımın oyuncularını getir (kadro)
export async function getTeamPlayers(teamId: number): Promise<PlayerResult[]> {
  const result = await apiFetch<PlayerResult[]>(`/players?team=${teamId}&season=2024`);
  return result ?? [];
}

// İki takımın ortak oyuncularını bul (sezon 2024 istatistikleri üzerinden)
export async function getCommonPlayers(
  team1Id: number,
  team2Id: number
): Promise<PlayerResult[]> {
  const [squad1, squad2] = await Promise.all([
    getTeamPlayers(team1Id),
    getTeamPlayers(team2Id),
  ]);

  const squad2Ids = new Set(squad2.map((p) => p.player.id));
  return squad1.filter((p) => squad2Ids.has(p.player.id));
}

// Ülke listesi (Mod 2 için)
export interface CountryResult {
  name: string;
  code: string;
  flag: string;
}

export async function searchCountries(query: string): Promise<CountryResult[]> {
  if (query.length < 2) return [];
  const result = await apiFetch<CountryResult[]>(`/countries?search=${encodeURIComponent(query)}`);
  return result ?? [];
}

// Bir oyuncunun belirli iki takımda oynayıp oynamadığını doğrula
export async function verifyPlayerInBothTeams(
  playerName: string,
  team1Id: number,
  team2Id: number
): Promise<boolean> {
  const result = await apiFetch<PlayerResult[]>(
    `/players?search=${encodeURIComponent(playerName)}&season=2024`
  );
  if (!result || result.length === 0) return false;

  return result.some((p) => {
    const teamIds = p.statistics.map((s) => s.team.id);
    return teamIds.includes(team1Id) && teamIds.includes(team2Id);
  });
}
