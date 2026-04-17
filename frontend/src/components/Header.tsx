import React, { useState } from "react";
import type { Conversation, ModelInfo, TuningOptions } from "../types";
import ModelSelector from "./ModelSelector";
import TuningPanel from "./TuningPanel";

interface Props {
  conversation: Conversation | null;
  selectedModel: string;
  models: ModelInfo[];
  onModelChange: (model: string) => void;
  showThinking: boolean;
  onToggleThinking: () => void;
  onOpenPullModal: () => void;
  onOpenCreateModal: () => void;
  onNewChat: () => void;
  theme: string;
  toggleTheme: () => void;
  tuningOptions: TuningOptions;
  setTuningOptions: (opts: TuningOptions) => void;
}

export default function Header({
  conversation,
  selectedModel,
  models,
  onModelChange,
  showThinking,
  onToggleThinking,
  onOpenPullModal,
  onOpenCreateModal,
  onNewChat,
  theme,
  toggleTheme,
  tuningOptions,
  setTuningOptions
}: Props) {
  const [showTuning, setShowTuning] = useState(false);

  return (
    <header className="absolute top-5 right-5 z-50">
      {/* Right: model selector + thinking toggle + new chat */}
      <div className="flex items-center gap-2 shrink-0 relative">
        <ModelSelector 
          value={selectedModel} 
          models={models} 
          onChange={onModelChange} 
          onOpenPullModal={onOpenPullModal}
        />

        <div className="relative">
          <button
            onClick={() => setShowTuning(!showTuning)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showTuning ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5'} shadow-sm`}
            title="Inference Tuning"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
          
          {showTuning && <TuningPanel options={tuningOptions} onChange={setTuningOptions} />}
        </div>
        
        <button
          onClick={onOpenCreateModal}
          className="bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-sm"
          title="Create Model"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </button>

        <button
          onClick={onToggleThinking}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-2xl transition-colors cursor-pointer border ${
            showThinking 
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' 
              : 'text-zinc-500 dark:text-zinc-500 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
          title="Toggle Thinking Output"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
          Thinking
        </button>

        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 px-4 py-2 rounded-2xl transition-colors cursor-pointer"
          title="New conversation"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Chat
        </button>
        <button
          onClick={toggleTheme}
          className="flex items-center text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 p-2.5 rounded-full transition-colors cursor-pointer"
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? (
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
