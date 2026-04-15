import { useRef, useState, useEffect } from 'react'

interface Props {
  onSend: (text: string, files: File[]) => void
  onStop: () => void
  isGenerating: boolean
}

export default function ChatInput({ onSend, onStop, isGenerating }: Props) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
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
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isGenerating && (text.trim() || files.length > 0)) {
      onSend(text, files)
      setText('')
      setFiles([])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
      e.target.value = ''
    }
  }

  const toggleMic = () => {
    const rec = recognitionRef.current
    if (!rec) return
    isRecording ? rec.stop() : rec.start()
  }

  return (
    <div className="flex flex-col gap-2">
      {files.length > 0 && (
        <div className="text-sm text-green-400 border border-green-500/40 rounded-lg px-3 py-2 bg-green-500/10">
          📎 {files.map((f) => f.name).join(', ')}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-colors text-lg"
          title="Attach file"
        >
          📎
        </button>
        {recognitionRef.current && (
          <button
            onClick={toggleMic}
            className={`px-3 rounded-xl border border-white/10 transition-colors text-lg ${
              isRecording
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            title="Voice input"
          >
            🎤
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          placeholder="Initiate sequence..."
          className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:bg-white/15 focus:border-white/30 disabled:opacity-50 transition-colors"
        />
        {isGenerating && (
          <button
            onClick={onStop}
            className="px-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 font-bold transition-colors"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  )
}
