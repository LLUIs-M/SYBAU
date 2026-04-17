import { useRef, useEffect } from "react";
import type { Conversation } from "../types";
import MessageItem from "./Message";
import Spline from "@splinetool/react-spline";
import { getModelIcon } from "../utils/modelIcons";

interface Props {
  conversation: Conversation | null;
  isStreaming: boolean;
  showThinking: boolean;
}

export default function ChatPane({ conversation, isStreaming, showThinking }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  function onLoad(splineApp) {
    console.log("Spline cargado:", splineApp);
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 120;
    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);

  // Empty state
  if (!conversation || conversation.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 select-none">
        {/* Robot 3D */}
        <div className="h-72 w-72 pointer-events-none">
          <Spline
            scene="https://prod.spline.design/hqK1EFPvjhbK8-sS/scene.splinecode"
            onLoad={onLoad}
          />
        </div>
        <div className="-ml-8">
          <h2 className="text-5xl font-light bg-linear-to-b from-slate-900 to-slate-600 dark:text-white mb-1 bg-clip-text text-transparent">
            SYBAU
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
            Local AI, private by design.
            <br />
            {conversation
              ? "What's on your mind?"
              : "Start a new conversation."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto relative">
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
        {conversation.messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} showThinking={showThinking} />
        ))}

        {/* Streaming indicator — only show if last message is empty assistant */}
        {isStreaming &&
          conversation.messages.at(-1)?.role === "assistant" &&
          !conversation.messages.at(-1)?.content &&
          !conversation.messages.at(-1)?.thinking && (
            <div className="flex gap-3">
              {getModelIcon(conversation.model) ? (
                <img
                  src={getModelIcon(conversation.model)!}
                  alt=""
                  className="w-7 h-7 object-contain shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  S
                </div>
              )}
              <div className="flex items-center gap-1 pt-2">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
