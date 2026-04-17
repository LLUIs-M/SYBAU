export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  files?: string[]
  model?: string
  isError?: boolean
  thinking?: string | null
  thinkingDone?: boolean
  images?: string[] // base64 encoded for rendering locally
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  model: string
  createdAt: Date
  preview?: string
}

export interface ModelInfo {
  value: string;
  label: string;
}

export interface TuningOptions {
  temperature: number;
  num_ctx: number;
  seed?: number;
}

export const FALLBACK_MODELS: ModelInfo[] = [
  { value: 'deepseek-r1:8b', label: 'DeepSeek-R1 (8B)' },
  { value: 'gemma4:e4b', label: 'Gemma 4 (e4b)' },
  { value: 'qwen2.5-coder:7b', label: 'Qwen Coder (7b)' },
  { value: 'llava:latest', label: 'LLaVA (Vision)' },
];
