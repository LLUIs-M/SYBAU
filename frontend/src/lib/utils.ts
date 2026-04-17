import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nanoid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export interface ParsedContent {
  thinking: string | null;
  thinkingDone: boolean;
  content: string;
}

export function parseContent(raw: string): ParsedContent {
  const openIdx = raw.indexOf("<think>");
  if (openIdx === -1) {
    return { thinking: null, thinkingDone: false, content: raw };
  }

  const closeIdx = raw.indexOf("</think>");
  if (closeIdx !== -1) {
    const before = raw.slice(0, openIdx);
    const after = raw.slice(closeIdx + 8);
    return {
      thinking: raw.slice(openIdx + 7, closeIdx),
      thinkingDone: true,
      content: (before + after).trim(),
    };
  }

  // Still streaming the think block
  return {
    thinking: raw.slice(openIdx + 7),
    thinkingDone: false,
    content: raw.slice(0, openIdx).trim(),
  };
}

export function groupByDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This Week";
  return "Older";
}
