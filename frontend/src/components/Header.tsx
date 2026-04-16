import type { Conversation } from '../types'
import { MODELS } from '../types'

interface Props {
  conversation: Conversation | null
  selectedModel: string
  onModelChange: (model: string) => void
  onNewChat: () => void
}

export default function Header({ conversation, selectedModel, onModelChange, onNewChat }: Props) {
  return (
    <header className="h-14 px-5 flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.07] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shrink-0">
      {/* Left: title or brand */}
      <div className="flex items-center gap-3 min-w-0">
        {conversation ? (
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
            {conversation.title}
          </span>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
              S
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-white tracking-wide">SYBAU</span>
            <span className="text-[9px] text-zinc-500 dark:text-zinc-600 uppercase tracking-widest font-medium bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded-full border border-zinc-200 dark:border-white/[0.06]">
              Offline
            </span>
          </div>
        )}
      </div>

      {/* Right: model selector + new chat */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="appearance-none bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 text-xs border border-zinc-200 dark:border-white/10 rounded-lg pl-3 pr-7 py-1.5 outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/8 hover: border-zinc-300 dark:hover:border-white/20 transition-colors"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200">
                {m.label}
              </option>
            ))}
          </select>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 px-3 py-1.5 rounded-lg transition-colors"
          title="New conversation"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New
        </button>
      </div>
    </header>
  )
}
