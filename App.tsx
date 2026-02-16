
import React, { useState, useMemo, useEffect } from 'react';
import { 
  AppState, 
  Batch, 
  ServiceEntry, 
  Operator,
  Venue
} from './types';
import { 
  DEFAULT_OPERATORS,
  GOOGLE_APPS_SCRIPT_URL
} from './constants';
import ServiceForm from './components/ServiceForm';
import SummaryView from './components/SummaryView';
import PayloadDisplay from './components/PayloadDisplay';
import SentHistory from './components/SentHistory';
import AdvancedLogsView from './components/AdvancedLogsView';

const DB_KEY_OPS = 'ALFA_DB_OPERATORS_V7';
const DB_KEY_VENUES = 'ALFA_DB_VENUES_V7';
const DB_KEY_HISTORY = 'ALFA_DB_HISTORY_V7';
const INSTALL_KEY = 'ALFA_INSTALL_SHOWN';

const App: React.FC = () => {
  const [masterOperators, setMasterOperators] = useState<Operator[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_OPS);
      return saved ? JSON.parse(saved) : DEFAULT_OPERATORS;
    } catch { return DEFAULT_OPERATORS; }
  });

  const [masterVenues, setMasterVenues] = useState<Venue[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_VENUES);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [sentBatches, setSentBatches] = useState<Batch[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [showInstallOverlay, setShowInstallOverlay] = useState(false);

  useEffect(() => {
    // Verifica se l'app è già in modalità standalone (installata)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                         || (window.navigator as any).standalone 
                         || document.referrer.includes('android-app://');
    
    const wasShown = localStorage.getItem(INSTALL_KEY);
    
    if (!isStandalone && !wasShown) {
      setShowInstallOverlay(true);
    }
  }, []);

  const dismissInstall = () => {
    localStorage.setItem(INSTALL_KEY, 'true');
    setShowInstallOverlay(false);
  };

  useEffect(() => {
    localStorage.setItem(DB_KEY_OPS, JSON.stringify(masterOperators));
  }, [masterOperators]);

  useEffect(() => {
    localStorage.setItem(DB_KEY_VENUES, JSON.stringify(masterVenues));
  }, [masterVenues]);

  useEffect(() => {
    localStorage.setItem(DB_KEY_HISTORY, JSON.stringify(sentBatches));
  }, [sentBatches]);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [showOpManager, setShowOpManager] = useState(false);
  const [showVenueManager, setShowVenueManager] = useState(false);
  const [newOpName, setNewOpName] = useState("");
  const [newVenueName, setNewVenueName] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const [batch, setBatch] = useState<Batch>({
    batch_id: `PROT-${Date.now()}`,
    created_at: new Date().toISOString(),
    services: []
  });

  const [currentService, setCurrentService] = useState<ServiceEntry>({
    id: 1, venue_name: '', location: '', service_date: '', start_time: '', end_time: '', notes: '', operators: [], double_shift: false
  });

  const [error, setError] = useState<string | null>(null);

  const syncToCloud = async (data: Batch) => {
    if (GOOGLE_APPS_SCRIPT_URL === 'URL_WEBAPP') return;
    setIsSyncing(true);
    try {
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error('Cloud Sync Error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportDB = () => {
    const backup = { masterOperators, masterVenues, sentBatches, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ALFA_SECURITY_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.masterOperators) setMasterOperators(data.masterOperators);
        if (data.masterVenues) setMasterVenues(data.masterVenues);
        if (data.sentBatches) setSentBatches(data.sentBatches);
        alert("Database Platinum ripristinato con successo!");
      } catch {
        alert("Errore: Il file di backup non è valido.");
      }
    };
    reader.readAsText(file);
  };

  const addOperator = () => {
    if (!newOpName.trim()) return;
    setMasterOperators([...masterOperators, { operator_id: `AG-${Date.now()}`, operator_name: newOpName.trim() }]);
    setNewOpName("");
  };

  const addVenue = () => {
    if (!newVenueName.trim()) return;
    setMasterVenues([...masterVenues, { venue_id: `VN-${Date.now()}`, venue_name: newVenueName.trim() }]);
    setNewVenueName("");
  };

  const handleGoHome = () => {
    if (appState === AppState.CREATING_SERVICE || appState === AppState.TERMINATED) {
      if (!confirm("I dati non inviati della sessione corrente andranno persi. Tornare alla Dashboard?")) return;
    }
    setAppState(AppState.IDLE);
    setShowOpManager(false);
    setShowVenueManager(false);
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
      
      {/* Install Overlay (PWA Prompt) */}
      {showInstallOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-500">
          <div className="w-full max-w-[380px] bg-zinc-900/50 border border-white/10 rounded-[3.5rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.9)] flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
            
            <div className="w-20 h-20 bg-emerald-500 rounded-3xl mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-float">
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>

            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-white">Inizializzazione Sistema</h2>
            <p className="text-[11px] text-white/50 leading-relaxed mb-10 font-medium px-4">
              Per un'esperienza operativa ottimale e l'accesso rapido senza barre del browser, aggiungi <span className="text-emerald-400">Alfa Security</span> alla tua schermata home.
            </p>

            <div className="w-full space-y-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-2">Come fare:</p>
                <p className="text-[10px] text-white/60">
                  Premi <span className="text-white font-bold">"Condividi"</span> o <span className="text-white font-bold">"Opzioni Browser"</span> e seleziona <span className="text-emerald-400 font-bold">"Aggiungi a Home"</span>.
                </p>
              </div>
              
              <button onClick={dismissInstall} className="w-full py-5 bg-white text-black font-black rounded-2xl text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all">
                Prosegui nel Browser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background FX */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-black">
        <div className="absolute top-[-5%] left-[10%] w-[60%] h-[60%] bg-amber-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[70%] h-[70%] bg-emerald-600/10 blur-[130px] rounded-full animate-pulse" style={{ animationDuration: '7s' }}></div>
      </div>

      <header className="w-full max-w-[430px] mb-8 mt-4 flex justify-between items-center backdrop-blur-3xl bg-white/5 border border-white/10 px-6 py-5 rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-black uppercase italic text-white leading-none tracking-tighter">Alfa Security</h1>
            <p className="text-[9px] text-amber-500 font-mono uppercase tracking-[0.4em] font-bold mt-1">PLATINUM MS v7.5 CLOUD</p>
          </div>
        </div>
        {appState !== AppState.IDLE && (
          <button onClick={handleGoHome} className="px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:bg-emerald-500 active:text-black transition-all">Home</button>
        )}
      </header>

      <main className="w-full max-w-[430px] flex-1 relative flex flex-col gap-6">
        {appState === AppState.IDLE && (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="relative backdrop-blur-3xl bg-white/5 border border-white/10 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.7)] p-8">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-amber-500 text-[9px] font-black uppercase tracking-[0.5em] mb-1 italic">Gestore</h2>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tight">Dashboard</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={handleExportDB} className="text-[8px] px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-black uppercase active:bg-emerald-500 active:text-black">Backup</button>
                  <label className="text-[8px] px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 font-black uppercase cursor-pointer active:bg-amber-500 active:text-black text-center">
                    Import
                    <input type="file" onChange={handleImportDB} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => {setShowOpManager(!showOpManager); setShowVenueManager(false);}} className={`relative py-8 rounded-[2rem] border transition-all duration-300 backdrop-blur-2xl flex flex-col items-center gap-3 ${showOpManager ? 'bg-amber-600/30 border-amber-500/40 text-white' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                  <div className="absolute top-4 right-4 bg-amber-500 text-black text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center shadow-lg">{masterOperators.length}</div>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Staff</span>
                </button>
                <button onClick={() => {setShowVenueManager(!showVenueManager); setShowOpManager(false);}} className={`relative py-8 rounded-[2rem] border transition-all duration-300 backdrop-blur-2xl flex flex-col items-center gap-3 ${showVenueManager ? 'bg-emerald-600/30 border-emerald-500/40 text-white' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                  <div className="absolute top-4 right-4 bg-emerald-500 text-black text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center shadow-lg">{masterVenues.length}</div>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Locali</span>
                </button>
              </div>

              {showOpManager && (
                <div className="mb-6 p-6 backdrop-blur-3xl bg-black/60 rounded-[2.5rem] border border-white/10 animate-in slide-in-from-top duration-300">
                  <div className="flex gap-2 mb-6">
                    <input type="text" value={newOpName} onChange={(e) => setNewOpName(e.target.value)} placeholder="Nome Agente..." className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-xs text-white uppercase font-bold" />
                    <button onClick={addOperator} className="bg-emerald-500 text-black font-black px-5 rounded-2xl text-[10px]">+</button>
                  </div>
                  <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                    {masterOperators.map(op => (
                      <div key={op.operator_id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[11px] font-bold text-white/70 uppercase">{op.operator_name}</span>
                        <button onClick={() => setMasterOperators(masterOperators.filter(o => o.operator_id !== op.operator_id))} className="text-rose-500/50 hover:text-rose-500 text-[10px] font-black uppercase">Elimina</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showVenueManager && (
                <div className="mb-6 p-6 backdrop-blur-3xl bg-black/60 rounded-[2.5rem] border border-white/10 animate-in slide-in-from-top duration-300">
                  <div className="flex gap-2 mb-6">
                    <input type="text" value={newVenueName} onChange={(e) => setNewVenueName(e.target.value)} placeholder="Nome Locale..." className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-xs text-white uppercase font-bold" />
                    <button onClick={addVenue} className="bg-emerald-500 text-black font-black px-5 rounded-2xl text-[10px]">+</button>
                  </div>
                  <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                    {masterVenues.map(vn => (
                      <div key={vn.venue_id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[11px] font-bold text-white/70 uppercase">{vn.venue_name}</span>
                        <button onClick={() => setMasterVenues(masterVenues.filter(v => v.venue_id !== vn.venue_id))} className="text-rose-500/50 hover:text-rose-500 text-[10px] font-black uppercase">Elimina</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => setAppState(AppState.VIEWING_ADVANCED_LOGS)} className="py-8 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 text-amber-500 flex flex-col items-center gap-3 transition-all active:scale-95 active:bg-amber-500 active:text-black">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Statistiche</span>
                </button>
                <button onClick={() => setAppState(AppState.VIEWING_SENT_BATCHES)} className="py-8 rounded-[2rem] bg-white/5 border border-white/5 text-slate-400 flex flex-col items-center gap-3 transition-all active:bg-emerald-500 active:text-black">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Registro</span>
                </button>
              </div>

              <button onClick={() => {
                setBatch({ batch_id: `PROT-${Date.now()}`, created_at: new Date().toISOString(), services: [] });
                setCurrentService({ id: 1, venue_name: '', location: '', service_date: '', start_time: '', end_time: '', notes: '', operators: [], double_shift: false });
                setAppState(AppState.CREATING_SERVICE);
                setError(null);
              }} className="w-full py-7 bg-emerald-500 text-white font-black rounded-[2.5rem] text-sm uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(16,185,129,0.5)] transition-all active:scale-95 flex items-center justify-center gap-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                Compila Report
              </button>
            </div>
          </div>
        )}

        {appState === AppState.CREATING_SERVICE && (
          <ServiceForm 
            service={currentService} setService={setCurrentService} 
            availableOperators={availableOperators} masterVenues={masterVenues}
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
                setError("Selezionare un Locale e almeno un Operatore."); return;
              }
              setBatch(prev => ({ ...prev, services: [...prev.services, currentService] }));
              setCurrentService(p => ({ ...p, id: p.id + 1, venue_name: '', operators: [], notes: '', service_date: p.service_date, start_time: p.start_time, end_time: p.end_time }));
              setError(null);
            }}
            onTerminate={() => {
              if (!currentService.venue_name || currentService.operators.length === 0) {
                setError("Dati insufficienti per chiudere il report."); return;
              }
              setBatch(prev => ({ ...prev, services: [...prev.services, currentService] }));
              setAppState(AppState.TERMINATED);
            }}
            error={error}
          />
        )}

        {appState === AppState.TERMINATED && (
          <SummaryView batch={batch} isSyncing={isSyncing} onConfirm={() => {
            const finalBatch = batch;
            setSentBatches(prev => [finalBatch, ...prev]);
            syncToCloud(finalBatch);
            setAppState(AppState.SENT);
          }} onCancel={() => setAppState(AppState.CREATING_SERVICE)} />
        )}
        
        {appState === AppState.SENT && (
          <PayloadDisplay batch={batch} onReset={handleGoHome} />
        )}
        
        {appState === AppState.VIEWING_SENT_BATCHES && (
          <SentHistory history={sentBatches} onBack={handleGoHome} onClear={() => { if(confirm('Svuotare archivio?')) setSentBatches([]); }} />
        )}

        {appState === AppState.VIEWING_ADVANCED_LOGS && (
          <AdvancedLogsView history={sentBatches} onBack={handleGoHome} />
        )}
      </main>

      <footer className="mt-auto py-8 text-[9px] text-white/20 font-mono text-center uppercase tracking-[0.5em] opacity-40">
        ALFA SECURITY SYSTEMS • STAZIONE OPERATIVA V7.5
      </footer>
    </div>
  );
};

export default App;
