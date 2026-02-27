
import React from 'react';
import { Batch } from '../types';

interface SummaryViewProps {
  batch: Batch;
  isSyncing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ batch, isSyncing, onConfirm, onCancel }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500 pb-10">
      <div className="backdrop-blur-3xl bg-white/5 p-8 rounded-[3.5rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)] border-t-white/10">
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 border-b border-white/5 pb-6">Riepilogo Operativo</h2>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar overscroll-contain">
          {batch.services.map((s) => (
            <div key={s.id} className="p-6 bg-black/40 rounded-[2.2rem] border border-white/5 relative group active:border-amber-500/40 transition-all duration-300">
              <div className="absolute left-0 top-6 w-1.5 h-10 bg-amber-500 rounded-r-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
              <h3 className="font-black text-amber-500 uppercase tracking-[0.4em] text-[9px] mb-4 opacity-70 italic">COMMESSA #{s.id}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">SITO</span>
                  <div className="text-right">
                    <span className="block text-sm font-black text-white uppercase italic tracking-tight">{s.venue_name}</span>
                    <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">{s.location}</span>
                  </div>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">PIANIFICAZIONE</span>
                  <span className="text-sm font-mono text-amber-300 italic">{s.start_time} - {s.end_time}</span>
                </div>
                <div className="pt-3 border-t border-white/5">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">OPERATORI ASSEGNATI</p>
                  <p className="text-[11px] font-bold text-white/90 leading-relaxed italic">{s.operators.map(o => o.operator_name).join(', ')}</p>
                </div>
                {s.notes && (
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">NOTE SERVIZIO</p>
                    <p className="text-[10px] font-bold text-amber-100/60 leading-relaxed italic uppercase">{s.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          onClick={onConfirm} 
          disabled={isSyncing}
          className={`w-full py-7 font-black rounded-[2.5rem] uppercase text-[11px] tracking-[0.4em] shadow-[0_25px_50px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-3 ${isSyncing ? 'bg-emerald-800 text-white/50 cursor-wait' : 'bg-emerald-500 text-white active:scale-95 active:shadow-[0_0_70px_#10b981]'}`}
        >
          {isSyncing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sincronizzazione Cloud...
            </>
          ) : 'Conferma e Invia Report'}
        </button>
        <button onClick={onCancel} className="w-full bg-black/60 backdrop-blur-3xl text-white/40 font-black py-5 rounded-[2.5rem] uppercase text-[10px] tracking-[0.3em] border border-white/5 active:scale-95 transition-all">Modifica Inserimenti</button>
      </div>
    </div>
  );
};

export default SummaryView;
