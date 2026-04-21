import { useState, useRef, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatPane from "./components/ChatPane";
import Composer from "./components/Composer";
import PullModelModal from "./components/PullModelModal";
import CreateModelModal from "./components/CreateModelModal";
import HardwareMonitor from "./components/HardwareMonitor";
import SearchModal from "./components/SearchModal";
import type { Conversation, Message, TuningOptions, Persona } from "./types";
import { nanoid, parseContent } from "./lib/utils";
import { useLocalModels } from "./hooks/localModels";
import { usePersonas } from "./hooks/usePersonas";

function makeTitle(text: string): string {
  return text.trim().slice(0, 42) || "New Conversation";
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const {
    models: availableModels,
    selectedModel,
    setSelectedModel,
    refetch: fetchModels,
  } = useLocalModels();
  const { personas, refetch: fetchPersonas } = usePersonas();
  const [showThinking, setShowThinking] = useState<boolean>(true);
  const [showPullModal, setShowPullModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [targetMessageId, setTargetMessageId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [tuningOptions, setTuningOptions] = useState<TuningOptions>({
    temperature: 0.7,
    num_ctx: 2048,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  const abortRef = useRef<AbortController | null>(null);

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;

  // Carga inicial de conversaciones desde la API
  useEffect(() => {
    fetch("http://127.0.0.1:5000/conversations")
      .then((r) => r.json())
      .then((data: any[]) => {
        const convs: Conversation[] = data.map((c) => ({
          id: c.id,
          title: c.title,
          model: c.model,
          preview: c.preview ?? undefined,
          createdAt: new Date(c.created_at),
          messages: [], // lazy — se cargan al seleccionar
        }));
        setConversations(convs);
      })
      .catch(() => {}); // si el backend no está up, no crashear
  }, []);

  // Lazy load de mensajes al seleccionar una conversación
  const loadMessages = useCallback((id: string) => {
    setConversations((prev) => {
      const conv = prev.find((c) => c.id === id);
      if (!conv || conv.messages.length > 0) return prev; // ya cargado

      // Fetch silencioso — sin estado de loading
      fetch(`http://127.0.0.1:5000/conversations/${id}`)
        .then((r) => r.json())
        .then((data: any) => {
          const messages: Message[] = (data.messages ?? []).map((m: any) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            model: m.model ?? undefined,
            thinking: m.thinking ?? null,
            thinkingDone:
              m.thinking != null && m.content !== "" ? true : undefined,
          }));
          setConversations((prev2) =>
            prev2.map((c) => (c.id === id ? { ...c, messages } : c)),
          );
        })
        .catch(() => {});

      return prev; // no mutar aún — el fetch callback lo hará
    });
  }, []);

  const handleSelect = useCallback(
    (id: string, messageId?: string) => {
      setActiveId(id);
      setTargetMessageId(messageId ?? null);
      loadMessages(id);
    },
    [loadMessages],
  );

  const createConversation = useCallback(async () => {
    const id = nanoid();
    const now = new Date().toISOString();
    const conv: Conversation = {
      id,
      title: "New Conversation",
      messages: [],
      model: selectedModel,
      createdAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);

    await fetch("http://127.0.0.1:5000/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title: "New Conversation",
        model: selectedModel,
        preview: "",
        created_at: now,
      }),
    }).catch(() => {});
  }, [selectedModel]);

  const handleSend = async (text: string, files: File[]) => {
    if (isStreaming) return;

    // Crear conversación on-the-fly si no hay ninguna activa
    let convId = activeId;
    if (!convId) {
      convId = nanoid();
      const now = new Date().toISOString();
      const title = makeTitle(text);
      const conv: Conversation = {
        id: convId,
        title,
        messages: [],
        model: selectedModel,
        createdAt: new Date(),
        preview: text.slice(0, 80),
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(convId);

      await fetch("http://127.0.0.1:5000/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: convId,
          title,
          model: selectedModel,
          preview: text.slice(0, 80),
          created_at: now,
        }),
      }).catch(() => {});
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

    // Agregar ambos mensajes y actualizar título si sigue siendo el default
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

    // Persistir el user message en DB
    await fetch(`http://127.0.0.1:5000/conversations/${convId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userMsgId,
        role: "user",
        content: text,
        thinking: null,
        model: null,
        created_at: new Date().toISOString(),
      }),
    }).catch(() => {});

    setIsStreaming(true);
    abortRef.current = new AbortController();

    // Variables para capturar el contenido final al terminar el stream
    let finalContent = "";
    let finalThinking: string | null = null;

    try {
      const fd = new FormData();
      fd.append("model", selectedModel);
      fd.append("text", text);
      fd.append("showThinking", showThinking.toString());
      fd.append("options_json", JSON.stringify(tuningOptions));
      if (activePersona?.system_prompt) {
        fd.append("system_prompt", activePersona.system_prompt);
      }

      // Send conversation history so the model has full context
      // (critical when switching models or using personas)
      const currentConv = conversations.find((c) => c.id === convId);
      if (currentConv && currentConv.messages.length > 0) {
        // Include all prior messages (excluding the empty assistant placeholder we just added)
        const history = currentConv.messages
          .filter((m) => m.id !== assistantMsgId && m.content.trim() !== "")
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));
        if (history.length > 0) {
          fd.append("history_json", JSON.stringify(history));
        }
      }

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
        finalContent = content;
        finalThinking = thinking ?? null;

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

      // Stream terminado — persistir assistant message y actualizar preview de la conv
      const assistantCreatedAt = new Date().toISOString();
      await fetch(`http://127.0.0.1:5000/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: assistantMsgId,
          role: "assistant",
          content: finalContent,
          thinking: finalThinking,
          model: selectedModel,
          created_at: assistantCreatedAt,
        }),
      }).catch(() => {});

      await fetch(`http://127.0.0.1:5000/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preview: finalContent.slice(0, 80) || text.slice(0, 80),
          updated_at: assistantCreatedAt,
        }),
      }).catch(() => {});
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
    fetch(`http://127.0.0.1:5000/conversations/${id}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  const handleRename = (id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    );
    fetch(`http://127.0.0.1:5000/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, updated_at: new Date().toISOString() }),
    }).catch(() => {});
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
    <div className="h-screen flex bg-[#efefef] dark:bg-[#0d0d0d] text-zinc-900 dark:text-zinc-100 overflow-hidden transition-all duration-300 ease-out">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={createConversation}
        onDelete={handleDelete}
        onRename={handleRename}
        theme={theme}
        toggleTheme={toggleTheme}
        tuningOptions={tuningOptions}
        setTuningOptions={setTuningOptions}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="w-5 h-5"
              fill="currentColor"
            >
              <path d="M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z" />
            </svg>
          </button>
          <span className="ml-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            LLuMi
          </span>
        </div>

        <ChatPane
          conversation={activeConv}
          isStreaming={isStreaming}
          showThinking={showThinking}
          targetMessageId={targetMessageId}
          onTargetMessageScrolled={() => setTargetMessageId(null)}
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
          personas={personas}
          activePersonaName={activePersona?.name ?? null}
          onPersonaToggle={(name) => {
            if (activePersona?.name === name) {
              setActivePersona(null);
            } else {
              const persona = personas.find((p) => p.name === name);
              setActivePersona(persona ?? null);
            }
          }}
          onDeletePersona={async (id) => {
            if (activePersona?.id === id) setActivePersona(null);
            await fetch(`http://127.0.0.1:5000/custom_models/${id}`, {
              method: "DELETE",
            }).catch(() => {});
            fetchPersonas();
          }}
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
              fetchPersonas();
            }}
            models={availableModels}
            selectedModel={selectedModel}
          />
        )}
      </div>

      {showSearchModal && (
        <SearchModal
          conversations={conversations}
          onClose={() => setShowSearchModal(false)}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
