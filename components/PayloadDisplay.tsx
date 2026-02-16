
import React, { useState, useMemo } from 'react';
import { Batch } from '../types';
import { EMAIL_RECIPIENT, WHATSAPP_RECIPIENT } from '../constants';

interface PayloadDisplayProps {
  batch: Batch;
  onReset: () => void;
}

const PayloadDisplay: React.FC<PayloadDisplayProps> = ({ batch, onReset }) => {
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp' | 'ore'>('email');

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startTotal = sh * 60 + sm;
    let endTotal = eh * 60 + em;
    // Gestione del turno che attraversa la mezzanotte
    if (endTotal <= startTotal) endTotal += 24 * 60;
    return (endTotal - startTotal) / 60;
  };

  const reportTxt = useMemo(() => {
    const months: Record<string, Record<string, number>> = {};
    batch.services.forEach(s => {
      const date = new Date(s.service_date);
      const monthYear = date.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
      const duration = calculateDuration(s.start_time, s.end_time);
      if (!months[monthYear]) months[monthYear] = {};
      s.operators.forEach(op => {
        if (!months[monthYear][op.operator_name]) months[monthYear][op.operator_name] = 0;
        months[monthYear][op.operator_name] += duration;
      });
    });
    let txt = "ALFA SECURITY - ANALISI OPERATIVA ORE\n====================================\n\n";
    Object.entries(months).forEach(([month, ops]) => {
      txt += `PERIODO DI RIFERIMENTO: ${month.toUpperCase()}\n`;
      Object.entries(ops).forEach(([name, hours]) => {
        txt += `• ${name.padEnd(20)} | ${hours.toFixed(2)} ore\n`;
      });
      txt += "\n";
    });
    return txt;
  }, [batch.services]);

  const generateSummaryText = () => {
    return batch.services.map(s => (
`PROTOCOLLO OPERATIVO #${s.id}
SITO: ${s.venue_name.toUpperCase()}
DATA: ${s.service_date}
ORARIO: ${s.start_time} - ${s.end_time}
UNITÀ ASSEGNATE: ${s.operators.map(o => o.operator_name).join(', ')}
NOTE: ${s.notes || 'Nessuna specifica rilevata'}
------------------------------------`
    )).join('\n\n');
  };

  const waCompact = `ALFA SECURITY - REPORT ATTIVITÀ:\n\n${batch.services.map(s => 
    `📍 SITO: ${s.venue_name}\n📅 DATA: ${s.service_date}\n⏰ ORARIO: ${s.start_time}-${s.end_time}\n👥 STAFF: ${s.operators.map(o => o.operator_name).join(', ')}`
  ).join('\n\n')}`;

  const copyAndEmail = () => {
    const body = generateSummaryText();
    navigator.clipboard.writeText(body);
    const subject = `REPORT ALFA SECURITY - ${new Date().toLocaleDateString('it-IT')}`;
    window.location.href = `mailto:${EMAIL_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const launchWA = () => {
    window.open(`https://wa.me/${WHATSAPP_RECIPIENT.replace(/\D/g, '')}?text=${encodeURIComponent(waCompact)}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in zoom-in duration-700">
      <div className="backdrop-blur-3xl bg-white/5 p-8 rounded-[3.5rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col gap-6 mb-10">
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Protocollo d'Invio</h2>
          <div className="flex bg-black/40 p-1.5 rounded-[2.2rem] border border-white/5 shadow-inner backdrop-blur-3xl">
            {(['email', 'whatsapp', 'ore'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${activeTab === tab ? 'bg-amber-500 text-black shadow-2xl scale-100' : 'text-white/30 hover:text-white/60'}`}
              >
                {tab === 'ore' ? 'Analisi Ore' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === 'whatsapp' ? (
            <div className="space-y-6">
              <textarea readOnly className="w-full bg-black/40 border border-white/5 rounded-[2.5rem] p-6 text-[11px] font-mono h-56 text-emerald-100/60 focus:outline-none custom-scrollbar shadow-inner" value={waCompact} />
              <button onClick={launchWA} className="w-full bg-emerald-500 text-white font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.4em] shadow-xl active:scale-95 transition-all active:shadow-[0_0_60px_#10b981]">Trasmetti via WhatsApp</button>
            </div>
          ) : activeTab === 'ore' ? (
            <div className="space-y-6">
              <textarea readOnly className="w-full bg-black/40 border border-white/5 rounded-[2.5rem] p-6 text-[11px] font-mono h-56 text-amber-100/60 focus:outline-none custom-scrollbar shadow-inner" value={reportTxt} />
              <button onClick={() => { navigator.clipboard.writeText(reportTxt); alert('Analisi ore copiata negli appunti!'); }} className="w-full bg-white text-black font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.3em] shadow-xl active:scale-95 transition-all active:shadow-[0_0_40px_#10b981]">Copia Dati Analitici</button>
            </div>
          ) : (
            <div className="space-y-6">
              <textarea readOnly className="w-full bg-black/40 border border-white/5 rounded-[2.5rem] p-6 text-[11px] font-mono h-56 text-white/50 focus:outline-none custom-scrollbar shadow-inner" value={generateSummaryText()} />
              <button onClick={copyAndEmail} className="w-full bg-emerald-500 text-white font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.4em] shadow-xl active:scale-95 transition-all active:shadow-[0_0_60px_#10b981]">Copia e Genera Email</button>
            </div>
          )}
        </div>
      </div>

      <button onClick={onReset} className="w-full bg-black/60 backdrop-blur-3xl text-amber-500 font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.4em] border border-amber-500/20 active:scale-95 transition-all active:bg-amber-500 active:text-black">Fine Turno Operativo</button>
    </div>
  );
};

export default PayloadDisplay;
