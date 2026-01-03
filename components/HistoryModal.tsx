
import React from 'react';
import { Palette, HistoryItem } from '../types';
import { X, Calendar, Clock, Brain, Coffee, Trees, Trash2 } from 'lucide-react';

interface HistoryModalProps {
  history: HistoryItem[];
  palette: Palette;
  onClose: () => void;
  onClear: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, palette, onClose, onClear }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'work': return <Brain size={14} />;
      case 'short-break': return <Coffee size={14} />;
      case 'long-break': return <Trees size={14} />;
      default: return null;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-md p-4">
      <div className={`relative max-w-md w-full max-h-[80vh] ${palette.card} flex flex-col rounded-[2.5rem] shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300`}>
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5">
          <h3 className={`text-xl font-serif italic ${palette.text}`}>Study Archive</h3>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-black/5 transition-colors ${palette.text}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
          {history.length === 0 ? (
            <div className={`text-center py-12 ${palette.subtleText} opacity-40 italic text-sm`}>
              Your journey is just beginning. Start your first session.
            </div>
          ) : (
            history.slice().reverse().map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl ${palette.progressBg} bg-opacity-20 border border-white/5`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${palette.accent} text-white opacity-80 shadow-sm`}>
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${palette.text}`}>
                      {item.type === 'work' ? 'Deep Session' : 'Active Rest'}
                    </p>
                    <p className={`text-[10px] ${palette.subtleText} flex items-center gap-1 mt-0.5`}>
                      <Calendar size={10} /> {formatDate(item.timestamp)}
                    </p>
                  </div>
                </div>
                <div className={`text-[10px] font-bold ${palette.text} opacity-60 flex items-center gap-1`}>
                   <Clock size={10} /> {item.durationMinutes}m
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 md:p-8 border-t border-white/5 flex gap-3">
          <button
            onClick={onClear}
            disabled={history.length === 0}
            className={`flex-1 py-3.5 rounded-2xl border border-white/10 ${palette.text} text-[10px] font-bold tracking-widest uppercase opacity-40 hover:opacity-100 disabled:opacity-10 transition-all flex items-center justify-center gap-2`}
          >
            <Trash2 size={14} /> Clear Logs
          </button>
          <button
            onClick={onClose}
            className={`flex-[2] py-3.5 rounded-2xl ${palette.accent} text-white text-[10px] font-bold tracking-widest uppercase shadow-lg transform active:scale-95 transition-all`}
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
