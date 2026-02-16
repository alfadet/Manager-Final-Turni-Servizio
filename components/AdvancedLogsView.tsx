
import React, { useState, useMemo } from 'react';
import { Batch } from '../types';
import { EMAIL_RECIPIENT, WHATSAPP_RECIPIENT } from '../constants';

interface AdvancedLogsViewProps {
  history: Batch[];
  onBack: () => void;
}

const AdvancedLogsView: React.FC<AdvancedLogsViewProps> = ({ history, onBack }) => {
  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState<number>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startTotal = sh * 60 + sm;
    let endTotal = eh * 60 + em;
    if (endTotal <= startTotal) endTotal += 24 * 60;
    return (endTotal - startTotal) / 60;
  };

  const filteredLogs = useMemo(() => {
    const logs: Array<{
      opName: string;
      date: string;
      hours: number;
      venue: string;
    }> = [];

    history.forEach(batch => {
      batch.services.forEach(service => {
        const dateObj = new Date(service.service_date);
        if (dateObj.getFullYear() === filterYear && (dateObj.getMonth() + 1) === filterMonth) {
          const duration = calculateDuration(service.start_time, service.end_time);
          service.operators.forEach(op => {
            logs.push({
              opName: op.operator_name,
              date: service.service_date,
              hours: duration,
              venue: service.venue_name
            });
          });
        }
      });
    });

    return logs.sort((a, b) => b.date.localeCompare(a.date) || a.opName.localeCompare(b.opName));
  }, [history, filterYear, filterMonth]);

  const reportTxt = useMemo(() => {
    const monthName = new Date(filterYear, filterMonth - 1).toLocaleString('it-IT', { month: 'long' }).toUpperCase();
    let txt = `ALFA SECURITY - REGISTRO AVANZATO TURNI\nPERIODO: ${monthName} ${filterYear}\n====================================\n\n`;
    
    if (filteredLogs.length === 0) return txt + "NESSUN SERVIZIO RILEVATO NEL PERIODO.";

    filteredLogs.forEach(log => {
      txt += `DATA: ${log.date} | AGENTE: ${log.opName.padEnd(15)} | ORE: ${log.hours.toFixed(1).padStart(4)} | SITO: ${log.venue}\n`;
    });

    txt += `\nRIEPILOGO ORE TOTALI PER AGENTE:\n------------------------------------\n`;
    const summary: Record<string, number> = {};
    filteredLogs.forEach(log => {
      summary[log.opName] = (summary[log.opName] || 0) + log.hours;
    });

    Object.entries(summary).sort((a,b) => b[1] - a[1]).forEach(([name, hours]) => {
      txt += `• ${name.padEnd(20)}: ${hours.toFixed(1)} ore totali\n`;
    });

    return txt;
  }, [filteredLogs, filterYear, filterMonth]);

  const exportEmail = () => {
    const subject = `LOG AVANZATI ALFA SECURITY - ${filterMonth}/${filterYear}`;
    window.location.href = `mailto:${EMAIL_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(reportTxt)}`;
  };

  const exportWA = () => {
    window.open(`https://wa.me/${WHATSAPP_RECIPIENT.replace(/\D/g, '')}?text=${encodeURIComponent(reportTxt)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reportTxt);
    alert('Report copiato negli appunti!');
  };

  return (
    <div className="space-y-6 animate-in zoom-in duration-500">
      <div className="backdrop-blur-3xl bg-white/5 p-8 rounded-[3.5rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Log Avanzati</h2>
          <div className="px-4 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Master Logs</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Anno</label>
            <select 
              value={filterYear} 
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white appearance-none"
            >
              {[currentYear, currentYear-1, currentYear-2].map(y => <option key={y} value={y} className="bg-zinc-900">{y}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Mese</label>
            <select 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white appearance-none"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m} className="bg-zinc-900">
                  {new Date(0, m-1).toLocaleString('it-IT', { month: 'long' }).toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-6 shadow-inner mb-8 overflow-hidden">
           <textarea 
              readOnly 
              className="w-full bg-transparent text-amber-100/60 font-mono text-[10px] h-64 resize-none focus:outline-none custom-scrollbar leading-relaxed" 
              value={reportTxt} 
            />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <button onClick={exportEmail} className="py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">Email Log</button>
            <button onClick={exportWA} className="py-5 bg-emerald-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">WhatsApp</button>
          </div>
          <button onClick={copyToClipboard} className="w-full py-5 bg-amber-500 text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all">Copia per Excel / Incolla</button>
        </div>
      </div>

      <button onClick={onBack} className="w-full bg-black/60 backdrop-blur-3xl text-white/40 font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.3em] border border-white/5 active:scale-95 transition-all">Chiudi Finestra</button>
    </div>
  );
};

export default AdvancedLogsView;
