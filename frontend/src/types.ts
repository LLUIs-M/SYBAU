export interface Message {
  role: 'user' | 'assistant'
  content: string
  files?: string[]
  model?: string
  isError?: boolean
}
