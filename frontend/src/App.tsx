import { useState, useRef, useEffect, useCallback } from 'react'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import type { Message } from './types'

const MODELS = [
  { value: 'deepseek-r1:8b', label: 'DeepSeek-R1 (8B)' },
  { value: 'gemma4:e4b', label: 'Gemma 4 (e4b)' },
  { value: 'qwen2.5-coder:7b', label: 'Qwen Coder (7b)' },
  { value: 'llava:latest', label: 'LLaVA (Vision)' },
]

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState('deepseek-r1:8b')
  const abortControllerRef = useRef<AbortController | null>(null)
  const chatBoxRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    const el = chatBoxRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 50
    if (isNearBottom) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async (text: string, files: File[]) => {
    if (isGenerating) return
    setIsGenerating(true)
    abortControllerRef.current = new AbortController()

    const userMessage: Message = {
      role: 'user',
      content: text,
      files: files.map((f) => f.name),
    }
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      model: selectedModel,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])

    try {
      const formData = new FormData()
      formData.append('model', selectedModel)
      formData.append('text', text)
      for (const file of files) formData.append('file', file)

      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) throw new Error('Backend connection failed')

      const reader = response.body!.getReader()
      const decoder = new TextDecoder('utf-8')
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: accumulated,
          }
          return updated
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: 'Backend connection failed. Check the terminal.',
            isError: true,
          }
          return updated
        })
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    abortControllerRef.current?.abort()
    window.speechSynthesis?.cancel()
  }

  // Drag and drop on the whole container
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    // Files from drag are not added to ChatInput state directly — user needs to attach via button.
    // This is a UX limitation without a shared state; for simplicity we ignore drag here.
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f] text-[#e0e0e0]">
      <div
        className="w-[80%] h-[85vh] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col p-5 shadow-2xl"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
          <h3 className="m-0 font-light tracking-widest">
            VibeAI{' '}
            <span className="text-[0.5em] text-gray-500 uppercase">Offline</span>
          </h3>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-black/30 text-white border border-white/20 rounded-xl px-4 py-2 outline-none cursor-pointer font-sans"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Chat box */}
        <div
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1"
        >
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
        </div>

        {/* Input */}
        <div className="mt-4">
          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  )
}
