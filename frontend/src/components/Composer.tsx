import { useRef, useState, useEffect } from 'react'

interface Props {
  onSend: (text: string, files: File[]) => void
  onStop: () => void
  isGenerating: boolean
  disabled?: boolean
}

export default function Composer({ onSend, onStop, isGenerating, disabled = false }: Props) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [hasMic, setHasMic] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      const rec = new SR()
      rec.continuous = false
      rec.interimResults = false
      rec.onstart = () => setIsRecording(true)
      rec.onend = () => setIsRecording(false)
      rec.onerror = () => setIsRecording(false)
      rec.onresult = (e: SpeechRecognitionEvent) => {
        const transcript = e.results[0][0].transcript
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
      }
      recognitionRef.current = rec
      setHasMic(true)
    }
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`
  }, [text])

  const canSend = (text.trim().length > 0 || files.length > 0) && !disabled

  const handleSend = () => {
    if (isGenerating) {
      onStop()
      return
    }
    if (!canSend) return
    onSend(text, files)
    setText('')
    setFiles([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
      e.preventDefault()
      handleSend()
    }
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const toggleMic = () => {
    const rec = recognitionRef.current
    if (!rec) return
    isRecording ? rec.stop() : rec.start()
  }

  return (
    <div className="px-4 pb-5 pt-2">
      <div className="max-w-3xl mx-auto">
        {/* File previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400 dark:text-zinc-500">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
                <span className="max-w-[140px] truncate">{f.name}</span>
                <button
                  onClick={() => removeFile(i)}
                  className="text-zinc-500 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors ml-0.5 leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main input container */}
        <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl focus-within:border-zinc-300 dark:focus-within:border-white/20 shadow-sm dark:shadow-none transition-all">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating || disabled}
            placeholder="Message SYBAU…  (Shift + Enter for newline)"
            rows={1}
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 px-4 pt-3.5 pb-2 outline-none resize-none leading-relaxed disabled:opacity-40"
          />

          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            {/* Left actions */}
            <div className="flex items-center gap-0.5">
              {/* Attach file */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/8 transition-colors"
                title="Attach file"
                disabled={disabled}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              {/* Microphone */}
              {hasMic && (
                <button
                  onClick={toggleMic}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                    isRecording
                      ? 'text-red-400 bg-red-500/10 border border-red-500/20 animate-pulse'
                      : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/8'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Voice input'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
                    e.target.value = ''
                  }
                }}
              />
            </div>

            {/* Send / Stop button */}
            <button
              onClick={handleSend}
              disabled={!isGenerating && !canSend}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isGenerating
                  ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/25'
                  : canSend
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm shadow-violet-500/20'
                  : 'bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-zinc-700 cursor-not-allowed'
              }`}
              title={isGenerating ? 'Stop generation' : 'Send message'}
            >
              {isGenerating ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="1.5" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-700 mt-2.5">
          SYBAU runs locally — your conversations never leave your device.
        </p>
      </div>
    </div>
  )
}
