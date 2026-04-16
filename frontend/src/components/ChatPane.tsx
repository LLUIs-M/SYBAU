import { useRef, useEffect } from 'react'
import type { Conversation } from '../types'
import MessageItem from './Message'

interface Props {
  conversation: Conversation | null
  isStreaming: boolean
}

export default function ChatPane({ conversation, isStreaming }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 120
    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation?.messages])

  // Empty state
  if (!conversation || conversation.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-8 select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white">
            S
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">SYBAU</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 leading-relaxed max-w-xs">
            Local AI, private by design.
            <br />
            {conversation ? "What's on your mind?" : 'Start a new conversation.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          {['Explain a concept', 'Write some code', 'Debug an error', 'Draft a message'].map((s) => (
            <span
              key={s}
              className="text-xs text-zinc-600 dark:text-zinc-600 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/[0.07] px-3 py-1.5 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
        {conversation.messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}

        {/* Streaming indicator — only show if last message is empty assistant */}
        {isStreaming &&
          conversation.messages.at(-1)?.role === 'assistant' &&
          !conversation.messages.at(-1)?.content &&
          !conversation.messages.at(-1)?.thinking && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                S
              </div>
              <div className="flex items-center gap-1 pt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
