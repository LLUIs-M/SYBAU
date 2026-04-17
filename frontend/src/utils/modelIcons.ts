export const MODEL_ICONS: Record<string, string> = {
  'deepseek-r1:8b':    '/icons-llm/deepseek-color.svg',
  'gemma4:e4b':        '/icons-llm/gemma-color.svg',
  'qwen2.5-coder:7b':  '/icons-llm/qwen-color.svg',
  'llava:latest':      '/icons-llm/meta-color.svg',
}

export const DEFAULT_ICON = '/icons-llm/ollama.svg';

export function getModelIcon(model: string | undefined): string {
  if (!model) return DEFAULT_ICON;
  // Deepseek fallback handling if name contains deepseek
  if (model.includes('deepseek') && !MODEL_ICONS[model]) {
    return '/icons-llm/deepseek-color.svg';
  }
  if (model.includes('llama') && !MODEL_ICONS[model]) {
    return '/icons-llm/meta-color.svg';
  }
  if (model.includes('qwen') && !MODEL_ICONS[model]) {
    return '/icons-llm/qwen-color.svg';
  }
  if (model.includes('gemma') && !MODEL_ICONS[model]) {
    return '/icons-llm/gemma-color.svg';
  }
  return MODEL_ICONS[model] ?? DEFAULT_ICON;
}
