
import React, { useState, useMemo, useEffect } from 'react';
import { 
  AppState, 
  Batch, 
  ServiceEntry, 
  Operator
} from './types';
import { 
  DEFAULT_OPERATORS, 
  GDrive_FILE_ID,
  getDriveUrl,
  getProxyUrl
} from './constants';
import ServiceForm from './components/ServiceForm';
import SummaryView from './components/SummaryView';
import PayloadDisplay from './components/PayloadDisplay';
import SentHistory from './components/SentHistory';
import OperatorStatsView from './components/OperatorStatsView';
import VenueStatsView from './components/VenueStatsView';

const STORAGE_KEY_OPS = 'alfa_security_operators_v6';
const STORAGE_KEY_SENT = 'alfa_security_sent_history_v6';

const App: React.FC = () => {
  const [masterOperators, setMasterOperators] = useState<Operator[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OPS);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return DEFAULT_OPERATORS;
  });

  const [sentBatches, setSentBatches] = useState<Batch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SENT);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [];
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [showOpManager, setShowOpManager] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [rawOpList, setRawOpList] = useState<string>("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OPS, JSON.stringify(masterOperators));
  }, [masterOperators]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SENT, JSON.stringify(sentBatches));
  }, [sentBatches]);

  const [batch, setBatch] = useState<Batch>({
    batch_id: `PROT-${Date.now()}`,
    created_at: new Date().toISOString(),
    services: []
  });

  const [currentService, setCurrentService] = useState<ServiceEntry>({
    id: 1, venue_name: '', location: '', service_date: '', start_time: '', end_time: '', notes: '', operators: [], double_shift: false
  });

  const [error, setError] = useState<string | null>(null);

  const syncFromCloud = async (silent = false) => {
    setIsSyncing(true);
    try {
      const driveUrl = `${getDriveUrl(GDrive_FILE_ID)}&t=${Date.now()}`;
      const proxyUrl = getProxyUrl(driveUrl);
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Connessione fallita");
      const text = await response.text();
      
      const names = text.split(/\r?\n/)
        .map(n => n.trim())
        .filter(n => n.length > 0 && !n.startsWith('<') && !n.includes('<!DOCTYPE'));
      
      if (names.length > 0) {
        const newOps: Operator[] = names.map((name, idx) => ({
          operator_id: `AG-CLD-${idx}-${Date.now()}`,
          operator_name: name
        }));
        
        setMasterOperators(newOps);
        setRawOpList("");
        if (!silent) alert(`Sincronizzazione Platinum completata: ${newOps.length} agenti attivi.`);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Errore Sync:", err);
      if (!silent) alert("Errore critico durante la sincronizzazione cloud.");
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const startNewBatch = async () => {
    await syncFromCloud(true);
    setBatch({
      batch_id: `PROT-${Date.now()}`,
      created_at: new Date().toISOString(),
      services: []
    });
    setCurrentService({
      id: 1, venue_name: '', location: '', service_date: '', start_time: '', end_time: '', notes: '', operators: [], double_shift: false
    });
    setAppState(AppState.CREATING_SERVICE);
    setError(null);
  };

  const handleGoHome = () => {
    if ((appState === AppState.CREATING_SERVICE || appState === AppState.TERMINATED)) {
      if (!window.confirm("Attenzione: i dati della sessione corrente non sono stati salvati. Confermi il ritorno alla dashboard?")) {
        return;
      }
    }
    setAppState(AppState.IDLE);
    setError(null);
    setShowOpManager(false);
  };

  const saveBatchToHistory = (confirmedBatch: Batch) => {
    setSentBatches(prev => [confirmedBatch, ...prev]);
  };

  const availableOperators = useMemo(() => {
    const collisionIds = new Set(
      batch.services
        .filter(s => s.service_date === currentService.service_date)
        .flatMap(s => s.operators.map(o => o.operator_id))
    );
    return masterOperators.filter(op => {
      if (currentService.operators.some(o => o.operator_id === op.operator_id)) return false;
      if (currentService.double_shift) return true;
      return !collisionIds.has(op.operator_id);
    });
  }, [masterOperators, batch.services, currentService.service_date, currentService.double_shift, currentService.operators]);

  return (
    <div className="min-h-[100dvh] bg-[#020202] text-white selection:bg-emerald-500/40 flex flex-col items-center p-4 overflow-x-hidden font-sans antialiased overflow-y-auto custom-scrollbar relative">
      {/* Background Liquid Glass Animato */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[10%] w-[60%] h-[60%] bg-amber-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[70%] h-[70%] bg-emerald-600/10 blur-[130px] rounded-full animate-pulse" style={{ animationDuration: '7s' }}></div>
      </div>

      <header className="w-full max-w-[430px] mb-8 mt-4 flex justify-between items-center backdrop-blur-3xl bg-white/5 border border-white/10 px-6 py-5 rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-top duration-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(245,158,11,0.2)]">
            <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">Alfa Security</h1>
            <p className="text-[9px] text-amber-500 font-mono uppercase tracking-[0.4em] font-bold opacity-80 mt-1">PLATINUM OPS V6</p>
          </div>
        </div>
        {appState !== AppState.IDLE && (
          <button onClick={handleGoHome} className="px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:bg-emerald-500 active:text-black active:shadow-[0_0_30px_#10b981] transition-all">Home</button>
        )}
      </header>

      <main className="w-full max-w-[430px] flex-1 relative flex flex-col gap-6">
        {appState === AppState.IDLE && (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="relative backdrop-blur-3xl bg-white/5 border border-white/10 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
              <div className="p-8">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-amber-500 text-[9px] font-black uppercase tracking-[0.5em] mb-1 opacity-70 italic">Operazioni</h2>
                    <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">Console</h3>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 backdrop-blur-xl animate-pulse">
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Live Status</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button onClick={() => setShowOpManager(!showOpManager)} className={`py-8 rounded-[2rem] border transition-all duration-300 backdrop-blur-2xl flex flex-col items-center gap-3 active:scale-95 ${showOpManager ? 'bg-amber-600/30 border-amber-500/40 text-white shadow-2xl' : 'bg-white/5 border-white/5 text-slate-400 active:bg-emerald-500 active:text-black active:shadow-[0_0_40px_#10b981]'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Anagrafica Staff</span>
                  </button>
                  <button onClick={() => setAppState(AppState.VIEWING_SENT_BATCHES)} className="py-8 rounded-[2rem] bg-white/5 border border-white/5 text-slate-400 flex flex-col items-center gap-3 transition-all duration-300 backdrop-blur-2xl active:scale-95 active:bg-emerald-500 active:text-black active:shadow-[0_0_40px_#10b981]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Registro Invii</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <button onClick={() => setAppState(AppState.VIEWING_OPERATOR_STATS)} className="py-8 rounded-[2rem] bg-white/5 border border-white/5 text-slate-400 flex flex-col items-center gap-3 transition-all duration-300 backdrop-blur-2xl active:scale-95 active:bg-emerald-500 active:text-black active:shadow-[0_0_40px_#10b981]">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    <span className="text-[11px] font-black uppercase tracking-widest italic">Ore Staff</span>
                  </button>
                  <button onClick={() => setAppState(AppState.VIEWING_VENUE_STATS)} className="py-8 rounded-[2rem] bg-white/5 border border-white/5 text-slate-400 flex flex-col items-center gap-3 transition-all duration-300 backdrop-blur-2xl active:scale-95 active:bg-emerald-500 active:text-black active:shadow-[0_0_40px_#10b981]">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    <span className="text-[11px] font-black uppercase tracking-widest italic">Analisi Siti</span>
                  </button>
                </div>

                {showOpManager && (
                  <div className="mb-8 p-6 backdrop-blur-3xl bg-black/60 rounded-[2.5rem] border border-white/10 animate-in slide-in-from-top-4 duration-500 shadow-inner">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Gestione Database Staff</span>
                      <button onClick={() => syncFromCloud()} disabled={isSyncing} className={`text-[9px] px-5 py-2.5 rounded-2xl font-black uppercase transition-all ${isSyncing ? 'bg-slate-800 text-slate-500' : 'bg-amber-500 text-black active:scale-95 active:shadow-[0_0_20px_#fbbf24]'}`}>
                        {isSyncing ? 'Sync...' : 'Aggiorna'}
                      </button>
                    </div>
                    <textarea 
                      className="w-full bg-black/40 border border-white/5 rounded-3xl p-5 text-xs font-mono h-32 text-amber-100/80 focus:outline-none focus:border-amber-500/30 custom-scrollbar shadow-inner mb-4" 
                      placeholder="Nomi operatori, uno per riga..."
                      value={rawOpList || masterOperators.map(o => o.operator_name).join('\n')} 
                      onChange={(e) => setRawOpList(e.target.value)}
                    />
                    <button onClick={() => {
                      const names = rawOpList.split('\n').filter(n => n.trim());
                      if (names.length === 0) return;
                      setMasterOperators(names.map((n, i) => ({ operator_id: `AG-${i}-${Date.now()}`, operator_name: n.trim() })));
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2000);
                    }} className={`w-full py-5 text-[11px] font-black rounded-2xl uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${saveSuccess ? 'bg-emerald-600 text-white' : 'bg-white text-black active:shadow-[0_0_30px_#10b981]'}`}>
                      {saveSuccess ? '✓ DATABASE AGGIORNATO' : 'SALVA MODIFICHE'}
                    </button>
                  </div>
                )}

                <button onClick={startNewBatch} disabled={isSyncing} className="w-full py-7 bg-emerald-500 text-white font-black rounded-[2.5rem] text-sm uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(16,185,129,0.5)] transition-all duration-300 active:scale-95 active:shadow-[0_0_70px_#10b981] flex items-center justify-center gap-4">
                  <svg className={`w-7 h-7 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                  Inizia Nuova Sessione
                </button>
              </div>
            </div>
          </div>
        )}

        {appState === AppState.CREATING_SERVICE && (
          <ServiceForm 
            service={currentService} setService={setCurrentService} availableOperators={availableOperators}
            onToggleOperator={(op) => {
              setCurrentService(prev => {
                const isAssigned = prev.operators.some(o => o.operator_id === op.operator_id);
                return isAssigned 
                  ? { ...prev, operators: prev.operators.filter(o => o.operator_id !== op.operator_id) }
                  : { ...prev, operators: [...prev.operators, op] };
              });
            }}
            onNewService={() => {
              if (!currentService.venue_name || currentService.operators.length === 0) {
                setError("Inserire Nome Sito e assegnare almeno un Operatore."); return;
              }
              setBatch(prev => ({ ...prev, services: [...prev.services, currentService] }));
              setCurrentService(p => ({ ...p, id: p.id + 1, venue_name: '', operators: [], notes: '' }));
              setError(null);
            }}
            onTerminate={() => {
              if (!currentService.venue_name || currentService.operators.length === 0) {
                setError("Dati insufficienti per la chiusura del report."); return;
              }
              const finalBatch = { ...batch, services: [...batch.services, currentService] };
              setBatch(finalBatch);
              setAppState(AppState.TERMINATED);
            }}
            error={error}
          />
        )}

        {appState === AppState.TERMINATED && (
          <SummaryView batch={batch} onConfirm={() => {
            saveBatchToHistory(batch);
            setAppState(AppState.SENT);
          }} onCancel={() => setAppState(AppState.CREATING_SERVICE)} />
        )}
        
        {appState === AppState.SENT && (
          <PayloadDisplay batch={batch} onReset={handleGoHome} />
        )}
        
        {appState === AppState.VIEWING_SENT_BATCHES && (
          <SentHistory history={sentBatches} onBack={handleGoHome} onClear={() => { if(confirm('Svuotare archivio protetto?')) setSentBatches([]); }} />
        )}

        {appState === AppState.VIEWING_OPERATOR_STATS && (
          <OperatorStatsView history={sentBatches} onBack={handleGoHome} />
        )}

        {appState === AppState.VIEWING_VENUE_STATS && (
          <VenueStatsView history={sentBatches} onBack={handleGoHome} />
        )}
      </main>

      <footer className="mt-auto py-8 text-[9px] text-white/20 font-mono text-center uppercase tracking-[0.5em] pb-[env(safe-area-inset-bottom)]">
        ALFA SECURITY SYSTEMS • PROTOCOLLO PLATINUM V6.1
      </footer>
    </div>
  );
};

export default App;
