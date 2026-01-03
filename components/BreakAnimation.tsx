import React from 'react';
import { Palette, SessionType } from '../types';

interface BreakAnimationProps {
  type: SessionType;
  palette: Palette;
}

const BreakAnimation: React.FC<BreakAnimationProps> = ({ type, palette }) => {
  if (type === 'work') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-[5.5rem] md:rounded-[7.5rem]">
      {type === 'short-break' ? (
        // Playful Bouncing Elements Animation
        <div className="relative w-full h-full opacity-40">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="absolute inset-0">
              <div 
                className={`absolute left-1/2 -translate-x-1/2 bottom-16 rounded-full ${palette.accent} opacity-30 animate-bounce`}
                style={{ 
                  width: `${36 - i * 6}px`, 
                  height: `${36 - i * 6}px`,
                  animationDelay: `${i * 0.25}s`,
                  animationDuration: `${1.2 + i * 0.15}s`,
                  marginLeft: `${(i - 1.5) * 45}px`
                }} 
              />
              <div 
                className={`absolute left-1/2 -translate-x-1/2 bottom-14 bg-black/10 rounded-[100%] blur-md animate-pulse`}
                style={{ 
                  width: `${45 - i * 8}px`, 
                  height: '6px',
                  animationDelay: `${i * 0.25}s`,
                  marginLeft: `${(i - 1.5) * 45}px`
                }} 
              />
            </div>
          ))}
        </div>
      ) : (
        // Deep Zen Floating Clouds Animation
        <div className="relative w-full h-full">
          <div 
            className={`absolute animate-float opacity-20 ${palette.accent} rounded-full blur-[90px] w-80 h-44 -top-12 -left-24`} 
            style={{ animationDuration: '8s' }}
          />
          <div 
            className={`absolute animate-float opacity-15 ${palette.accent} rounded-full blur-[70px] w-64 h-32 top-1/4 -right-12`} 
            style={{ animationDelay: '1.5s', animationDuration: '10s' }}
          />
          <div 
            className={`absolute animate-float opacity-30 ${palette.accent} rounded-full blur-[100px] w-96 h-48 -bottom-12 left-1/4`} 
            style={{ animationDelay: '2.5s', animationDuration: '12s' }}
          />
          <div 
            className={`absolute animate-float opacity-10 ${palette.accent} rounded-full blur-[50px] w-48 h-24 top-1/3 left-1/3`} 
            style={{ animationDelay: '0.8s', animationDuration: '9s' }}
          />
          
          <div className="absolute inset-0 animate-[spin_30s_linear_infinite] opacity-10">
             <div className={`absolute top-0 left-1/2 w-5 h-5 rounded-full blur-[2px] ${palette.accent}`} />
             <div className={`absolute bottom-0 left-1/2 w-4 h-4 rounded-full blur-[1px] ${palette.accent}`} />
             <div className={`absolute left-0 top-1/2 w-3 h-3 rounded-full blur-[1px] ${palette.accent}`} />
             <div className={`absolute right-0 top-1/2 w-4 h-4 rounded-full blur-[2px] ${palette.accent}`} />
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BreakAnimation;