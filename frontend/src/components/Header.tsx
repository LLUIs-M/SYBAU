import type { Conversation } from "../types";
import ModelSelector from "./ModelSelector";

interface Props {
  conversation: Conversation | null;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onNewChat: () => void;
}

export default function Header({
  conversation,
  selectedModel,
  onModelChange,
  onNewChat,
}: Props) {
  return (
    <header className="absolute top-5 right-5 z-50">
      {/* Right: model selector + new chat */}
      <div className="flex items-center gap-2 shrink-0 relative">
        <ModelSelector value={selectedModel} onChange={onModelChange} />

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
      </div>
    </header>
  );
}
