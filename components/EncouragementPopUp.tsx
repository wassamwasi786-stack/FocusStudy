
import React from 'react';
import { Palette } from '../types';
import { X } from 'lucide-react';

interface EncouragementPopUpProps {
  quote: { text: string; author: string } | null;
  palette: Palette;
  onClose: () => void;
}

const EncouragementPopUp: React.FC<EncouragementPopUpProps> = ({ quote, palette, onClose }) => {
  if (!quote) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-[4px] p-4">
      <div className={`relative max-w-sm w-full ${palette.card} p-6 md:p-10 rounded-[2.5rem] shadow-2xl transform transition-all duration-500 scale-100 border border-white/20 animate-in fade-in zoom-in slide-in-from-bottom-8`}>
        <button 
          onClick={onClose}
          className={`absolute top-5 right-5 p-1.5 rounded-full hover:bg-black/5 transition-colors ${palette.text}`}
        >
          <X size={18} />
        </button>
        
        <div className="text-center space-y-5 md:space-y-6">
          <div className={`w-10 h-10 md:w-12 md:h-12 ${palette.accent} rounded-full mx-auto flex items-center justify-center opacity-80 animate-pulse`}>
            <span className="text-white text-lg md:text-xl">✨</span>
          </div>
          
          <h3 className={`text-xl md:text-2xl font-serif italic font-medium leading-tight ${palette.text}`}>
            "{quote.text}"
          </h3>
          
          <p className={`text-[10px] md:text-sm uppercase tracking-widest ${palette.subtleText}`}>
            — {quote.author}
          </p>
          
          <button
            onClick={onClose}
            className={`w-full py-3.5 md:py-4 rounded-2xl ${palette.accent} text-white text-xs md:text-sm font-semibold shadow-lg hover:opacity-90 transition-all transform active:scale-95 tracking-widest uppercase`}
          >
            Continue Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncouragementPopUp;
