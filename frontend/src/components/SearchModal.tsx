import { useState, useRef, useEffect, useMemo, ReactNode } from "react";
import type { Conversation } from "../types";

interface Props {
  conversations: Conversation[];
  onClose: () => void;
  onSelect: (conversationId: string, messageId?: string) => void;
}

interface MessageMatch {
  conversationId: string;
  conversationTitle: string;
  messageId: string;
  role: "user" | "assistant";
  snippet: string;
}

function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-blue-400/30 dark:bg-blue-400/25 text-inherit rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function getSnippet(content: string, query: string, radius = 60): string {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, 120);
  const start = Math.max(0, idx - radius);
  const end = Math.min(content.length, idx + query.length + radius);
  let snippet = content.slice(start, end).replace(/\n/g, " ");
  if (start > 0) snippet = "…" + snippet;
  if (end < content.length) snippet += "…";
  return snippet;
}

export default function SearchModal({ conversations, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const trimmed = query.trim();

  // Title matches
  const titleMatches = useMemo(() => {
    if (!trimmed) return [];
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(trimmed.toLowerCase())
    );
  }, [conversations, trimmed]);

  // In-message matches
  const messageMatches = useMemo(() => {
    if (!trimmed) return [];
    const results: MessageMatch[] = [];
    const q = trimmed.toLowerCase();
    for (const conv of conversations) {
      for (const msg of conv.messages) {
        if (msg.content.toLowerCase().includes(q)) {
          results.push({
            conversationId: conv.id,
            conversationTitle: conv.title,
            messageId: msg.id,
            role: msg.role,
            snippet: getSnippet(msg.content, trimmed),
          });
        }
      }
      // Limit per-conversation to keep results manageable
      if (results.length > 50) break;
    }
    return results;
  }, [conversations, trimmed]);

  const hasResults = titleMatches.length > 0 || messageMatches.length > 0;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md" />

      {/* Modal card */}
      <div
        className="relative w-full max-w-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/60 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          maxHeight: "70vh",
          animation: "searchModalIn 0.2s ease-out",
        }}
      >
        {/* Search input area */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-200/60 dark:border-white/8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="w-5 h-5 shrink-0 text-zinc-400 dark:text-zinc-500"
            fill="currentColor"
          >
            <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats and messages…"
            className="flex-1 bg-transparent text-[15px] text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-white/8 px-2 py-1 rounded-md hover:bg-zinc-200 dark:hover:bg-white/12 transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          {!trimmed && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="w-10 h-10 text-zinc-300 dark:text-zinc-700"
                fill="currentColor"
              >
                <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
              </svg>
              <p className="text-[13px] text-zinc-400 dark:text-zinc-600">
                Type to search across chats and messages
              </p>
            </div>
          )}

          {trimmed && !hasResults && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-[13px] text-zinc-400 dark:text-zinc-600">
                No results for "<span className="text-zinc-600 dark:text-zinc-300">{trimmed}</span>"
              </p>
            </div>
          )}

          {/* Title matches */}
          {titleMatches.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600 px-3 py-2">
                Chat Titles
              </p>
              {titleMatches.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelect(conv.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/6 transition-colors group cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    className="w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-600 group-hover:text-blue-500 transition-colors"
                    fill="currentColor"
                  >
                    <path d="M160 368C160 341.5 181.5 320 208 320L432 320C458.5 320 480 341.5 480 368C480 394.5 458.5 416 432 416L208 416C181.5 416 160 394.5 160 368zM128 64C57.3 64 0 121.3 0 192L0 448C0 518.7 57.3 576 128 576L512 576C582.7 576 640 518.7 640 448L640 192C640 121.3 582.7 64 512 64L128 64zM64 192C64 156.7 92.7 128 128 128L512 128C547.3 128 576 156.7 576 192L576 448C576 483.3 547.3 512 512 512L128 512C92.7 512 64 483.3 64 448L64 192zM208 224C181.5 224 160 245.5 160 272C160 298.5 181.5 320 208 320L336 320C362.5 320 384 298.5 384 272C384 245.5 362.5 224 336 224L208 224z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {highlightMatch(conv.title, trimmed)}
                    </p>
                    {conv.preview && (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-600 truncate mt-0.5">
                        {conv.preview}
                      </p>
                    )}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* Message matches */}
          {messageMatches.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-600 px-3 py-2">
                In Messages
              </p>
              {messageMatches.map((match, i) => (
                <button
                  key={`${match.conversationId}-${match.messageId}-${i}`}
                  onClick={() => {
                    onSelect(match.conversationId, match.messageId);
                    onClose();
                  }}
                  className="flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/6 transition-colors group cursor-pointer"
                >
                  <div className="mt-0.5 shrink-0">
                    {match.role === "user" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-blue-500 transition-colors">
                        <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 8a6 6 0 1112 0A6 6 0 016 8zm2 10a3 3 0 00-3 3 1 1 0 11-2 0 5 5 0 015-5h8a5 5 0 015 5 1 1 0 11-2 0 3 3 0 00-3-3H8z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors">
                        <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.07A7.001 7.001 0 0113 22h-2a7.001 7.001 0 01-6.93-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zm-1 9a5 5 0 00-5 5 5 5 0 005 5h2a5 5 0 005-5 5 5 0 00-5-5h-2zm-1 3a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                      {match.conversationTitle}
                      <span className="text-zinc-400 dark:text-zinc-600 font-normal ml-1.5">
                        · {match.role}
                      </span>
                    </p>
                    <p className="text-[12px] text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {highlightMatch(match.snippet, trimmed)}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-4 h-4 mt-1 shrink-0 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes searchModalIn {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
