
import React, { useState, useMemo } from 'react';
import { ServiceEntry, Operator, Venue } from '../types';

interface ServiceFormProps {
  service: ServiceEntry;
  setService: React.Dispatch<React.SetStateAction<ServiceEntry>>;
  availableOperators: Operator[];
  masterVenues: Venue[];
  onToggleOperator: (op: Operator) => void;
  onNewService: () => void;
  onTerminate: () => void;
  error: string | null;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service, setService, availableOperators, masterVenues, onToggleOperator, onNewService, onTerminate, error
}) => {
  const [opSearch, setOpSearch] = useState("");

  const filteredAvailable = useMemo(() => {
    if (!opSearch.trim()) return availableOperators;
    return availableOperators.filter(op => 
      op.operator_name.toLowerCase().includes(opSearch.toLowerCase())
    );
  }, [availableOperators, opSearch]);

  const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const venueName = e.target.value;
    const selectedVenue = masterVenues.find(v => v.venue_name === venueName);
    setService({
      ...service, 
      venue_name: venueName,
      location: selectedVenue ? selectedVenue.venue_location : ''
    });
  };

  const selectOp = (op: Operator) => {
    onToggleOperator(op);
    setOpSearch("");
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-700 pb-20">
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
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Sito Operativo</label>
            <select 
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-inner uppercase font-bold appearance-none"
              value={service.venue_name}
              onChange={handleVenueChange}
            >
              <option value="" disabled>SELEZIONA LOCALE...</option>
              {masterVenues.map(v => (
                <option key={v.venue_id} value={v.venue_name} className="bg-zinc-900 text-white uppercase font-bold">{v.venue_name} ({v.venue_location})</option>
              ))}
            </select>
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

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Note Operative</label>
            <textarea 
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner h-24 placeholder:text-white/10 uppercase font-bold italic"
              placeholder="Inserire note specifiche, turni particolari o criticità..."
              value={service.notes}
              onChange={(e) => setService({...service, notes: e.target.value})}
            />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="flex justify-between items-center mb-6">
            <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Assegnazione Staff</label>
            <button onClick={() => setService(prev => ({ ...prev, double_shift: !prev.double_shift }))} className={`text-[8px] font-black px-5 py-2 rounded-full border transition-all ${service.double_shift ? 'bg-amber-500 text-black border-amber-400 shadow-lg' : 'bg-white/5 text-white/30 border-white/5'}`}>
              DOPPIO TURNO
            </button>
          </div>

          <div className="mb-6 relative">
            <input 
              type="text"
              placeholder="DIGITA PER CERCARE NOMINATIVO..."
              className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-sm text-amber-500 font-bold focus:outline-none focus:border-emerald-500/50 transition-all shadow-xl placeholder:text-white/10 placeholder:uppercase"
              value={opSearch}
              onChange={(e) => setOpSearch(e.target.value)}
            />
            {opSearch.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar overflow-hidden animate-in slide-in-from-top-2 duration-200">
                {filteredAvailable.length > 0 ? (
                  filteredAvailable.map(op => (
                    <button 
                      key={op.operator_id}
                      onClick={() => selectOp(op)}
                      className="w-full text-left px-6 py-4 text-xs font-black text-white/70 uppercase hover:bg-emerald-500 hover:text-black transition-colors border-b border-white/5"
                    >
                      {op.operator_name}
                    </button>
                  ))
                ) : (
                  <div className="px-6 py-4 text-[9px] text-white/20 italic uppercase font-bold">Nessun risultato trovato</div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 mb-2 min-h-[44px]">
            {service.operators.map(op => (
              <div 
                key={op.operator_id} 
                className="bg-emerald-500 text-black px-4 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-3 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer uppercase tracking-tight border border-emerald-400"
                onClick={() => onToggleOperator(op)}
              >
                {op.operator_name} <span className="text-black/40 text-[12px] font-normal">×</span>
              </div>
            ))}
            {service.operators.length === 0 && (
              <div className="w-full py-6 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center bg-white/[0.02]">
                <span className="text-[10px] text-white/10 font-black uppercase tracking-[0.2em]">Pianifica Unità Operative</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button onClick={onNewService} className="w-full bg-white/5 backdrop-blur-2xl text-amber-500 font-black py-6 rounded-[2rem] border border-amber-500/20 uppercase text-[11px] tracking-[0.3em] active:scale-95 transition-all active:bg-amber-500 active:text-black active:shadow-[0_0_40px_rgba(245,158,11,0.4)]">Salva e Aggiungi Altro Sito</button>
        <button onClick={onTerminate} className="w-full bg-emerald-500 text-white font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.4em] shadow-[0_20px_40px_rgba(16,185,129,0.3)] active:scale-95 transition-all active:shadow-[0_0_60px_#10b981]">Concludi e Genera Report</button>
      </div>
    </div>
  );
};

export default ServiceForm;
