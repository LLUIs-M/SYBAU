import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ModelInfo } from "../types";
import { getModelIcon } from "../utils/modelIcons";

interface Props {
  value: string;
  models: ModelInfo[];
  onChange: (model: string) => void;
  onOpenPullModal?: () => void;
  compact?: boolean;
}

export default function ModelSelector({
  value,
  models,
  onChange,
  onOpenPullModal,
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
      width: 208,
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

  const dropdown = open
    ? createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="max-h-64 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 py-1"
        >
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
    <div ref={ref} className="relative">
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
          className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 backdrop-blur-md text-zinc-700 dark:text-zinc-300 text-xs border border-zinc-200 dark:border-white/10 rounded-full px-4 py-2 outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/8 hover:border-zinc-300 dark:hover:border-white/20 transition-colors"
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
