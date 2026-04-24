// API-Football v3 — tüm fetch çağrıları burada.
// Kısıt: search parametresiyle team/league zorunlu (API şartı).
// Doğrulama: /transfers ile tek çağrıda tüm kariyer + dönem bilgisi alınır.

const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? '';
const BASE_URL = 'https://v3.football.api-sports.io';

console.log('[API] Key:', API_KEY.length > 0 ? `${API_KEY.slice(0, 6)}...` : 'BOŞ');

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

async function apiFetch<T>(endpoint: string, retry = true): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'x-apisports-key': API_KEY },
    });
    const data = await res.json();

    if (data.errors?.rateLimit) {
      if (retry) {
        console.warn('[API] Rate limit — 3sn bekleniyor...');
        await wait(3000);
        return apiFetch<T>(endpoint, false);
      }
      return null;
    }
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error('[API] Hata:', endpoint, JSON.stringify(data.errors));
      return null;
    }
    return data.response as T;
  } catch (err) {
    console.error('[API] Ağ hatası:', endpoint, err);
    return null;
  }
}

// ─── Takım arama ───────────────────────────────────────────────────────────

export interface TeamResult {
  team: { id: number; name: string; logo: string; country: string };
}

export async function searchTeams(query: string): Promise<TeamResult[]> {
  if (query.length < 3) return [];
  const r = await apiFetch<TeamResult[]>(`/teams?search=${encodeURIComponent(query)}`);
  return r ?? [];
}

// ─── Oyuncu arama ──────────────────────────────────────────────────────────

export interface PlayerResult {
  player: { id: number; name: string; photo: string; nationality: string };
  statistics: Array<{
    team: { id: number; name: string };
    league: { season: number };
  }>;
}

// Bir takımda isme göre ara — 2024'ten 2019'a kadar iner, ilk bulduğunda durur
async function searchInTeam(query: string, teamId: number): Promise<PlayerResult[]> {
  const q = encodeURIComponent(query);
  const seasons = [2024, 2023, 2022, 2021, 2020, 2019];
  for (const season of seasons) {
    const r = await apiFetch<PlayerResult[]>(
      `/players?search=${q}&team=${teamId}&season=${season}`
    );
    if (r && r.length > 0) return r;
    await wait(400);
  }
  return [];
}

// Her iki takımda sıralı ara, birleştir, tekilleştir
export async function searchPlayers(
  query: string,
  team1Id: number,
  team2Id: number
): Promise<PlayerResult[]> {
  if (query.length < 3) return [];
  const r1 = await searchInTeam(query, team1Id);
  await wait(600);
  const r2 = await searchInTeam(query, team2Id);

  const seen = new Set<number>();
  return [...r1, ...r2]
    .filter(p => !seen.has(p.player.id) && seen.add(p.player.id))
    .slice(0, 10);
}

// ─── Kariyer doğrulama ve dönem bilgisi ────────────────────────────────────

interface TransferEntry {
  player: { id: number; name: string };
  transfers: Array<{
    date: string;
    teams: {
      in: { id: number; name: string };
      out: { id: number; name: string };
    };
  }>;
}

export interface PlayerCareerDetail {
  playerName: string;
  playerPhoto: string;
  team1Period: string; // örn. "2014 - 2021"
  team2Period: string; // örn. "2021 - Günümüz"
  isCorrect: boolean;
}

// Transfer tarihlerinden bir takımda kaç yılında oynadığını hesaplar
function computePeriod(
  transfers: TransferEntry['transfers'],
  teamId: number
): string {
  // Bu takıma GİRİŞ transferleri
  const joinDates = transfers
    .filter(t => t.teams.in.id === teamId && t.date)
    .map(t => new Date(t.date).getFullYear())
    .sort((a, b) => a - b);

  // Bu takımdan ÇIKIŞ transferleri
  const leaveDates = transfers
    .filter(t => t.teams.out.id === teamId && t.date)
    .map(t => new Date(t.date).getFullYear())
    .sort((a, b) => a - b);

  if (joinDates.length === 0) return 'Bilinmiyor';

  const start = joinDates[0];
  const end = leaveDates.length > 0 ? leaveDates[leaveDates.length - 1] : null;

  return end ? `${start} - ${end}` : `${start} - Günümüz`;
}

// Sezon istatistiklerinden fallback dönem hesapla
async function getPeriodFromStats(
  playerId: number,
  team1Id: number,
  team2Id: number
): Promise<{ team1Seasons: number[]; team2Seasons: number[]; found: boolean }> {
  const seasons = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
  const t1: number[] = [];
  const t2: number[] = [];

  for (const season of seasons) {
    if (t1.length > 0 && t2.length > 0) break; // ikisini de bulduk
    const r = await apiFetch<PlayerResult[]>(`/players?id=${playerId}&season=${season}`);
    r?.forEach(p =>
      p.statistics.forEach(s => {
        if (s.team.id === team1Id && !t1.includes(season)) t1.push(season);
        if (s.team.id === team2Id && !t2.includes(season)) t2.push(season);
      })
    );
    await wait(300);
  }

  return {
    team1Seasons: t1.sort(),
    team2Seasons: t2.sort(),
    found: t1.length > 0 && t2.length > 0,
  };
}

// Ana doğrulama fonksiyonu — seçim yapıldıktan SONRA çağrılır
// Transfer geçmişiyle tüm kariyer taranır, dönem bilgisi hesaplanır
export async function verifyAndGetCareer(
  playerId: number,
  playerName: string,
  playerPhoto: string,
  team1Id: number,
  team2Id: number
): Promise<PlayerCareerDetail> {
  const transfers = await apiFetch<TransferEntry[]>(`/transfers?player=${playerId}`);

  if (transfers && transfers.length > 0) {
    const allTransfers = transfers.flatMap(t => t.transfers);
    const teamIds = new Set(
      allTransfers.flatMap(t => [t.teams.in.id, t.teams.out.id])
    );

    const isCorrect = teamIds.has(team1Id) && teamIds.has(team2Id);

    return {
      playerName,
      playerPhoto,
      team1Period: isCorrect ? computePeriod(allTransfers, team1Id) : '—',
      team2Period: isCorrect ? computePeriod(allTransfers, team2Id) : '—',
      isCorrect,
    };
  }

  // Transfer verisi yoksa sezon istatistiklerine bak
  const { team1Seasons, team2Seasons, found } = await getPeriodFromStats(
    playerId, team1Id, team2Id
  );

  const t1Period = team1Seasons.length > 0
    ? `${team1Seasons[0]} - ${team1Seasons[team1Seasons.length - 1]}`
    : '—';
  const t2Period = team2Seasons.length > 0
    ? `${team2Seasons[0]} - ${team2Seasons[team2Seasons.length - 1]}`
    : '—';

  return {
    playerName,
    playerPhoto,
    team1Period: t1Period,
    team2Period: t2Period,
    isCorrect: found,
  };
}
