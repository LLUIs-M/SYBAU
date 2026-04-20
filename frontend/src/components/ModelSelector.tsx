import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ModelInfo, Persona } from "../types";
import { getModelIcon } from "../utils/modelIcons";

interface Props {
  value: string;
  models: ModelInfo[];
  personas?: Persona[];
  activePersonaName?: string | null;
  onChange: (model: string) => void;
  onPersonaToggle?: (personaName: string) => void;
  onOpenPullModal?: () => void;
  onDeletePersona?: (id: string) => void;
  compact?: boolean;
}

export default function ModelSelector({
  value,
  models,
  personas = [],
  activePersonaName = null,
  onChange,
  onPersonaToggle,
  onOpenPullModal,
  onDeletePersona,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = models.find((m) => m.value === value) ??
    models[0] ?? { value: value, label: value };

  const calcPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      bottom: window.innerHeight - rect.top + 6,
      left: rect.left,
      width: 240,
      zIndex: 9999,
    });
  };

  const handleOpen = () => {
    calcPosition();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const inTrigger = ref.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inTrigger && !inDropdown) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const hasActivePersona = !!activePersonaName;

  const dropdown = open
    ? createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="max-h-72 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 py-1"
        >
          {/* Personas section */}
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-semibold px-3 pt-2 pb-1">
            Personas
          </p>
          {personas.length === 0 ? (
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 px-3 py-2 italic">
              No personas yet
            </p>
          ) : (
            personas.map((p) => {
              const isActive = activePersonaName === p.name;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    onPersonaToggle?.(p.name);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors group
                    ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 uppercase ${
                    isActive
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}>
                    {p.name.charAt(0)}
                  </span>
                  <span className="truncate flex-1">{p.name}</span>
                  {isActive && (
                    <svg
                      className="shrink-0 text-indigo-500"
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
                  {onDeletePersona && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePersona(p.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 shrink-0 text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-all"
                      title="Delete persona"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </button>
              );
            })
          )}
          <div className="h-px bg-zinc-200 dark:bg-white/10 my-1 mx-2" />

          {/* Models section */}
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-semibold px-3 pt-2 pb-1">
            Models
          </p>
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="shrink-0 object-contain"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="truncate">Descargar modelo..</span>
              </button>
            </>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={ref} className="relative flex items-center gap-1.5">
      {/* Persona badge — shown when a persona is active */}
      {hasActivePersona && (
        <button
          onClick={() => onPersonaToggle?.(activePersonaName!)}
          className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 rounded-full px-2.5 py-1.5 text-[11px] font-medium cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-500/15 transition-colors"
          title={`Persona: ${activePersonaName} (click to remove)`}
        >
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold shrink-0 uppercase">
            {activePersonaName!.charAt(0)}
          </span>
          <span className="max-w-20 truncate">{activePersonaName}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-indigo-400">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Model selector button — always shows the selected model */}
      {compact ? (
        <button
          ref={triggerRef}
          onClick={handleOpen}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
          title={selected.label}
        >
          <img
            src={getModelIcon(selected.value)}
            alt=""
            className="w-4 h-4 object-contain"
          />
        </button>
      ) : (
        <button
          ref={triggerRef}
          onClick={handleOpen}
          className="flex items-center gap-2 backdrop-blur-md text-xs border rounded-full px-4 py-2 outline-none cursor-pointer transition-colors bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/8 hover:border-zinc-300 dark:hover:border-white/20"
        >
          <img
            src={getModelIcon(selected.value)}
            alt=""
            className="w-4 h-4 object-contain shrink-0"
          />
          <span className="max-w-30 truncate">{selected.label}</span>
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
      )}

      {dropdown}
    </div>
  );
}
