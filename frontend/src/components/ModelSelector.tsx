import { useState, useRef, useEffect } from "react";
import type { ModelInfo } from "../types";
import { getModelIcon } from "../utils/modelIcons";

interface Props {
  value: string;
  models: ModelInfo[];
  onChange: (model: string) => void;
  onOpenPullModal?: () => void;
}

export default function ModelSelector({ value, models, onChange, onOpenPullModal }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = models.find((m) => m.value === value) ?? models[0] ?? { value: value, label: value };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 text-xs border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-2 outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/8 hover:border-zinc-300 dark:hover:border-white/20 transition-colors"
      >
        <img
          src={getModelIcon(selected.value)}
          alt=""
          className="w-4 h-4 object-contain shrink-0"
        />
        <span className="max-w-[120px] truncate">{selected.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 max-h-64 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 py-1">
          {models.map((m) => (
            <button
              key={m.value}
              onClick={() => {
                onChange(m.value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors
                ${
                  m.value === value
                    ? "bg-zinc-100 dark:bg-white/8 text-zinc-900 dark:text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                }`}
            >
              <img
                src={getModelIcon(m.value)}
                alt=""
                className="w-4 h-4 object-contain shrink-0"
              />
              <span className="truncate">{m.label}</span>
              {m.value === value && (
                <svg
                  className="ml-auto shrink-0 text-indigo-500"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
          
          {onOpenPullModal && (
            <>
              <div className="h-px bg-zinc-200 dark:bg-white/10 my-1 mx-2" />
              <button
                onClick={() => {
                  setOpen(false);
                  onOpenPullModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-medium list-none"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 object-contain">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="truncate">Descargar modelo..</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
