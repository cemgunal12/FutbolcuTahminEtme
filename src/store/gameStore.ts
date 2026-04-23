// Oyunun tüm global state'ini Zustand ile yöneten merkezi store.
// Mod 1 (Takım Tahmin) ve Mod 2 (Ülke & Takım) için ortak ve ayrı state'ler burada.
// Hiçbir component bu store dışından başka bir componente state geçirmemeli.

import { create } from 'zustand';

export type GameMode = 'mode1' | 'mode2';
export type WinScore = 3 | 5 | 7 | 10;

// Mod 1'deki bir turdaki takım bilgisi
export interface TeamInfo {
  name: string;
  apiId: number | null;
}

// Mod 1 tur aşamaları
export type Mode1Phase =
  | 'team-select'      // P1 takımını girer, sonra P2
  | 'countdown'        // 3-2-1 geri sayım
  | 'reveal'           // İki takım açıklanıyor
  | 'hazir'            // HAZIR butonu bekleniyor (yatay ekran)
  | 'guessing'         // Aktif oyuncu ortak oyuncu tahmin ediyor
  | 'round-end';       // Tur bitti, sıradaki tura geçiş

// Mod 2 tur aşamaları
export type Mode2Phase =
  | 'choosing'         // Sıradaki oyuncu ülke/takım giriyor
  | 'hazir'            // Diğer oyuncu HAZIR'a basacak
  | 'guessing'         // Tahmin yapılıyor
  | 'round-end';

export interface GameState {
  // --- Ortak ---
  player1Name: string;
  player2Name: string;
  gameMode: GameMode | null;
  winScore: WinScore;
  score1: number;
  score2: number;
  currentTurn: 1 | 2; // Kimin sırası (seçim yapan)

  // --- Mod 1 ---
  mode1Phase: Mode1Phase;
  team1: TeamInfo;          // P1'in seçtiği takım
  team2: TeamInfo;          // P2'in seçtiği takım
  teamSelectStep: 1 | 2;   // Önce P1 girer (1), sonra P2 (2)
  activeGuesser: 1 | 2 | null; // HAZIR'a ilk basan
  p1Passed: boolean;        // P1 geçti mi
  p2Passed: boolean;        // P2 geçti mi

  // --- Mod 2 ---
  mode2Phase: Mode2Phase;
  currentClue: string;      // Seçilen ülke/takım adı
  chooserIndex: 1 | 2;     // Satranç mantığı: kim seçiyor (gizli)

  // --- Actions ---
  setPlayers: (p1: string, p2: string) => void;
  setGameMode: (mode: GameMode) => void;
  setWinScore: (score: WinScore) => void;
  resetGame: () => void;

  // Mod 1 actions
  setTeam: (player: 1 | 2, team: TeamInfo) => void;
  setMode1Phase: (phase: Mode1Phase) => void;
  setActiveGuesser: (player: 1 | 2) => void;
  addScore: (player: 1 | 2) => void;
  setPass: (player: 1 | 2, value: boolean) => void;
  nextMode1Round: () => void;
  setTeamSelectStep: (step: 1 | 2) => void;

  // Mod 2 actions
  setMode2Phase: (phase: Mode2Phase) => void;
  setCurrentClue: (clue: string) => void;
  nextMode2Round: (correct: boolean) => void;
}

const initialState = {
  player1Name: '',
  player2Name: '',
  gameMode: null as GameMode | null,
  winScore: 5 as WinScore,
  score1: 0,
  score2: 0,
  currentTurn: 1 as 1 | 2,
  mode1Phase: 'team-select' as Mode1Phase,
  team1: { name: '', apiId: null } as TeamInfo,
  team2: { name: '', apiId: null } as TeamInfo,
  teamSelectStep: 1 as 1 | 2,
  activeGuesser: null as 1 | 2 | null,
  p1Passed: false,
  p2Passed: false,
  mode2Phase: 'choosing' as Mode2Phase,
  currentClue: '',
  chooserIndex: 1 as 1 | 2,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setPlayers: (p1, p2) => set({ player1Name: p1, player2Name: p2 }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setWinScore: (score) => set({ winScore: score }),

  resetGame: () => set({ ...initialState }),

  // Mod 1 actions
  setTeam: (player, team) =>
    set(player === 1 ? { team1: team } : { team2: team }),

  setMode1Phase: (phase) => set({ mode1Phase: phase }),

  setTeamSelectStep: (step) => set({ teamSelectStep: step }),

  setActiveGuesser: (player) => set({ activeGuesser: player }),

  addScore: (player) =>
    set((state) => ({
      score1: player === 1 ? state.score1 + 1 : state.score1,
      score2: player === 2 ? state.score2 + 1 : state.score2,
    })),

  setPass: (player, value) =>
    set(player === 1 ? { p1Passed: value } : { p2Passed: value }),

  nextMode1Round: () =>
    set((state) => ({
      mode1Phase: 'team-select',
      team1: { name: '', apiId: null },
      team2: { name: '', apiId: null },
      // Her turda seçim sırası değişir
      teamSelectStep: 1,
      currentTurn: state.currentTurn === 1 ? 2 : 1,
      activeGuesser: null,
      p1Passed: false,
      p2Passed: false,
    })),

  // Mod 2 actions
  setMode2Phase: (phase) => set({ mode2Phase: phase }),
  setCurrentClue: (clue) => set({ currentClue: clue }),

  nextMode2Round: (correct) =>
    set((state) => ({
      mode2Phase: 'choosing',
      currentClue: '',
      // Doğruysa +1, sonra roller değişir; yanlışsa roller değişmeden devam
      chooserIndex: state.chooserIndex === 1 ? 2 : 1,
    })),
}));
