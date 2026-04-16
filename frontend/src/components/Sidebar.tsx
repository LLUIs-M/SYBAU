import { useState } from "react";
import type { Conversation } from "../types";
import { groupByDate } from "../lib/utils";
import ConversationRow from "./ConversationRow";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  theme: string;
  toggleTheme: () => void;
}

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Older"];

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  theme,
  toggleTheme,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const groups: Record<string, Conversation[]> = {};
  for (const conv of filtered) {
    const label = groupByDate(conv.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  return (
    <aside className="w-64 h-full bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/[0.07] flex flex-col shrink-0">
      {/* Logo + New chat */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white select-none">
            S
          </div>
          <span className="font-semibold text-zinc-900 dark:text-white text-sm tracking-wide">
            SYBAU
          </span>
          <span className="text-[9px] text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-medium leading-none bg-zinc-200 dark:bg-white/8 px-1.5 py-0.5 rounded-full border border-zinc-300 dark:border-white/10">
            Offline
          </span>
        </div>
        <button
          onClick={onNew}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-white/8 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          title="New conversation"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 bg-white dark:bg-white/5 rounded-lg px-3 py-2 border border-zinc-200 dark:border-white/[0.07] focus-within:border-zinc-300 dark:focus-within:border-white/20 transition-colors">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-500 dark:text-zinc-400 shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              No conversations yet.
              <br />
              Start a new chat above.
            </p>
          </div>
        )}

        {filtered.length === 0 && conversations.length > 0 && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center py-6">
            No results found.
          </p>
        )}

        {GROUP_ORDER.filter((g) => groups[g]?.length).map((group) => (
          <div key={group} className="mb-1">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-medium px-2 pt-4 pb-1.5">
              {group}
            </p>
            {groups[group].map((conv) => (
              <ConversationRow
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeId}
                onSelect={() => onSelect(conv.id)}
                onDelete={() => onDelete(conv.id)}
                onRename={(title) => onRename(conv.id, title)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-white/[0.06] flex flex-col items-center justify-center gap-6">
        <button
          onClick={toggleTheme}
          type="button"
          role="switch"
          aria-checked={theme === "dark"}
          className={`
        relative inline-flex h-8 w-16 items-center rounded-full
        transition-colors duration-300 ease-in-out focus:outline-none
        focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-gray-900
        ${theme === "dark" ? "bg-white" : "bg-black"}
      `}
        >
          <span className="sr-only">Alternar modo oscuro</span>

          <span
            className={`
          inline-flex h-6 w-6 transform items-center justify-center rounded-full shadow-sm 
          transition duration-300 ease-in-out
          ${theme === "dark" ? "translate-x-9 bg-black" : "translate-x-1 bg-white"}
        `}
          >
            {theme === "dark" ? (
              <svg
                className="h-3.5 w-3.5 text-gray-100"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 text-amber-500"
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
          </span>
        </button>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 text-center">
          Local LLMs · Powered by Ollama
        </p>
      </div>
    </aside>
  );
}
