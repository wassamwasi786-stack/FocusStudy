
import React from 'react';
import { Palette } from '../types';
import { POMODOROS_BEFORE_LONG_BREAK } from '../constants';

interface ProgressDotsProps {
  completed: number;
  palette: Palette;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ completed, palette }) => {
  const dots = Array.from({ length: POMODOROS_BEFORE_LONG_BREAK });
  
  return (
    <div className="flex items-center justify-center space-x-3 md:space-x-4 py-4 md:py-6">
      {dots.map((_, i) => {
        const isCompleted = i < (completed % POMODOROS_BEFORE_LONG_BREAK);
        const isCurrent = i === (completed % POMODOROS_BEFORE_LONG_BREAK);
        
        return (
          <div 
            key={i}
            className={`
              relative w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-700
              ${isCompleted ? palette.accent : palette.progressBg}
              ${isCompleted ? 'shadow-[0_0_8px_rgba(0,0,0,0.1)]' : ''}
              ${isCurrent ? 'animate-pulse-soft scale-125' : ''}
            `}
          >
            {isCompleted && (
              <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-current" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressDots;
