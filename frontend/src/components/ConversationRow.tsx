import { useState, useRef } from 'react'
import type { Conversation } from '../types'

interface Props {
  conversation: Conversation
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (title: string) => void
}

export default function ConversationRow({ conversation, isActive, onSelect, onDelete, onRename }: Props) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conversation.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleRenameSubmit = () => {
    if (editTitle.trim()) onRename(editTitle.trim())
    setEditing(false)
  }

  return (
    <div
      className={`group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-zinc-200 dark:bg-white/8 text-zinc-900 dark:text-white'
          : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-800 dark:hover:text-zinc-300'
      }`}
      onClick={onSelect}
    >
      {editing ? (
        <input
          ref={inputRef}
          autoFocus
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameSubmit()
            if (e.key === 'Escape') setEditing(false)
          }}
          className="flex-1 bg-transparent text-xs outline-none text-zinc-900 dark:text-white"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate">{conversation.title}</p>
        </div>
      )}

      {/* Hover actions */}
      {!editing && (
        <div
          className="hidden group-hover:flex items-center gap-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setEditing(true)
              setEditTitle(conversation.title)
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-white/10 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            title="Rename"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
