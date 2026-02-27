
import { useState, useMemo } from 'react';
import { Batch } from '../types';

interface OperatorStats {
  name: string;
  months: Record<string, number>;
}

interface OperatorStatsViewProps {
  history: Batch[];
  onBack: () => void;
}

export default function OperatorStatsView({ history, onBack }: OperatorStatsViewProps) {
  const [selectedOp, setSelectedOp] = useState<string | null>(null);

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startTotal = sh * 60 + sm;
    let endTotal = eh * 60 + em;
    if (endTotal < startTotal) endTotal += 24 * 60;
    return (endTotal - startTotal) / 60;
  };

  const opStats = useMemo<Record<string, OperatorStats>>(() => {
    const stats: Record<string, OperatorStats> = {};
    history.forEach(b => {
      b.services.forEach(s => {
        const duration = calculateDuration(s.start_time, s.end_time);
        const date = new Date(s.service_date);
        const monthYear = date.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
        
        s.operators.forEach(op => {
          if (!stats[op.operator_id]) stats[op.operator_id] = { name: op.operator_name, months: {} };
          if (!stats[op.operator_id].months[monthYear]) stats[op.operator_id].months[monthYear] = 0;
          stats[op.operator_id].months[monthYear] += duration;
        });
      });
    });
    return stats;
  }, [history]);

  const sortedOps = (Object.entries(opStats) as [string, OperatorStats][]).sort((a, b) => a[1].name.localeCompare(b[1].name));

  const exportWA = (opId: string) => {
    const data = opStats[opId];
    if (!data) return;
    let txt = `ALFA SECURITY - ANALISI PRESTAZIONI\nOPERATORE: ${data.name.toUpperCase()}\n\n`;
    (Object.entries(data.months) as [string, number][]).forEach(([my, h]) => {
      txt += `• ${my.toUpperCase()}: ${h.toFixed(2)} ore\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in zoom-in duration-500">
      <div className="backdrop-blur-3xl bg-white/5 p-8 rounded-[3.5rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Analisi Personale</h2>
          <div className="px-4 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Resoconto Ore</span>
          </div>
        </div>

        {selectedOp ? (
          <div className="animate-in fade-in">
            <button onClick={() => setSelectedOp(null)} className="text-[10px] font-black text-amber-500 uppercase mb-8 flex items-center gap-2 active:scale-95">← Torna all'elenco</button>
            <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 mb-8 shadow-inner">
              <h3 className="text-xl font-black text-white uppercase italic mb-6">{opStats[selectedOp].name}</h3>
              <div className="space-y-4">
                {(Object.entries(opStats[selectedOp].months) as [string, number][]).map(([my, h]) => (
                  <div key={my} className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[11px] text-white/30 font-bold uppercase tracking-tight">{my}</span>
                    <span className="text-base font-mono text-amber-500 font-black">{h.toFixed(1)} <span className="text-[10px] opacity-40">H</span></span>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => exportWA(selectedOp)} 
              className="w-full py-6 bg-emerald-500 text-white font-black rounded-[2.2rem] text-[11px] uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all active:shadow-[0_0_60px_#10b981]"
            >
              Invia Report via WA
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar overscroll-contain">
            {sortedOps.length > 0 ? sortedOps.map(([id, data]) => (
              <button 
                key={id} 
                onClick={() => setSelectedOp(id)}
                className="w-full p-6 bg-black/40 border border-white/5 rounded-[2rem] flex justify-between items-center transition-all active:scale-[0.98] active:bg-emerald-500/10 active:border-emerald-500/30 group"
              >
                <span className="text-sm font-black text-white uppercase italic tracking-tight">{data.name}</span>
                <span className="text-amber-500 opacity-0 group-active:opacity-100 transition-opacity">→</span>
              </button>
            )) : <p className="text-center text-white/10 italic text-[10px] py-20 uppercase font-black">Nessun dato disponibile</p>}
          </div>
        )}
      </div>

      <button onClick={onBack} className="w-full bg-black/60 backdrop-blur-3xl text-white/40 font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.3em] border border-white/5 active:scale-95 transition-all">Chiudi Archivio</button>
    </div>
  );
}
