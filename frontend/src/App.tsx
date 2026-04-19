import { useState, useRef, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatPane from "./components/ChatPane";
import Composer from "./components/Composer";
import PullModelModal from "./components/PullModelModal";
import CreateModelModal from "./components/CreateModelModal";
import HardwareMonitor from "./components/HardwareMonitor";
import type { Conversation, Message, TuningOptions } from "./types";
import { nanoid, parseContent } from "./lib/utils";
import { useLocalModels } from "./hooks/localModels";

function makeTitle(text: string): string {
  return text.trim().slice(0, 42) || "New Conversation";
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { models: availableModels, selectedModel, setSelectedModel, refetch: fetchModels } = useLocalModels();
  const [showThinking, setShowThinking] = useState<boolean>(true);
  const [showPullModal, setShowPullModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [tuningOptions, setTuningOptions] = useState<TuningOptions>({
    temperature: 0.7,
    num_ctx: 2048,
  });
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  const abortRef = useRef<AbortController | null>(null);

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;

  const createConversation = useCallback(() => {
    const id = nanoid();
    const conv: Conversation = {
      id,
      title: "New Conversation",
      messages: [],
      model: selectedModel,
      createdAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
  }, [selectedModel]);

  const handleSend = async (text: string, files: File[]) => {
    if (isStreaming) return;

    // Create conversation on-the-fly if none is active
    let convId = activeId;
    if (!convId) {
      convId = nanoid();
      const conv: Conversation = {
        id: convId,
        title: makeTitle(text),
        messages: [],
        model: selectedModel,
        createdAt: new Date(),
        preview: text.slice(0, 80),
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(convId);
    }

    // Convert images to base64 for local rendering
    const base64Images = await Promise.all(
      files
        .filter((f) => f.type.startsWith("image/"))
        .map((f) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(f);
          });
        }),
    );

    const userMsgId = nanoid();
    const assistantMsgId = nanoid();

    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: text,
      files: files.length > 0 ? files.map((f) => f.name) : undefined,
      images: base64Images.length > 0 ? base64Images : undefined,
    };
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      model: selectedModel,
      thinking: null,
      thinkingDone: false,
    };

    // Add both messages and update title if still default
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMsg, assistantMsg],
              title: c.title === "New Conversation" ? makeTitle(text) : c.title,
              preview: text.slice(0, 80),
            }
          : c,
      ),
    );

    setIsStreaming(true);
    abortRef.current = new AbortController();

    try {
      const fd = new FormData();
      fd.append("model", selectedModel);
      fd.append("text", text);
      fd.append("showThinking", showThinking.toString());
      fd.append("options_json", JSON.stringify(tuningOptions));
      for (const file of files) fd.append("file", file);

      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        body: fd,
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        const { thinking, thinkingDone, content } = parseContent(accumulated);

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c;
            const msgs = c.messages.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content, thinking, thinkingDone }
                : m,
            );
            return {
              ...c,
              messages: msgs,
              preview: content.slice(0, 80) || c.preview,
            };
          }),
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c;
            const msgs = c.messages.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content:
                      "Backend connection failed. Make sure the Flask server is running.",
                    isError: true,
                  }
                : m,
            );
            return { ...c, messages: msgs };
          }),
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    window.speechSynthesis?.cancel();
  };

  const handleDelete = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const handleRename = (id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    );
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className="h-screen flex bg-[#efefef] dark:bg-[#0d0d0d] text-zinc-900 dark:text-zinc-100 overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={createConversation}
        onDelete={handleDelete}
        onRename={handleRename}
        theme={theme}
        toggleTheme={toggleTheme}
        tuningOptions={tuningOptions}
        setTuningOptions={setTuningOptions}
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <ChatPane
          conversation={activeConv}
          isStreaming={isStreaming}
          showThinking={showThinking}
        />
        <Composer
          onSend={handleSend}
          onStop={handleStop}
          isGenerating={isStreaming}
          disabled={false}
          selectedModel={selectedModel}
          models={availableModels}
          onModelChange={setSelectedModel}
          onOpenPullModal={() => setShowPullModal(true)}
          showThinking={showThinking}
          onToggleThinking={() => setShowThinking(!showThinking)}
        />

        <HardwareMonitor />

        {showPullModal && (
          <PullModelModal
            onClose={() => setShowPullModal(false)}
            onSuccess={() => fetchModels()}
          />
        )}

        {showCreateModal && (
          <CreateModelModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchModels();
            }}
            models={availableModels}
            selectedModel={selectedModel}
          />
        )}
      </div>
    </div>
  );
}
