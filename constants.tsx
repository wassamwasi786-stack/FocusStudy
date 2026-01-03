
import { Palette, ThemeType } from './types';

export const THEMES: Record<ThemeType, Palette> = {
  dark: {
    name: 'Neon Night',
    bg: 'bg-[#0B132B]',
    gradient: 'linear-gradient(135deg, #0B132B 0%, #1C2541 100%)',
    card: 'bg-[#1C2541]/80',
    text: 'text-[#FFFFFF]',
    accent: 'bg-[#5BC0BE]',
    subtleText: 'text-[#6FFFE9]/60',
    progressBg: 'bg-[#3A506B]',
    particle: 'rgba(91, 192, 190, 0.4)',
    isDark: true
  },
  midnight: {
    name: 'Midnight Bloom',
    bg: 'bg-[#1a1a2e]',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    card: 'bg-[#0f3460]/70',
    text: 'text-[#e94560]',
    accent: 'bg-[#e94560]',
    subtleText: 'text-[#e94560]/40',
    progressBg: 'bg-[#16213e]',
    particle: 'rgba(233, 69, 96, 0.3)',
    isDark: true
  },
  mint: {
    name: 'Arctic Mint',
    bg: 'bg-[#E0F2F1]',
    gradient: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)',
    card: 'bg-white/60',
    text: 'text-[#004D40]',
    accent: 'bg-[#26A69A]',
    subtleText: 'text-[#00796B]/50',
    progressBg: 'bg-[#B2DFDB]',
    particle: 'rgba(38, 166, 154, 0.3)',
    isDark: false
  },
  gold: {
    name: 'Imperial Gold',
    bg: 'bg-[#1A1A1A]',
    gradient: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
    card: 'bg-[#333333]/80',
    text: 'text-[#D4AF37]',
    accent: 'bg-[#D4AF37]',
    subtleText: 'text-[#C5A028]/40',
    progressBg: 'bg-[#444444]',
    particle: 'rgba(212, 175, 55, 0.5)',
    isDark: true
  },
  ocean: {
    name: 'Deep Pacific',
    bg: 'bg-[#001d3d]',
    gradient: 'linear-gradient(135deg, #001d3d 0%, #003566 100%)',
    card: 'bg-[#003566]/60',
    text: 'text-[#ffc300]',
    accent: 'bg-[#ffc300]',
    subtleText: 'text-[#ffc300]/50',
    progressBg: 'bg-[#001d3d]',
    particle: 'rgba(255, 195, 0, 0.4)',
    isDark: true
  },
  sunset: {
    name: 'Golden Hour',
    bg: 'bg-[#ff7b00]',
    gradient: 'linear-gradient(135deg, #ff7b00 0%, #ffb700 100%)',
    card: 'bg-white/20',
    text: 'text-[#ffffff]',
    accent: 'bg-[#902e11]',
    subtleText: 'text-[#ffffff]/60',
    progressBg: 'bg-[#ff7b00]',
    particle: 'rgba(255, 255, 255, 0.5)',
    isDark: false
  },
  pastel: {
    name: 'Peach Sorbet',
    bg: 'bg-[#FDF6F0]',
    gradient: 'linear-gradient(135deg, #FDF6F0 0%, #FFE5D9 100%)',
    card: 'bg-white/70',
    text: 'text-[#5D4E4E]',
    accent: 'bg-[#D4A373]', 
    subtleText: 'text-[#B09B9B]',
    progressBg: 'bg-[#F0E4E4]',
    particle: 'rgba(212, 163, 115, 0.3)',
    isDark: false
  },
  lavender: {
    name: 'Lavender Haze',
    bg: 'bg-[#F3E8FF]',
    gradient: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
    card: 'bg-white/60',
    text: 'text-[#5B447A]',
    accent: 'bg-[#9333EA]',
    subtleText: 'text-[#7C3AED]/60',
    progressBg: 'bg-[#DDD6FE]',
    particle: 'rgba(147, 51, 234, 0.4)',
    isDark: false
  },
  earth: {
    name: 'Sage Forest',
    bg: 'bg-[#E3E7D3]',
    gradient: 'linear-gradient(135deg, #E3E7D3 0%, #C7D1B1 100%)',
    card: 'bg-[#F2F4E9]/80',
    text: 'text-[#3E4A3E]',
    accent: 'bg-[#6D8B74]',
    subtleText: 'text-[#7D7D7D]',
    progressBg: 'bg-[#C2C9A9]',
    particle: 'rgba(109, 139, 116, 0.3)',
    isDark: false
  }
};

export const SESSION_DURATIONS = {
  work: 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60
};

export const POMODOROS_BEFORE_LONG_BREAK = 4;
