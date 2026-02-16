
import React from 'react';
import { ServiceEntry, Operator } from '../types';

interface ServiceFormProps {
  service: ServiceEntry;
  setService: React.Dispatch<React.SetStateAction<ServiceEntry>>;
  availableOperators: Operator[];
  onToggleOperator: (op: Operator) => void;
  onNewService: () => void;
  onTerminate: () => void;
  error: string | null;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service, setService, availableOperators, onToggleOperator, onNewService, onTerminate, error
}) => {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-700">
      <div className="relative backdrop-blur-3xl bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-[0_35px_70px_rgba(0,0,0,0.7)] border-t-white/10">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
            <span className="bg-amber-500 text-black px-4 py-1.5 rounded-2xl text-base not-italic font-black shadow-[0_10px_20px_rgba(245,158,11,0.3)]">#{service.id}</span>
            Nuovo Incarico
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-2xl text-center backdrop-blur-2xl animate-pulse">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Nome Locale / Cliente</label>
            <input type="text" placeholder="Esempio: Club Platinum..." className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-inner placeholder:text-white/10" value={service.venue_name} onChange={(e) => setService({...service, venue_name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Data Servizio</label>
              <input type="date" className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none [color-scheme:dark]" value={service.service_date} onChange={(e) => setService({...service, service_date: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2 text-center">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Inizio</label>
                <input type="time" className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 text-xs text-white text-center focus:outline-none [color-scheme:dark]" value={service.start_time} onChange={(e) => setService({...service, start_time: e.target.value})} />
              </div>
              <div className="space-y-2 text-center">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Fine</label>
                <input type="time" className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 text-xs text-white text-center focus:outline-none [color-scheme:dark]" value={service.end_time} onChange={(e) => setService({...service, end_time: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="flex justify-between items-center mb-6">
            <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Assegnazione Personale</label>
            <button onClick={() => setService(prev => ({ ...prev, double_shift: !prev.double_shift }))} className={`text-[8px] font-black px-5 py-2 rounded-full border transition-all ${service.double_shift ? 'bg-amber-500 text-black border-amber-400 shadow-lg' : 'bg-white/5 text-white/30 border-white/5'}`}>
              DOPPIO TURNO
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2.5 mb-6 min-h-[44px]">
            {service.operators.map(op => (
              <div key={op.operator_id} className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 active:scale-90 transition-all shadow-lg" onClick={() => onToggleOperator(op)}>
                {op.operator_name} <span className="text-white/30 text-[11px]">×</span>
              </div>
            ))}
          </div>

          <div className="max-h-52 overflow-y-auto bg-black/40 rounded-3xl border border-white/5 p-3 custom-scrollbar overscroll-contain shadow-inner backdrop-blur-3xl">
            {availableOperators.map(op => (
              <button key={op.operator_id} onClick={() => onToggleOperator(op)} className="w-full text-left px-5 py-4 hover:bg-emerald-500/10 rounded-2xl text-[11px] text-white flex justify-between items-center transition-all border border-transparent active:border-emerald-500/40 active:scale-[0.98] mb-1 last:mb-0">
                <span className="font-bold uppercase tracking-tight">{op.operator_name}</span>
                <span className="text-[8px] font-black text-emerald-500/60 uppercase">+ AGGIUNGI</span>
              </button>
            ))}
            {availableOperators.length === 0 && <p className="text-center text-white/10 text-[10px] py-4 uppercase font-black">Nessuna unità disponibile</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button onClick={onNewService} className="w-full bg-white/5 backdrop-blur-2xl text-amber-500 font-black py-6 rounded-[2rem] border border-amber-500/20 uppercase text-[11px] tracking-[0.3em] active:scale-95 transition-all active:bg-amber-500 active:text-black active:shadow-[0_0_40px_rgba(245,158,11,0.4)]">Aggiungi Altro Locale</button>
        <button onClick={onTerminate} className="w-full bg-emerald-500 text-white font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.4em] shadow-[0_20px_40px_rgba(16,185,129,0.3)] active:scale-95 transition-all active:shadow-[0_0_60px_#10b981]">Genera Riepilogo Finale</button>
      </div>
    </div>
  );
};

export default ServiceForm;
