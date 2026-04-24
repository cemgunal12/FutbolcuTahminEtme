// Uygulamanın tüm renk ve boyut sabitlerini tutan merkezi tema dosyası.
// Tüm StyleSheet'ler bu değerleri kullanır; değişiklik tek yerden yapılır.

export const C = {
  // Arka planlar
  bg: '#0a0d0a',           // Ana arka plan (neredeyse siyah-yeşil)
  bgCard: '#0f1a0f',       // Kart / input arka planı
  bgInput: '#132013',      // Input alanı
  bgActive: '#1a2e1a',     // Aktif yarı (split screen)
  bgDivider: '#1e3a1e',    // Bölücü çizgi arka planı

  // Yeşil ton skalası
  green: '#39e75f',        // Ana vurgu yeşili (başlık, skor)
  greenBtn: '#3dd16b',     // Buton yeşili
  greenBorder: '#2d5a2d',  // Kenar çizgisi
  greenDim: '#1e4a1e',     // Soluk yeşil (pasif metin)

  // Metin
  textWhite: '#ffffff',
  textGreen: '#39e75f',
  textMuted: '#3a6b3a',

  // Diğer
  divider: '#39e75f',      // Bölücü çizgi rengi
};

export const FONT = {
  title: 48,
  subtitle: 14,
  label: 13,
  button: 16,
  score: 36,
  playerNum: 32,
};
