
import React, { useState, useMemo } from 'react';
import { Batch } from '../types';
import { EMAIL_RECIPIENT, WHATSAPP_RECIPIENT, QUESTURA_EMAIL } from '../constants';

interface PayloadDisplayProps {
  batch: Batch;
  onReset: () => void;
  onOpenUtility: () => void;
}

const PayloadDisplay: React.FC<PayloadDisplayProps> = ({ batch, onReset, onOpenUtility }) => {
  // WhatsApp è ora il tab predefinito come richiesto
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp' | 'ore'>('whatsapp');

  // Funzione per generare il suono del "fruscio" (Whoosh)
  const playWhooshSound = () => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const bufferSize = audioCtx.sampleRate * 0.4;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Genera rumore bianco
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      // Frequenza che scende rapidamente per l'effetto fruscio
      filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.35);
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      noise.start();
    } catch (e) {
      console.warn("Audio Context non supportato o bloccato", e);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startTotal = sh * 60 + sm;
    let endTotal = eh * 60 + em;
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
    const header = "Protocollo Operativo Servizi A.s.c Alfa Security\n================================================\n\n";
    return header + batch.services.map(s => (
`PROTOCOLLO OPERATIVO #${s.id}
SITO: ${s.venue_name.toUpperCase()} (${s.location.toUpperCase()})
DATA: ${s.service_date}
ORARIO: ${s.start_time} - ${s.end_time}
UNITÀ ASSEGNATE: ${s.operators.map(o => o.operator_name.toUpperCase()).join(', ')}
NOTE: ${s.notes ? s.notes.toUpperCase() : 'NESSUNA SPECIFICA RILEVATA'}
------------------------------------`
    )).join('\n\n');
  };

  const waCompact = `ALFA SECURITY - REPORT ATTIVITÀ:\n\n${batch.services.map(s => 
    `📍 SITO: ${s.venue_name} (${s.location})\n📅 DATA: ${s.service_date}\n⏰ ORARIO: ${s.start_time}-${s.end_time}\n👥 STAFF: ${s.operators.map(o => o.operator_name.toUpperCase()).join(', ')}${s.notes ? `\n📝 NOTE: ${s.notes.toUpperCase()}` : ''}`
  ).join('\n\n')}`;

  const openMailto = (recipient: string, subject: string, body: string) => {
    const link = document.createElement('a');
    link.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyAndEmail = () => {
    playWhooshSound();
    const body = generateSummaryText();
    navigator.clipboard.writeText(body);
    const subject = `REPORT ALFA SECURITY - ${new Date().toLocaleDateString('it-IT')}`;
    openMailto(EMAIL_RECIPIENT, subject, body);
  };

  const sendToQuestura = () => {
    playWhooshSound();
    const body = generateSummaryText();
    navigator.clipboard.writeText(body);
    const subject = `COMUNICAZIONE SERVIZI - ALFA SECURITY - ${new Date().toLocaleDateString('it-IT')}`;
    openMailto(QUESTURA_EMAIL, subject, body);
  };

  const launchWA = () => {
    playWhooshSound();
    window.open(`https://wa.me/${WHATSAPP_RECIPIENT.replace(/\D/g, '')}?text=${encodeURIComponent(waCompact)}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in zoom-in duration-700 pb-10">
      <div className="backdrop-blur-3xl bg-white/5 p-8 rounded-[3.5rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col gap-6 mb-10">
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Protocollo d'Invio</h2>
          <div className="flex bg-black/40 p-1.5 rounded-[2.2rem] border border-white/5 shadow-inner backdrop-blur-3xl">
            {(['whatsapp', 'email', 'ore'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); playWhooshSound(); }} 
                className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${activeTab === tab ? 'bg-emerald-500 text-black shadow-2xl scale-100' : 'text-white/30 hover:text-white/60'}`}
              >
                {tab === 'ore' ? 'Analisi' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === 'whatsapp' ? (
            <div className="space-y-6 flex flex-col items-center">
              <textarea readOnly className="w-full bg-black/40 border border-white/5 rounded-[2.5rem] p-6 text-[11px] font-mono h-56 text-emerald-100/60 focus:outline-none custom-scrollbar shadow-inner" value={waCompact} />
              
              {/* Pulsante Questura Trento: colore blu gradiente */}
              <button 
                onClick={sendToQuestura} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.3em] shadow-[0_20px_40px_rgba(37,99,235,0.4)] active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border border-blue-400/30"
              >
                <span>Invia alla Questura Trento</span>
                <span className="text-[8px] font-bold opacity-70 normal-case tracking-normal px-6 text-center leading-tight">
                  Attenzione La comunicazione partirà immediatamente solo quando Premi invio @mail
                </span>
              </button>

              {/* Pulsante WhatsApp in evidenza: colore verde brillante, glow e animazione pulse */}
              <button 
                onClick={launchWA} 
                className="w-full group relative"
              >
                <div className="absolute -inset-1 bg-emerald-500/40 rounded-[2.5rem] blur-xl opacity-75 group-hover:opacity-100 animate-pulse transition duration-1000"></div>
                <div className="relative bg-emerald-500 text-white font-black py-7 rounded-[2.5rem] uppercase text-xs tracking-[0.4em] shadow-[0_20px_40px_rgba(16,185,129,0.5)] active:scale-95 transition-all flex items-center justify-center gap-4 border border-emerald-400">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  TRASMETTI VIA WHATSAPP
                </div>
              </button>

              {/* Pulsante Utility e Modifiche: colore giallo */}
              <button 
                onClick={onOpenUtility} 
                className="w-full bg-amber-400 text-black font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.3em] shadow-xl active:scale-95 transition-all mt-4 border border-amber-500/30"
              >
                Utility e Modifiche
              </button>
            </div>
          ) : activeTab === 'ore' ? (
            <div className="space-y-6">
              <textarea readOnly className="w-full bg-black/40 border border-white/5 rounded-[2.5rem] p-6 text-[11px] font-mono h-56 text-amber-100/60 focus:outline-none custom-scrollbar shadow-inner" value={reportTxt} />
              <button onClick={() => { playWhooshSound(); navigator.clipboard.writeText(reportTxt); alert('Analisi ore copiata negli appunti!'); }} className="w-full bg-white text-black font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.3em] shadow-xl active:scale-95 transition-all active:shadow-[0_0_40px_#10b981]">Copia Dati Analitici</button>
            </div>
          ) : (
            <div className="space-y-6">
              <textarea readOnly className="w-full bg-black/40 border border-white/5 rounded-[2.5rem] p-6 text-[11px] font-mono h-56 text-white/50 focus:outline-none custom-scrollbar shadow-inner" value={generateSummaryText()} />
              <button onClick={copyAndEmail} className="w-full bg-emerald-500 text-white font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.4em] shadow-xl active:scale-95 transition-all active:shadow-[0_0_60px_#10b981]">Copia e Genera Email</button>
            </div>
          )}
        </div>
      </div>

      <button onClick={() => { playWhooshSound(); onReset(); }} className="w-full bg-black/60 backdrop-blur-3xl text-amber-500 font-black py-6 rounded-[2.5rem] uppercase text-[11px] tracking-[0.4em] border border-amber-500/20 active:scale-95 transition-all active:bg-amber-500 active:text-black">Fine Turno Operativo</button>
    </div>
  );
};

export default PayloadDisplay;
