import { useState } from "react";
import type { ModelInfo } from "../types";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  models: ModelInfo[];
  selectedModel: string;
}

export default function CreateModelModal({ onClose, onSuccess, models, selectedModel }: Props) {
  const [name, setName] = useState("");
  const [baseModel, setBaseModel] = useState(selectedModel);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Persona name is required.");
      return;
    }
    setError(null);
    setCreating(true);
    setProgress("Saving persona...");

    try {
      const res = await fetch("http://127.0.0.1:5000/custom_models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
          name: name.trim(),
          base_model: baseModel,
          system_prompt: systemPrompt,
          created_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save persona.");
      }

      setCreating(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-sans tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Create Persona
          </h2>
          <button
            onClick={onClose}
            disabled={creating}
            className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Assistant Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. yoda-bot"
              disabled={creating}
              className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Base Model</label>
            <select
              value={baseModel}
              onChange={(e) => setBaseModel(e.target.value)}
              disabled={creating}
              className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              {models.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block flex justify-between">
              <span>System Prompt</span>
              <span className="text-xs text-zinc-500 font-normal">Personality/Rules</span>
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are Yoda, a wise Jedi Master..."
              disabled={creating}
              rows={4}
              className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          {creating && progress && (
            <div className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 p-3 rounded-lg text-sm font-mono flex items-center gap-2 border border-indigo-200 dark:border-indigo-500/20">
              <span className="animate-spin text-lg">⚙️</span> {progress}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={creating}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all text-white
              ${creating ? 'bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md hover:shadow-lg'}
            `}
          >
            {creating ? 'Creating...' : 'Create Persona'}
          </button>
        </div>
      </div>
    </div>
  );
}
