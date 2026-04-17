import React, { useState, useRef } from "react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PullModelModal({ onClose, onSuccess }: Props) {
  const [modelName, setModelName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "pulling" | "success" | "error" | "cancelled"
  >("idle");
  const [progress, setProgress] = useState<{
    total: number;
    completed: number;
    text: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const handlePull = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!modelName.trim()) return;

    setStatus("pulling");
    setProgress({ total: 0, completed: 0, text: "Iniciando..." });
    setErrorMsg("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("http://127.0.0.1:5000/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName.trim() }),
        signal: controller.signal,
      });

      if (!res.body) throw new Error("No stream content");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkString = decoder.decode(value, { stream: !done });
          const lines = chunkString
            .split("\n")
            .filter((l) => l.trim().length > 0);
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.error) {
                setStatus("error");
                setErrorMsg(data.error);
                return;
              }
              if (data.status) {
                setProgress({
                  total: data.total || 0,
                  completed: data.completed || 0,
                  text: data.status,
                });
              }
            } catch (err) {
              console.error("Error parsing JSON chunk:", err, line);
            }
          }
        }
      }

      setStatus("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setStatus("cancelled");
      } else {
        console.error(err);
        setStatus("error");
        setErrorMsg(err.message || "Failed to pull model");
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancelClick = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    } else if (status === "pulling") {
      setStatus("cancelled");
    }
  };

  const handleClose = () => {
    if (status === "pulling") {
      handleCancelClick();
    }
    onClose();
  };

  const pct =
    progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-indigo-500"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Pull Model
          </h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {status === "idle" || status === "error" || status === "cancelled" ? (
          <form onSubmit={handlePull}>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
              Descarga cualquier modelo desde la librería de Ollama (ej.{" "}
              <code className="text-indigo-600 dark:text-indigo-400 font-mono text-xs bg-indigo-50 dark:bg-indigo-500/10 px-1 py-0.5 rounded">
                llama3
              </code>
              ,{" "}
              <code className="text-indigo-600 dark:text-indigo-400 font-mono text-xs bg-indigo-50 dark:bg-indigo-500/10 px-1 py-0.5 rounded">
                phi3
              </code>
              ).
            </p>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej: deepseek-coder:7b"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500/50 mb-4 transition-all"
            />
            {status === "error" && (
              <div className="mb-4 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-3 py-2 rounded-lg break-words">
                {errorMsg}
              </div>
            )}
            {status === "cancelled" && (
              <div className="mb-4 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-3 py-2 rounded-lg break-words">
                Descarga cancelada por el usuario.
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-600/20"
            >
              {status === "cancelled" || status === "error"
                ? "Reintentar Descarga"
                : "Iniciar Descarga"}
            </button>
          </form>
        ) : status === "pulling" ? (
          <div className="py-2">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              <span className="truncate pr-2">
                {progress?.text || "Conectando..."}
              </span>
              <span className="shrink-0">
                {progress?.total ? `${pct}%` : ""}
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-100 dark:bg-white/10 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                style={{ width: progress?.total ? `${pct}%` : "5%" }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleCancelClick}
                className="w-full border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 font-medium text-sm py-2 rounded-xl transition-colors"
              >
                Cancelar Descarga
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-medium text-zinc-900 dark:text-white">
              ¡Descarga completa!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
