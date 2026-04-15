import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../types'

interface ParsedContent {
  thinking: string | null
  thinkingDone: boolean
  content: string
}

function parseContent(raw: string): ParsedContent {
  const openIdx = raw.indexOf('<think>')
  if (openIdx === -1) {
    return { thinking: null, thinkingDone: false, content: raw }
  }

  const closeIdx = raw.indexOf('</think>')
  if (closeIdx !== -1) {
    return {
      thinking: raw.slice(openIdx + 7, closeIdx),
      thinkingDone: true,
      content: raw.slice(closeIdx + 8).trim(),
    }
  }

  // Still streaming thinking
  return {
    thinking: raw.slice(openIdx + 7),
    thinkingDone: false,
    content: raw.slice(0, openIdx).trim(),
  }
}

interface Props {
  message: Message
}

export default function ChatMessage({ message }: Props) {
  const [thinkOpen, setThinkOpen] = useState(true)
  const [ttsPlaying, setTtsPlaying] = useState(false)

  if (message.role === 'user') {
    return (
      <div className="rounded-xl p-4 bg-white/5 border border-white/10 leading-relaxed">
        <span className="font-bold text-white/80">You:</span>
        <span className="whitespace-pre-wrap ml-2">{message.content}</span>
        {message.files && message.files.length > 0 && (
          <div className="text-sm text-green-400 mt-1 italic">
            📎 {message.files.join(', ')}
          </div>
        )}
      </div>
    )
  }

  const { thinking, thinkingDone, content } = parseContent(message.content)

  const handleTts = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setTtsPlaying(false)
      return
    }
    const spokenText = content.trim()
    if (!spokenText) return
    const utterance = new SpeechSynthesisUtterance(spokenText)
    utterance.onend = () => setTtsPlaying(false)
    setTtsPlaying(true)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="rounded-xl p-4 bg-white/3 border border-white/10 leading-relaxed">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-green-400">
          {message.model ? message.model.split(':')[0] : 'AI'}:
        </span>
        <button
          onClick={handleTts}
          className="text-xs px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
          title="Read aloud"
        >
          {ttsPlaying ? '⏹️' : '🔊'}
        </button>
      </div>

      {thinking !== null && (
        <details
          open={thinkOpen}
          onToggle={(e) => setThinkOpen((e.target as HTMLDetailsElement).open)}
          className="mb-3 rounded-lg bg-black/40 border-l-4 border-gray-500 text-gray-400 text-sm italic"
        >
          <summary className="cursor-pointer select-none p-3 font-semibold not-italic">
            💭 Internal Logic {!thinkingDone && <span className="animate-pulse">...</span>}
          </summary>
          <div className="px-3 pb-3 whitespace-pre-wrap">{thinking}</div>
        </details>
      )}

      {message.isError ? (
        <span className="text-red-400">{content || message.content}</span>
      ) : content ? (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      ) : !thinking ? (
        <span className="text-gray-500 italic animate-pulse">Connecting to engine...</span>
      ) : null}
    </div>
  )
}
