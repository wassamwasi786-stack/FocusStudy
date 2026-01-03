import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Clock, Sparkles, SkipForward, Brain, Coffee, Trees, Palette as PaletteIcon, Eraser, Maximize, Minimize, Award, Quote, ChevronRight, Loader2, Type as TypeIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

import { ThemeType, TimerState, SessionType, SessionDurations, HistoryItem, ClockStyle } from './types';
import { THEMES, SESSION_DURATIONS, POMODOROS_BEFORE_LONG_BREAK } from './constants';
import Background from './components/Background';
import ProgressDots from './components/ProgressDots';
import EncouragementPopUp from './components/EncouragementPopUp';
import HistoryModal from './components/HistoryModal';
import BreakAnimation from './components/BreakAnimation';
import { fetchMotivationalQuote } from './services/geminiService';

const App: React.FC = () => {
  // --- PERSISTENCE ---
  const [theme, setTheme] = useState<ThemeType>(() => {
    try {
      return (localStorage.getItem('auraTheme') as ThemeType) || 'dark';
    } catch { return 'dark'; }
  });
  
  const [clockStyle, setClockStyle] = useState<ClockStyle>(() => {
    try {
      return (localStorage.getItem('auraClockStyle') as ClockStyle) || 'serif';
    } catch { return 'serif'; }
  });
  
  const [durations, setDurations] = useState<SessionDurations>(() => {
    try {
      const saved = localStorage.getItem('auraDurations');
      return saved ? JSON.parse(saved) : SESSION_DURATIONS;
    } catch { return SESSION_DURATIONS; }
  });
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('auraHistory');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [customParticleColor, setCustomParticleColor] = useState<string | null>(() => {
    try {
      return localStorage.getItem('auraParticleColor');
    } catch { return null; }
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isTimerHovered, setIsTimerHovered] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenToast, setShowFullscreenToast] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [liveQuote, setLiveQuote] = useState<{ text: string; author: string }>({
    text: "Patience and focus are the dual wings of progress.",
    author: "FocusStudy"
  });

  const [timerState, setTimerState] = useState<TimerState>(() => {
    let savedProgress = 0;
    try {
      savedProgress = parseInt(localStorage.getItem('auraProgress') || '0');
    } catch { savedProgress = 0; }
    
    return {
      secondsRemaining: durations.work,
      isActive: false,
      currentSession: 'work',
      sessionsCompleted: savedProgress
    };
  });

  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const palette = THEMES[theme];

  // --- SYNC ---
  useEffect(() => {
    localStorage.setItem('auraTheme', theme);
    localStorage.setItem('auraClockStyle', clockStyle);
    localStorage.setItem('auraDurations', JSON.stringify(durations));
    localStorage.setItem('auraProgress', timerState.sessionsCompleted.toString());
    localStorage.setItem('auraHistory', JSON.stringify(history));
    if (customParticleColor) localStorage.setItem('auraParticleColor', customParticleColor);
    else localStorage.removeItem('auraParticleColor');
  }, [theme, clockStyle, durations, timerState.sessionsCompleted, history, customParticleColor]);

  // --- INITIAL QUOTE & MOBILE FS ---
  useEffect(() => {
    const loadInitialQuote = async () => {
      setIsQuoteLoading(true);
      const newQuote = await fetchMotivationalQuote(timerState.currentSession);
      if (newQuote) setLiveQuote(newQuote);
      setIsQuoteLoading(false);
    };
    loadInitialQuote();

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && !document.fullscreenElement) {
      const timer = setTimeout(() => setShowFullscreenToast(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // --- FULLSCREEN ---
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error entering full-screen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(e => console.error(e));
    }
    setShowFullscreenToast(false);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (document.fullscreenElement) setShowFullscreenToast(false);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // --- AUDIO ---
  const playZenChime = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  }, []);

  const triggerCelebration = useCallback(() => {
    confetti({
      particleCount: 120,
      spread: 60,
      origin: { y: 0.6 },
      colors: [palette.accent.replace('bg-[', '').replace(']', ''), '#FFFFFF', '#FFD700'],
    });
  }, [palette.accent]);

  // --- TIMER HANDLER ---
  const handleSessionEnd = useCallback(async () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    
    playZenChime();

    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    const currentSessionType = timerState.currentSession;
    const duration = Math.floor(durations[currentSessionType] / 60);
    
    setHistory(prev => [...prev, {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: currentSessionType,
      durationMinutes: duration
    }]);

    setTimerState(prev => {
      const isWorkSession = prev.currentSession === 'work';
      const nextCompleted = isWorkSession ? prev.sessionsCompleted + 1 : prev.sessionsCompleted;
      
      let nextSession: SessionType = 'work';
      if (isWorkSession) {
        if (nextCompleted > 0 && nextCompleted % POMODOROS_BEFORE_LONG_BREAK === 0) {
          nextSession = 'long-break';
          triggerCelebration();
        } else {
          nextSession = 'short-break';
        }
      }

      return {
        ...prev,
        isActive: false,
        currentSession: nextSession,
        secondsRemaining: durations[nextSession],
        sessionsCompleted: nextCompleted
      };
    });

    setIsQuoteLoading(true);
    const newQuote = await fetchMotivationalQuote(currentSessionType);
    setQuote(newQuote);
    if (newQuote) setLiveQuote(newQuote);
    setIsQuoteLoading(false);

    setTimeout(() => setIsTransitioning(false), 50);
  }, [timerState.currentSession, triggerCelebration, durations, playZenChime]);

  useEffect(() => {
    if (timerState.isActive) {
      const startTime = Date.now();
      const startSeconds = timerState.secondsRemaining;
      
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, startSeconds - elapsed);
        
        setTimerState(prev => {
          if (remaining <= 0) return { ...prev, secondsRemaining: 0, isActive: false };
          return { ...prev, secondsRemaining: remaining };
        });
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [timerState.isActive]);

  useEffect(() => {
    if (timerState.secondsRemaining === 0 && !timerState.isActive && !isTransitioning) {
      handleSessionEnd();
    }
  }, [timerState.secondsRemaining, timerState.isActive, handleSessionEnd, isTransitioning]);

  const switchSession = (type: SessionType) => {
    if (timerState.currentSession === type || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setTimerState(prev => ({ ...prev, isActive: false, currentSession: type, secondsRemaining: durations[type] }));
      setTimeout(() => setIsTransitioning(false), 50);
    }, 400);
  };

  const handleDurationChange = (type: SessionType, minutes: number) => {
    const minVal = Math.max(1, Math.min(180, minutes));
    const newSeconds = minVal * 60;
    setDurations(prev => ({ ...prev, [type]: newSeconds }));
    if (timerState.currentSession === type && !timerState.isActive) {
      setTimerState(prev => ({ ...prev, secondsRemaining: newSeconds }));
    }
  };

  const skipToWork = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setTimerState(prev => ({
        ...prev,
        isActive: false,
        currentSession: 'work',
        secondsRemaining: durations.work
      }));
      setTimeout(() => setIsTransitioning(false), 50);
    }, 400);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScaleClass = () => {
    if (timerState.isActive) return 'scale-[1.03]';
    return isTimerHovered ? 'scale-[1.01]' : 'scale-100';
  };

  const getClockFontClass = () => {
    switch(clockStyle) {
      case 'serif': return 'font-serif';
      case 'sans': return 'font-sans font-bold';
      case 'mono': return 'font-mono text-[5.5rem] xs:text-[6.5rem] md:text-[8rem]';
      case 'rounded': return 'font-sans font-medium tracking-tight rounded-full';
      default: return 'font-serif';
    }
  };

  const getSessionIcon = (type: SessionType, size: number = 16) => {
    switch (type) {
      case 'work': return <Brain size={size} />;
      case 'short-break': return <Coffee size={size} />;
      case 'long-break': return <Trees size={size} />;
      default: return null;
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your FocusStudy history?")) {
      setHistory([]);
      setTimerState(prev => ({ ...prev, sessionsCompleted: 0 }));
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 flex flex-col relative overflow-x-hidden`}>
      <Background 
        palette={palette} 
        isHovered={isTimerHovered || timerState.isActive} 
        particleColor={customParticleColor || undefined} 
      />

      {/* Fullscreen Mobile Toast */}
      {showFullscreenToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 duration-700">
           <button 
             onClick={toggleFullscreen}
             className={`${palette.card} backdrop-blur-2xl border border-white/20 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 ${palette.text} text-[10px] font-bold uppercase tracking-[0.2em]`}
           >
             <Maximize size={12} /> Immersive Mode
           </button>
        </div>
      )}

      {/* Navigation Top Bar */}
      <nav className="w-full px-6 md:px-12 flex justify-between items-start z-20 mt-4 md:mt-8">
        <div className="group cursor-default">
          <h1 className={`text-xl md:text-3xl font-serif italic ${palette.text} opacity-90 flex items-center gap-3 group-hover:opacity-100 transition-opacity`}>
             <Sparkles size={24} className="text-yellow-400 animate-pulse" /> FocusStudy
          </h1>
          <p className={`text-[8px] md:text-[10px] uppercase tracking-[0.4em] ${palette.subtleText} ml-9 md:ml-10 opacity-50 group-hover:opacity-100 transition-opacity`}>
            Serenity in Focus
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            aria-label="Settings"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 md:p-3 rounded-full hover:bg-black/10 transition-all ${palette.text} ${showSettings ? 'bg-black/10 shadow-inner' : ''}`}
          >
            <Settings size={22} />
          </button>
          <button 
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            onClick={toggleFullscreen}
            className={`p-2.5 md:p-3 rounded-full hover:bg-black/10 transition-all ${palette.text} hidden md:block`}
          >
            {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)} />
          <div className={`absolute top-20 right-4 md:right-12 w-[calc(100%-2rem)] md:w-80 ${palette.card} backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] z-40 border border-white/20 animate-in fade-in zoom-in slide-in-from-top-4 duration-500`}>
            <div className="space-y-7">
              <section>
                <h4 className={`text-[10px] uppercase tracking-[0.2em] ${palette.subtleText} mb-4 font-bold flex items-center gap-2`}>
                  <PaletteIcon size={14} /> Palette Selection
                </h4>
                <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {(Object.keys(THEMES) as ThemeType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-3 py-2.5 rounded-xl transition-all duration-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transform hover:scale-105 active:scale-95
                        ${theme === t 
                          ? `${palette.accent} text-white shadow-lg` 
                          : `bg-black/5 hover:bg-black/10 ${palette.text} opacity-70 hover:opacity-100`
                        }
                      `}
                    >
                      {THEMES[t].name}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h4 className={`text-[10px] uppercase tracking-[0.2em] ${palette.subtleText} mb-4 font-bold flex items-center gap-2`}>
                  <TypeIcon size={14} /> Clock Face
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['serif', 'sans', 'mono', 'rounded'] as ClockStyle[]).map(style => (
                    <button
                      key={style}
                      onClick={() => setClockStyle(style)}
                      className={`px-3 py-2.5 rounded-xl border border-white/10 transition-all text-[10px] uppercase tracking-[0.15em] font-bold active:scale-95
                        ${clockStyle === style ? `${palette.accent} text-white shadow-md` : `${palette.text} bg-black/5 opacity-60 hover:opacity-100`}
                      `}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h4 className={`text-[10px] uppercase tracking-[0.2em] ${palette.subtleText} mb-4 font-bold flex items-center gap-2`}>
                  <Sparkles size={14} /> Particle Glow
                </h4>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <input 
                      type="color" 
                      value={customParticleColor || (palette.particle.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/)?.[0] || '#ffffff')}
                      onChange={(e) => setCustomParticleColor(e.target.value)}
                      className="w-11 h-11 rounded-xl border-0 bg-transparent cursor-pointer p-0 overflow-hidden shadow-inner"
                    />
                    <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/20 shadow-inner"></div>
                  </div>
                  <button 
                    onClick={() => setCustomParticleColor(null)}
                    className={`flex-1 py-3 rounded-xl bg-black/5 ${palette.text} opacity-60 hover:opacity-100 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest`}
                  >
                    <Eraser size={14} /> Reset Color
                  </button>
                </div>
              </section>

              <section>
                <h4 className={`text-[10px] uppercase tracking-[0.2em] ${palette.subtleText} mb-4 font-bold flex items-center gap-2`}>
                  <Clock size={14} /> Duration Tuning (min)
                </h4>
                <div className="space-y-3">
                  {['work', 'short-break', 'long-break'].map(sid => (
                    <div key={sid} className="flex items-center justify-between">
                      <span className={`text-[11px] uppercase tracking-widest ${palette.text} opacity-60`}>{sid.replace('-', ' ')}</span>
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" min="1" max="180"
                          value={durations[sid as SessionType] / 60}
                          onChange={(e) => handleDurationChange(sid as SessionType, parseInt(e.target.value) || 1)}
                          className={`w-16 px-2 py-2 rounded-xl text-center text-xs font-black ${palette.progressBg} ${palette.text} outline-none focus:ring-2 focus:ring-white/20 border border-white/5 transition-all`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <button 
                onClick={() => setShowSettings(false)} 
                className={`w-full py-4 rounded-2xl ${palette.accent} text-white text-[11px] shadow-xl font-bold tracking-[0.25em] uppercase hover:brightness-110 active:scale-95 transition-all`}
              >
                Apply Changes
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center z-10 space-y-12 md:space-y-20 px-4 py-6 md:py-10">
        
        {/* Session Selector */}
        <div className="flex flex-col items-center gap-8 md:gap-14 w-full">
          <div className={`inline-flex p-1.5 ${palette.card} backdrop-blur-md rounded-full shadow-inner border border-white/10 w-full max-w-xs md:max-w-md justify-between`}>
            {(['work', 'short-break', 'long-break'] as SessionType[]).map(type => (
              <button
                key={type}
                onClick={() => switchSession(type)}
                className={`flex-1 px-4 md:px-7 py-3 md:py-3.5 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black transition-all duration-700 flex items-center justify-center gap-2
                  ${timerState.currentSession === type ? `${palette.accent} text-white shadow-2xl scale-[1.03]` : `${palette.text} opacity-40 hover:opacity-100 hover:bg-white/5`}
                `}
              >
                {getSessionIcon(type, 14)}
                <span className="hidden xs:inline">{type === 'work' ? 'Focus' : type === 'short-break' ? 'Short' : 'Long'}</span>
                <span className="xs:hidden">{type === 'work' ? 'F' : type === 'short-break' ? 'S' : 'L'}</span>
              </button>
            ))}
          </div>

          {/* Main Timer Display */}
          <div 
            onMouseEnter={() => setIsTimerHovered(true)}
            onMouseLeave={() => setIsTimerHovered(false)}
            className={`relative ${palette.card} backdrop-blur-xl aspect-square w-[88vw] max-w-[350px] md:max-w-[480px] rounded-[5.5rem] md:rounded-[7.5rem] border border-white/20 flex flex-col items-center justify-center timer-transition ${getScaleClass()} ${isTimerHovered ? 'shadow-[0_50px_120px_-30px_rgba(0,0,0,0.6)]' : 'shadow-2xl'}`}
          >
            <div className={`w-full h-full flex flex-col items-center justify-center transition-all duration-1000 ${isTransitioning ? 'opacity-0 scale-90 blur-md' : 'opacity-100 scale-100 blur-0'}`}>
              <BreakAnimation type={timerState.currentSession} palette={palette} />

              <div className={`relative z-10 space-y-4 md:space-y-6 transition-all duration-1000 ${timerState.isActive ? 'translate-y-[-10px]' : 'translate-y-0'}`}>
                <div className={`flex justify-center opacity-40 animate-float`}>
                  {getSessionIcon(timerState.currentSession, 48)}
                </div>
                <p className={`text-[9px] md:text-[11px] tracking-[0.5em] md:tracking-[0.7em] uppercase font-black ${palette.subtleText} transition-all duration-1000 ${timerState.isActive ? 'opacity-20 scale-90' : 'opacity-100'}`}>
                  {timerState.currentSession === 'work' ? 'Immersive Deep Work' : 'Conscious Rest'}
                </p>
                <h2 className={`text-7xl xs:text-8xl md:text-[10rem] ${getClockFontClass()} select-none transition-all duration-1000 leading-none ${palette.text} drop-shadow-xl`}>
                  {formatTime(timerState.secondsRemaining)}
                </h2>
              </div>

              {/* Timer Controls */}
              <div className="absolute bottom-12 md:bottom-14 flex items-center space-x-8 md:space-x-12 z-20">
                <button 
                  aria-label="Reset Session"
                  onClick={() => { setTimerState(p => ({...p, isActive: false, secondsRemaining: durations[p.currentSession]})); }} 
                  className={`p-3 opacity-30 hover:opacity-100 transition-all ${palette.text} hover:scale-125 hover:rotate-[-45deg] duration-500`}
                >
                  <RotateCcw size={26} />
                </button>
                
                <button 
                  aria-label={timerState.isActive ? "Pause" : "Start"}
                  onClick={() => setTimerState(p => ({...p, isActive: !p.isActive}))}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] ${palette.accent} text-white ring-offset-4 ring-offset-transparent ring-8 ring-white/10`}
                >
                  {timerState.isActive ? <Pause size={32} className="md:w-10 md:h-10" fill="currentColor" /> : <Play size={32} className="md:w-10 md:h-10 ml-1.5" fill="currentColor" />}
                </button>

                {timerState.currentSession !== 'work' ? (
                  <button 
                    aria-label="Skip Rest"
                    onClick={skipToWork}
                    className={`p-3 opacity-30 hover:opacity-100 transition-all ${palette.text} hover:scale-125 hover:translate-x-2 duration-500`}
                  >
                    <SkipForward size={26} />
                  </button>
                ) : (
                  <div className="w-[50px] md:w-[66px]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-2 md:px-8">
           
           {/* Motivational Quote Box */}
           <div className={`${palette.card} backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 border border-white/10 flex flex-col justify-center gap-5 md:gap-7 text-center group transition-all duration-1000 hover:shadow-3xl relative overflow-hidden min-h-[220px]`}>
              {isQuoteLoading ? (
                <div className="flex flex-col items-center justify-center py-6 animate-pulse">
                  <Loader2 className={`w-8 h-8 animate-spin ${palette.text} opacity-20`} />
                  <p className={`text-[10px] md:text-[11px] uppercase tracking-[0.4em] mt-6 ${palette.subtleText} opacity-50 font-black`}>
                    Curating Wisdom
                  </p>
                </div>
              ) : (
                <>
                  <div className={`absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 duration-1000`}>
                     <Quote size={100} />
                  </div>
                  <div className="flex justify-center relative z-10">
                    <div className={`p-3 rounded-full ${palette.progressBg} ${palette.text} opacity-40 group-hover:opacity-100 transition-all duration-700`}>
                      <Quote size={18} className="md:w-[22px] md:h-[22px]" />
                    </div>
                  </div>
                  <p className={`text-base md:text-xl font-serif italic ${palette.text} leading-relaxed opacity-90 group-hover:opacity-100 transition-all duration-700 relative z-10 px-2`}>
                    "{liveQuote.text}"
                  </p>
                  <span className={`text-[9px] md:text-[11px] uppercase tracking-[0.4em] font-black ${palette.subtleText} opacity-50 relative z-10`}>
                    — {liveQuote.author}
                  </span>
                </>
              )}
           </div>

           {/* Stats Box */}
           <div className={`${palette.card} backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 border border-white/10 flex flex-col items-center justify-center gap-6 md:gap-8 group transition-all duration-1000 hover:shadow-3xl`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center ${palette.progressBg} ${palette.text} opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700`}>
                   <Award size={22} className="md:w-[26px] md:h-[26px]" />
                </div>
                <h3 className={`text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-black ${palette.subtleText}`}>Focus Mastery</h3>
              </div>
              
              <ProgressDots completed={timerState.sessionsCompleted} palette={palette} />
              
              <div className="flex flex-col items-center">
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl md:text-7xl font-serif ${palette.text} transition-all duration-700 group-hover:scale-110`}>{timerState.sessionsCompleted}</span>
                  <span className={`text-sm md:text-lg ${palette.subtleText} opacity-40`}>/ ∞</span>
                </div>
                <p className={`text-[10px] md:text-[11px] uppercase tracking-[0.5em] font-black ${palette.subtleText} opacity-40 mt-3`}>
                  Deep Sessions
                </p>
              </div>

              <button 
                onClick={() => setShowHistory(true)}
                className={`mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black ${palette.text} opacity-30 hover:opacity-100 transition-all transform hover:translate-x-2 duration-500`}
              >
                Log Archive <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </main>

      {/* Spacing Gap */}
      <div className="h-24 md:h-40" /> 

      {/* Footer */}
      <footer className={`${palette.card} backdrop-blur-3xl border-t border-white/10 w-full relative z-10 py-16 md:py-24`}>
        <div className="max-w-6xl mx-auto px-8 md:px-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-14 md:gap-20">
          
          <div className="space-y-6 text-center md:text-left sm:col-span-2 md:col-span-1">
            <h2 className={`text-2xl md:text-3xl font-serif italic ${palette.text} flex items-center gap-3 justify-center md:justify-start`}>
               <Sparkles size={24} className="text-yellow-500" /> FocusStudy
            </h2>
            <p className={`text-xs md:text-sm leading-relaxed ${palette.subtleText} opacity-60 max-w-sm mx-auto md:mx-0`}>
              FocusStudy is a refined productivity sanctuary. Built for those who find beauty in discipline and calm in the chaos of modern study.
            </p>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <h3 className={`text-[11px] uppercase tracking-[0.4em] font-black ${palette.text} opacity-90`}>The Ritual</h3>
            <ul className={`flex flex-col gap-4 text-xs ${palette.subtleText} opacity-50`}>
              <li><a href="#" className="hover:opacity-100 transition-opacity hover:translate-x-1 inline-block duration-300">Aesthetic Philosophy</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity hover:translate-x-1 inline-block duration-300">Our Studio</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity hover:translate-x-1 inline-block duration-300">Journal</a></li>
            </ul>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <h3 className={`text-[11px] uppercase tracking-[0.4em] font-black ${palette.text} opacity-90`}>Archive</h3>
            <ul className={`flex flex-col gap-4 text-xs ${palette.subtleText} opacity-50`}>
              <li><a href="#" className="hover:opacity-100 transition-opacity hover:translate-x-1 inline-block duration-300">Methodology</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity hover:translate-x-1 inline-block duration-300">AI Integration</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity hover:translate-x-1 inline-block duration-300">Sustainability</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 md:mt-28 pt-10 border-t border-white/10 text-center px-8">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto gap-8">
            <div className={`text-[9px] md:text-[10px] uppercase tracking-[0.5em] ${palette.subtleText} opacity-30`}>
              © 2024 FocusStudy Collective &bull; Premium Productivity Tool
            </div>
            <div className="flex items-center gap-6 opacity-20">
              <span className="h-[1px] w-12 bg-current"></span>
              <span className="text-[8px] uppercase tracking-[0.4em]">Presence • Flow • Peace</span>
              <span className="h-[1px] w-12 bg-current"></span>
            </div>
          </div>
        </div>
      </footer>

      {/* Overlays */}
      <EncouragementPopUp quote={quote} palette={palette} onClose={() => setQuote(null)} />
      {showHistory && (
        <HistoryModal 
          history={history} 
          palette={palette} 
          onClose={() => setShowHistory(false)} 
          onClear={clearHistory}
        />
      )}
    </div>
  );
};

export default App;