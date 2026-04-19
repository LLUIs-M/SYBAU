import React from 'react';
import type { TuningOptions } from '../types';

interface Props {
  options: TuningOptions;
  onChange: (opts: TuningOptions) => void;
  popupClass?: string;
}

export default function TuningPanel({ options, onChange, popupClass }: Props) {
  const handleChange = (key: keyof TuningOptions, value: number | undefined) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className={`absolute ${popupClass ?? "top-[120%] right-0 mt-2"} w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 animate-in fade-in zoom-in-95 p-4 z-60`}>
      <div className="flex items-center gap-2 mb-4 text-zinc-800 dark:text-zinc-200">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        <span className="font-semibold text-sm">Tune (Inference)</span>
      </div>

      <div className="space-y-4">
        {/* Temperature */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">Temperature</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-mono">{options.temperature}</span>
          </div>
          <input
            type="range"
            min="0" max="2" step="0.1"
            value={options.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1">
            Menos = exacto código, Más = creatividad
          </p>
        </div>

        {/* Context Window */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">Context (num_ctx)</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-mono">{options.num_ctx}</span>
          </div>
          <input
            type="range"
            min="1024" max="32768" step="1024"
            value={options.num_ctx}
            onChange={(e) => handleChange('num_ctx', parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1">
            Tokens de memoria. Requiere más RAM.
          </p>
        </div>

        {/* Seed */}
        <div className="pt-2 border-t border-zinc-100 dark:border-white/5">
          <label className="text-xs text-zinc-600 dark:text-zinc-400 font-medium block mb-1">Seed Fija (opcional)</label>
          <input
            type="number"
            placeholder="Random por defecto..."
            value={options.seed !== undefined ? options.seed : ""}
            onChange={(e) => handleChange('seed', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
          />
        </div>
      </div>
    </div>
  );
}
