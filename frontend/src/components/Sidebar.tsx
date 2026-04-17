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
}

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Older"];

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
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
    <aside className="w-60 h-full bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/6 flex flex-col shrink-0">
      {/* Header */}
      <div className="px-3 pt-4 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white select-none shrink-0">
            S
          </div>
          <span className="text-sm font-medium text-zinc-900 dark:text-white tracking-wide truncate">
            SYBAU
          </span>
          <span className="text-[9px] text-zinc-500 dark:text-zinc-500 uppercase tracking-widest font-medium leading-none shrink-0">
            offline
          </span>
        </div>
        <button
          onClick={onNew}
          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-white/8 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white transition-colors shrink-0"
          title="New conversation"
        >
          <svg
            width="12"
            height="12"
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
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 rounded-lg px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-zinc-300 dark:focus-within:ring-white/15 transition-all">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-400 dark:text-zinc-600 shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none w-full"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 && (
          <div className="text-center py-10 px-4">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 leading-relaxed">
              No conversations yet.
            </p>
          </div>
        )}

        {filtered.length === 0 && conversations.length > 0 && (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-600 text-center py-6">
            No results.
          </p>
        )}

        {GROUP_ORDER.filter((g) => groups[g]?.length).map((group) => (
          <div key={group} className="mb-1">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-medium px-2 pt-4 pb-1">
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
      <div className="px-3 py-2.5 border-t border-zinc-200 dark:border-white/6 flex items-center justify-between">
        <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
          Powered by Ollama
        </p>
      </div>
    </aside>
  );
}
