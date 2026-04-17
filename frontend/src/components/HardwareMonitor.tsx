import { useEffect, useState } from "react";

interface ModelSys {
  name: string;
  size: number;
  size_vram: number;
}

export default function HardwareMonitor() {
  const [runningModels, setRunningModels] = useState<ModelSys[]>([]);

  const fetchPs = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/ps");
      if (res.ok) {
        const data = await res.json();
        setRunningModels(data.models || []);
      }
    } catch (e) {
      // suppress passive polling errors
    }
  };

  useEffect(() => {
    fetchPs();
    const interval = setInterval(fetchPs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUnload = async (modelName: string) => {
    try {
      await fetch("http://127.0.0.1:5000/unload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName }),
      });
      fetchPs();
    } catch (e) {
      console.error(e);
    }
  };

  if (runningModels.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 pointer-events-auto">
      {runningModels.map((m, idx) => (
        <div 
          key={idx} 
          className="bg-black/80 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-700 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          
          <div className="flex flex-col">
            <span className="font-semibold text-white tracking-wide truncate max-w-[120px]">
              {m.name}
            </span>
            <span className="text-[10px] text-zinc-400">
              VRAM: {(m.size_vram / 1024 / 1024 / 1024).toFixed(1)} GB
            </span>
          </div>

          <div className="w-px h-6 bg-zinc-700/50 mx-1"></div>

          <button 
            onClick={() => handleUnload(m.name)}
            title="Descargar de VRAM"
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
