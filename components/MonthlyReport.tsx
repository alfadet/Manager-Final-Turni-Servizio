
import React, { useMemo } from 'react';
import { HistoricalStats, OperatorMonthlyStat, VenueMonthlyStat, Operator } from '../types';

interface MonthlyReportProps {
  stats: HistoricalStats;
  masterOperators: Operator[];
  onBack: () => void;
  onClear: () => void;
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ stats, masterOperators, onBack, onClear }) => {
  const sortedMonths = useMemo(() => {
    return Object.keys(stats.months).sort((a, b) => b.localeCompare(a));
  }, [stats]);

  const reportTxt = useMemo(() => {
    let txt = "ARCHIVIO STORICO ALFA SECURITY - PLATINUM RECORD\n";
    txt += "================================================\n\n";
    if (sortedMonths.length === 0) return "Nessun record disponibile nell'archivio protetto.";
    sortedMonths.forEach(monthKey => {
      const data = stats.months[monthKey];
      const [year, month] = monthKey.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('it-IT', { month: 'long', year: 'numeric' });
      txt += `LOG PERIODO: ${monthName.toUpperCase()}\n`;
      txt += `------------------------------------------------\n`;
      txt += `ANALISI STAFF:\n`;
      const operatorEntries = (Object.entries(data.operators) as [string, OperatorMonthlyStat][]);
      operatorEntries
        .sort((a, b) => b[1].totalHours - a[1].totalHours)
        .forEach(([opId, s]) => {
          const currentOp = masterOperators.find(o => o.operator_id === opId);
          const displayName = currentOp ? currentOp.operator_name : `OP-EXTRACTED-${opId.slice(-4)}`;
          txt += `- ${displayName.padEnd(25)} | Servizi: ${String(s.serviceCount).padStart(2)} | Ore: ${s.totalHours.toFixed(1)}\n`;
        });
      txt += `\nRILEVAMENTO LOCALI:\n`;
      (Object.entries(data.venues) as [string, VenueMonthlyStat][])
        .sort((a, b) => b[1].operatorServiceCount - a[1].operatorServiceCount)
        .forEach(([name, s]) => {
          txt += `- ${name.padEnd(25)} | Deployment: ${s.operatorServiceCount}\n`;
        });
      txt += `\n\n`;
    });
    return txt;
  }, [stats, sortedMonths, masterOperators]);

  return (
    <div className="space-y-8 animate-in zoom-in duration-700">
      <div className="relative">
        <div className="absolute -inset-1 bg-amber-500/10 rounded-[2.5rem] blur-md"></div>
        <div className="relative bg-[#121212] p-10 rounded-[2.5rem] border border-amber-500/20 shadow-2xl">
          <div className="flex justify-between items-center mb-10 border-b border-amber-900/20 pb-6">
            <h2 className="text-2xl font-black text-amber-500 italic uppercase tracking-tighter">History Log</h2>
            <button onClick={() => { if(window.confirm('Cancellare i dati storici permanentemente?')) onClear(); }} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Purge Records</button>
          </div>

          <div className="bg-black border border-amber-500/10 rounded-[2.5rem] p-8 shadow-inner mb-10">
            <textarea 
              readOnly 
              className="w-full bg-transparent text-amber-100/70 font-mono text-[11px] h-[500px] resize-none focus:outline-none custom-scrollbar leading-relaxed" 
              value={reportTxt} 
            />
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => { navigator.clipboard.writeText(reportTxt); alert('Log storici copiati!'); }} 
              className="relative group w-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-amber-500/10 border border-amber-500/30 rounded-2xl group-hover:bg-amber-500/20 transition-all"></div>
              <div className="relative py-6 rounded-2xl font-black text-amber-500 uppercase text-[11px] tracking-[0.3em]">Copy Historical Archives</div>
            </button>
            <button 
              onClick={onBack}
              className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl hover:bg-amber-500 transition-all active:scale-95"
            >
              Exit to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
