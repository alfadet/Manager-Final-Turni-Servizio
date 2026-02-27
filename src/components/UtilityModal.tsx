
import React, { useState, useMemo } from 'react';
import { ServiceEntry, Operator, Venue } from '../types';

interface UtilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceEntry[];
  onUpdateService: (updatedService: ServiceEntry) => void;
  masterVenues: Venue[];
  masterOperators: Operator[];
  onDownloadLog: (service?: ServiceEntry) => void;
}

const UtilityModal: React.FC<UtilityModalProps> = ({ 
  isOpen, 
  onClose, 
  services, 
  onUpdateService, 
  masterVenues, 
  masterOperators,
  onDownloadLog
}) => {
  const [editingServiceUuid, setEditingServiceUuid] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ServiceEntry | null>(null);
  const [opSearch, setOpSearch] = useState("");

  const playWhooshSound = () => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const bufferSize = audioCtx.sampleRate * 0.4;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.35);
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      noise.start();
    } catch (e) {}
  };

  const handleEditService = (service: ServiceEntry) => {
    setEditingServiceUuid(service.service_uuid || null);
    setEditForm({ ...service });
  };

  const saveEdit = () => {
    if (!editForm) return;
    onUpdateService(editForm);
    setEditingServiceUuid(null);
    setEditForm(null);
    playWhooshSound();
  };

  const toggleOperatorInEdit = (op: Operator) => {
    if (!editForm) return;
    const exists = editForm.operators.some((o: Operator) => o.operator_id === op.operator_id);
    const newOps = exists 
      ? editForm.operators.filter((o: Operator) => o.operator_id !== op.operator_id)
      : [...editForm.operators, op];
    setEditForm({ ...editForm, operators: newOps });
    setOpSearch("");
  };

  const filteredOperatorsForEdit = useMemo(() => {
    if (!opSearch.trim()) return masterOperators;
    return masterOperators.filter(op => 
      op.operator_name.toLowerCase().includes(opSearch.toLowerCase())
    );
  }, [masterOperators, opSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/90 animate-in fade-in duration-300">
      <div className="w-full max-w-[430px] bg-zinc-900 border border-white/10 rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black italic uppercase text-amber-400">Utility & Modifiche</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white font-black text-xs uppercase tracking-widest">Chiudi</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Azioni Rapide</p>
            <button 
              onClick={() => onDownloadLog()}
              className="w-full py-4 bg-zinc-800 text-white font-black rounded-xl text-[10px] uppercase tracking-widest border border-white/5 active:bg-white active:text-black transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Scarica Log TXT Completo
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ultimi 8 Servizi</p>
              <span className="text-[8px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-bold uppercase">Modifica Diretta</span>
            </div>
            
            {services.length === 0 && (
              <p className="text-center py-10 text-[10px] text-white/20 uppercase font-black italic">Nessun servizio in archivio</p>
            )}

            {services.map((s, idx) => (
              <div key={`${s.id}-${idx}`} className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-black text-white uppercase">{s.venue_name}</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase">{s.service_date} | {s.start_time}-{s.end_time}</p>
                  </div>
                  <button 
                    onClick={() => handleEditService(s)}
                    className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[9px] font-black uppercase"
                  >
                    Modifica
                  </button>
                </div>

                {editingServiceUuid === s.service_uuid && editForm && (
                  <div className="pt-4 border-t border-white/5 space-y-4 animate-in slide-in-from-top duration-300">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Locale & Luogo</label>
                      <select 
                        value={editForm.venue_name} 
                        onChange={(e) => {
                          const v = masterVenues.find(vn => vn.venue_name === e.target.value);
                          setEditForm({ ...editForm, venue_name: e.target.value, location: v?.venue_location || '' });
                        }}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white font-bold uppercase"
                      >
                        <option value="">Seleziona Locale...</option>
                        {masterVenues.map(v => <option key={v.venue_id} value={v.venue_name}>{v.venue_name}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Inizio</label>
                        <input type="time" value={editForm.start_time} onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Fine</label>
                        <input type="time" value={editForm.end_time} onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white font-bold" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Note Operative</label>
                      <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white font-bold uppercase h-20" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Staff Assegnato</label>
                      <input 
                        type="text"
                        placeholder="CERCA AGENTE DA AGGIUNGERE..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-emerald-400 font-bold placeholder:text-white/10 uppercase"
                        value={opSearch}
                        onChange={(e) => setOpSearch(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto custom-scrollbar p-1">
                        {filteredOperatorsForEdit.map(op => {
                          const isSelected = editForm.operators.some((o: Operator) => o.operator_id === op.operator_id);
                          return (
                            <button 
                              key={op.operator_id}
                              type="button"
                              onClick={() => toggleOperatorInEdit(op)}
                              className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase transition-all border ${isSelected ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
                            >
                              {op.operator_name} {isSelected ? '✓' : '+'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button onClick={saveEdit} className="flex-1 py-3 bg-emerald-500 text-black font-black rounded-xl text-[10px] uppercase tracking-widest">Salva Modifiche</button>
                      <button onClick={() => { setEditingServiceUuid(null); setEditForm(null); }} className="px-4 py-3 bg-white/5 text-white/40 font-black rounded-xl text-[10px] uppercase">Annulla</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilityModal;
