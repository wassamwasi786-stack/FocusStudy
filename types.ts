
export type ThemeType = 'pastel' | 'earth' | 'dark' | 'lavender' | 'midnight' | 'ocean' | 'sunset' | 'mint' | 'gold';

export type SessionType = 'work' | 'short-break' | 'long-break';

export type ClockStyle = 'serif' | 'sans' | 'mono' | 'rounded';

export interface SessionDurations {
  work: number;
  'short-break': number;
  'long-break': number;
}

export interface Palette {
  name: string;
  bg: string;
  gradient: string;
  card: string;
  text: string;
  accent: string;
  subtleText: string;
  progressBg: string;
  particle: string;
  isDark: boolean;
}

export interface TimerState {
  secondsRemaining: number;
  isActive: boolean;
  currentSession: SessionType;
  sessionsCompleted: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: SessionType;
  durationMinutes: number;
}
