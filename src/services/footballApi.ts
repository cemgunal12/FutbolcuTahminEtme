import playersRaw from '../data/players.json';
import clubsRaw from '../data/clubs.json';
import nationalTeamsRaw from '../data/national_teams.json';

interface PlayerEntry {
  id: string;
  name: string;
  photo: string;
  clubs: string[];
  nationalTeams: string[];
}

export interface TeamResult {
  team: { id: string; name: string; logo: string; country: string };
}

export interface PlayerResult {
  player: { id: string; name: string; photo: string; nationality: string };
  statistics: Array<{ team: { id: string; name: string }; league: { season: number } }>;
}

export interface PlayerCareerDetail {
  playerName: string;
  playerPhoto: string;
  team1Period: string;
  team2Period: string;
  isCorrect: boolean;
}

const players = playersRaw as PlayerEntry[];
const clubs = clubsRaw as Record<string, string>;
const nationalTeams = nationalTeamsRaw as Record<string, { name: string; flag: string }>;

export function searchTeams(query: string): TeamResult[] {
  if (query.length < 2) return [];
  const q = query.toLowerCase();
  return Object.entries(clubs)
    .filter(([, name]) => name.toLowerCase().includes(q))
    .slice(0, 7)
    .map(([id, name]) => ({
      team: {
        id,
        name,
        logo: `https://tmssl.akamaized.net/images/wappen/head/${id}.png`,
        country: '',
      },
    }));
}

export function searchNationalTeams(query: string): TeamResult[] {
  if (query.length < 2) return [];
  const q = query.toLowerCase();
  return Object.entries(nationalTeams)
    .filter(([, nt]) => nt.name.toLowerCase().includes(q))
    .slice(0, 7)
    .map(([id, nt]) => ({ team: { id, name: nt.name, logo: nt.flag, country: '' } }));
}

export function searchPlayers(
  query: string,
  team1Id: string | null,
  team2Id: string | null,
  searchType: 'club-club' | 'national-club' = 'club-club',
): PlayerResult[] {
  if (query.length < 3) return [];
  const q = query.toLowerCase();

  return players
    .filter(p => p.name.toLowerCase().includes(q))
    .slice(0, 10)
    .map(p => ({
      player: { id: p.id, name: p.name, photo: p.photo, nationality: '' },
      statistics: [],
    }));
}

export async function verifyAndGetCareer(
  playerId: string,
  playerName: string,
  playerPhoto: string,
  team1Id: string | null,
  team2Id: string | null,
  searchType: 'club-club' | 'national-club' = 'club-club',
): Promise<PlayerCareerDetail> {
  const player = players.find(p => p.id === playerId);
  let isCorrect = false;
  if (player && team1Id && team2Id) {
    isCorrect = searchType === 'club-club'
      ? player.clubs.includes(team1Id) && player.clubs.includes(team2Id)
      : player.nationalTeams.includes(team1Id) && player.clubs.includes(team2Id);
  }
  return { playerName, playerPhoto, team1Period: '—', team2Period: '—', isCorrect };
}
