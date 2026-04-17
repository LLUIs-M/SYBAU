import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../types'
import { getModelIcon } from '../utils/modelIcons'

interface Props {
  message: Message
  showThinking?: boolean
}

export default function MessageItem({ message, showThinking = true }: Props) {
  const [thinkOpen, setThinkOpen] = useState(true)
  const [ttsPlaying, setTtsPlaying] = useState(false)

  const handleTts = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setTtsPlaying(false)
      return
    }
    const text = message.content.trim()
    if (!text) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setTtsPlaying(false)
    setTtsPlaying(true)
    window.speechSynthesis.speak(utterance)
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <div className="bg-zinc-100 dark:bg-white/8 border border-zinc-200 dark:border-white/10 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.files && message.files.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/10">
                {message.files.map((f) => (
                  <span
                    key={f}
                    className="text-[11px] bg-white dark:bg-white/8 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-white/10"
                  >
                    📎 {f}
                  </span>
                ))}
              </div>
            )}
            {message.images && message.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-white/10">
                {message.images.map((imgBase64, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm">
                    <img 
                      src={imgBase64} 
                      alt="attachment" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Assistant message
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      {getModelIcon(message.model) ? (
        <img
          src={getModelIcon(message.model)!}
          alt=""
          className="w-7 h-7 object-contain shrink-0 mt-0.5"
        />
      ) : (
        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
          S
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Header row: model name + TTS */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-zinc-500">
            {message.model ? message.model.split(':')[0] : 'SYBAU'}
          </span>
          <button
            onClick={handleTts}
            className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-white/8 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            title="Read aloud"
          >
            {ttsPlaying ? (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="4" height="12" rx="1" />
                  <rect x="14" y="6" width="4" height="12" rx="1" />
                </svg>
                Stop
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                Read
              </>
            )}
          </button>
        </div>

        {/* Thinking block */}
        {showThinking && message.thinking != null && (
          <details
            open={thinkOpen}
            onToggle={(e) => setThinkOpen((e.target as HTMLDetailsElement).open)}
            className="mb-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/8 overflow-hidden"
          >
            <summary className="cursor-pointer select-none px-3 py-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-2 list-none">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Internal Logic
              {!message.thinkingDone && (
                <span className="inline-flex gap-0.5 ml-1">
                  <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </summary>
            <div className="px-3 pb-3 pt-2 border-t border-zinc-200 dark:border-white/5">
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">
                {message.thinking}
              </p>
            </div>
          </details>
        )}

        {/* Main content */}
        {message.isError ? (
          <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed">{message.content || 'An error occurred.'}</p>
        ) : message.content ? (
          <div className="markdown-body text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        ) : !message.thinking ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-500 italic animate-pulse">Connecting to engine…</p>
        ) : null}
      </div>
    </div>
  )
}
