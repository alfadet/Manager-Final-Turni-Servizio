
import React, { useState } from 'react';
import { Batch } from '../types';

interface SentHistoryProps {
  history: Batch[];
  onBack: () => void;
  onClear: () => void;
}

const SentHistory: React.FC<SentHistoryProps> = ({ history, onBack, onClear }) => {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  return (
    <div className="space-y-6 animate-in zoom-in duration-500">
      <div className="backdrop-blur-3xl bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-amber-500">Registro Storico</h2>
          <button onClick={onClear} className="text-[10px] font-black text-rose-500 uppercase tracking-widest active:scale-90">Elimina Dati</button>
        </div>

        {selectedBatch ? (
          <div className="space-y-4 animate-in fade-in">
            <button onClick={() => setSelectedBatch(null)} className="text-[11px] font-black text-amber-500 uppercase mb-8 flex items-center gap-2 active:scale-95">← Torna all'Indice</button>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar overscroll-contain">
              {selectedBatch.services.map(s => (
                <div key={s.id} className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                  <p className="text-[10px] font-black text-amber-500 uppercase mb-3">Servizio #{s.id}</p>
                  <p className="text-sm font-black text-white uppercase italic mb-1">{s.venue_name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mb-4 uppercase">{s.service_date} | {s.start_time}-{s.end_time}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.operators.map(o => <span key={o.operator_id} className="text-[9px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-bold">{o.operator_name}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar overscroll-contain">
            {history.length > 0 ? history.map(b => (
              <button 
                key={b.batch_id} 
                onClick={() => setSelectedBatch(b)}
                className="w-full p-6 bg-black/40 border border-white/5 rounded-[2rem] flex justify-between items-center active:scale-[0.98] active:bg-emerald-500/10 active:border-emerald-500/30 transition-all group shadow-inner"
              >
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-tighter">{new Date(b.created_at).toLocaleString('it-IT')}</p>
                  <p className="text-sm font-black text-white uppercase tracking-tight mt-1 italic">{b.services.length} Records Rilevati</p>
                </div>
                <span className="text-amber-500 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            )) : <p className="text-center text-white/10 italic text-[11px] py-16 uppercase font-black">Nessun dato registrato nel caveau</p>}
          </div>
        )}

        <button onClick={onBack} className="w-full mt-10 py-6 bg-white text-black font-black rounded-[2.5rem] text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all">Dashboard Principale</button>
      </div>
    </div>
  );
};

export default SentHistory;
