export const MODEL_ICONS: Record<string, string> = {
  'deepseek-r1:8b':    '/icons-llm/deepseek-color.svg',
  'gemma4:e4b':        '/icons-llm/gemma-color.svg',
  'qwen2.5-coder:7b':  '/icons-llm/qwen-color.svg',
  'llava:latest':      '/icons-llm/meta-color.svg',
}

export function getModelIcon(model: string | undefined): string | null {
  if (!model) return null
  return MODEL_ICONS[model] ?? null
}
