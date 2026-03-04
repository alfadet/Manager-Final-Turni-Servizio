
import { useState, useMemo } from 'react';
import { Batch } from '../types';
import { EMAIL_RECIPIENT, WHATSAPP_RECIPIENT } from '../constants';

interface VenueStat {
  venueName: string;
  months: Record<string, number>;
}

interface VenueStatsViewProps {
  history: Batch[];
  onBack: () => void;
}

export default function VenueStatsView({ history, onBack }: VenueStatsViewProps) {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

  const venueStats = useMemo<Record<string, VenueStat>>(() => {
    const stats: Record<string, VenueStat> = {};
    history.forEach(batch => {
      batch.services.forEach(service => {
        const venueKey = service.venue_name.trim().toUpperCase();
        const date = new Date(service.service_date);
        const monthYear = date.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
        
        if (!stats[venueKey]) {
          stats[venueKey] = { venueName: service.venue_name, months: {} };
        }
        if (!stats[venueKey].months[monthYear]) {
          stats[venueKey].months[monthYear] = 0;
        }
        stats[venueKey].months[monthYear] += service.operators.length;
      });
    });
    return stats;
  }, [history]);

  const sortedVenues = (Object.values(venueStats) as VenueStat[]).sort((a, b) => a.venueName.localeCompare(b.venueName));
  const activeData = selectedVenue ? venueStats[selectedVenue] : null;

  const generateReportText = (data: VenueStat) => {
    let txt = `ALFA SECURITY - ANALISI LOCALE\nLOCALE: ${data.venueName.toUpperCase()}\n==============================\n\n`;
    Object.entries(data.months).forEach(([my, count]) => {
      txt += `• ${my.toUpperCase()}: ${count} Unità / Turni\n`;
    });
    return txt;
  };

  const exportEmail = (data: VenueStat) => {
    const body = generateReportText(data);
    const subject = `REPORT ALFA SECURITY - LOCALE: ${data.venueName.toUpperCase()}`;
    window.open(`mailto:${EMAIL_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const exportWA = (data: VenueStat) => {
    const body = generateReportText(data);
    window.open(`https://wa.me/${WHATSAPP_RECIPIENT.replace(/\D/g, '')}?text=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in zoom-in duration-500">
      <div className="backdrop-blur-3xl bg-white/5 p-8 rounded-[3.5rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Analisi Locali</h2>
          <div className="px-4 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Storico Commesse</span>
          </div>
        </div>

        {activeData ? (
          <div className="animate-in fade-in">
            <button onClick={() => setSelectedVenue(null)} className="text-[10px] font-black text-amber-500 uppercase mb-8 flex items-center gap-2 active:scale-95">← Torna alla lista</button>
            <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 mb-8 shadow-inner">
              <h3 className="text-xl font-black text-white uppercase italic mb-6">{activeData.venueName}</h3>
              <div className="space-y-4">
                {Object.entries(activeData.months).map(([my, count]) => (
                  <div key={my} className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[11px] text-white/30 font-bold uppercase tracking-tight">{my}</span>
                    <span className="text-base font-mono text-emerald-500 font-black">{count} <span className="text-[10px] opacity-40">UNITÀ</span></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => exportEmail(activeData)} className="py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">Report Email</button>
              <button onClick={() => exportWA(activeData)} className="py-5 bg-emerald-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl active:shadow-[0_0_40px_#10b981]">Report WA</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar overscroll-contain">
            {sortedVenues.length > 0 ? sortedVenues.map((v) => (
              <button 
                key={v.venueName} 
                onClick={() => setSelectedVenue(v.venueName.toUpperCase())}
                className="w-full p-6 bg-black/40 border border-white/5 rounded-[2rem] flex justify-between items-center transition-all active:scale-[0.98] active:bg-emerald-500/10 active:border-emerald-500/30 group"
              >
                <span className="text-sm font-black text-white uppercase italic tracking-tight">{v.venueName}</span>
                <span className="text-emerald-500 opacity-0 group-active:opacity-100 transition-opacity">→</span>
              </button>
            )) : <p className="text-center text-white/10 italic text-[10px] py-20 uppercase font-black">Nessun locale registrato</p>}
          </div>
        )}
      </div>

      <button onClick={onBack} className="w-full bg-black/60 backdrop-blur-3xl text-white/40 font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.3em] border border-white/5 active:scale-95 transition-all">Chiudi Database</button>
    </div>
  );
}
