
import React from 'react';
import { Batch } from '../types';

interface SummaryViewProps {
  batch: Batch;
  onConfirm: () => void;
  onCancel: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ batch, onConfirm, onCancel }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="backdrop-blur-3xl bg-white/5 p-8 rounded-[3.5rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)] border-t-white/10">
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 border-b border-white/5 pb-6">Riepilogo Operativo</h2>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar overscroll-contain">
          {batch.services.map((s) => (
            <div key={s.id} className="p-6 bg-black/40 rounded-[2.2rem] border border-white/5 relative group active:border-amber-500/40 transition-all duration-300">
              <div className="absolute left-0 top-6 w-1.5 h-10 bg-amber-500 rounded-r-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
              <h3 className="font-black text-amber-500 uppercase tracking-[0.4em] text-[9px] mb-4 opacity-70 italic">COMMESSA #{s.id}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">LOCALE</span>
                  <span className="text-sm font-black text-white uppercase italic tracking-tight">{s.venue_name}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">PIANIFICAZIONE</span>
                  <span className="text-sm font-mono text-amber-300">{s.start_time} - {s.end_time}</span>
                </div>
                <div className="pt-3 border-t border-white/5">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">OPERATORI ASSEGNATI</p>
                  <p className="text-[11px] font-bold text-white/90 leading-relaxed italic">{s.operators.map(o => o.operator_name).join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button onClick={onConfirm} className="w-full bg-emerald-500 text-white font-black py-7 rounded-[2.5rem] uppercase text-[11px] tracking-[0.4em] shadow-[0_25px_50px_rgba(16,185,129,0.4)] active:scale-95 transition-all active:shadow-[0_0_70px_#10b981]">Conferma e Invia Report</button>
        <button onClick={onCancel} className="w-full bg-black/60 backdrop-blur-3xl text-white/40 font-black py-5 rounded-[2.5rem] uppercase text-[10px] tracking-[0.3em] border border-white/5 active:scale-95 transition-all">Modifica Inserimenti</button>
      </div>
    </div>
  );
};

export default SummaryView;
