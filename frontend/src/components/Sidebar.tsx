import { useState } from "react";
import type { Conversation, TuningOptions } from "../types";
import { groupByDate } from "../lib/utils";
import ConversationRow from "./ConversationRow";
import TuningPanel from "./TuningPanel";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  theme: string;
  toggleTheme: () => void;
  tuningOptions: TuningOptions;
  setTuningOptions: (opts: TuningOptions) => void;
  onOpenCreateModal: () => void;
}

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Older"];

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  theme,
  toggleTheme,
  tuningOptions,
  setTuningOptions,
  onOpenCreateModal,
}: Props) {

  const [showTuning, setShowTuning] = useState(false);
  const [isSideOpen, setIsSideOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isSideOpen || isHovered;

  const filtered = conversations;

  const groups: Record<string, Conversation[]> = {};
  for (const conv of filtered) {
    const label = groupByDate(conv.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  return (
    <aside
      className={`${isExpanded ? "w-60" : "w-14"} h-full bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/6 flex flex-col shrink-0 transition-all duration-200 overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div
        className={`px-3 py-6 flex items-center border-b border-zinc-200 dark:border-zinc-700 mb-4 ${isExpanded ? "justify-between gap-2 px-6" : "justify-center"}`}
      >
        <button
          onClick={() => setIsSideOpen((v) => !v)}
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
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

        {isExpanded && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="w-5 h-5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            fill="currentColor"
          >
            <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
          </svg>
        )}
      </div>

      <div className="px-2">
        <button
          onClick={onNew}
          className="flex items-center w-full gap-2 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm hover:bg-zinc-100 dark:hover:bg-white/8 border border-zinc-200 dark:border-white/10 px-3 py-2 rounded-full transition-colors cursor-pointer shadow-sm"
          title="New conversation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="w-5 h-5 shrink-0"
            fill="currentColor"
          >
            <path d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z" />
          </svg>
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isExpanded ? "max-w-xs opacity-100" : "max-w-0 opacity-0"}`}
          >
            New Chat
          </span>
        </button>
      </div>

      {/* Conversation list */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {conversations.length === 0 && (
            <div className="text-center py-10 px-4">
              <p className="text-[11px] text-zinc-400 dark:text-zinc-600 leading-relaxed">
                No conversations yet.
              </p>
            </div>
          )}

          {filtered.length === 0 && conversations.length > 0 && (
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 text-center py-6">
              No results.
            </p>
          )}

          {GROUP_ORDER.filter((g) => groups[g]?.length).map((group) => (
            <div key={group} className="mb-1 flex flex-col gap-2">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-medium px-2 pt-4 pb-1">
                {group}
              </p>
              {groups[group].map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeId}
                  onSelect={() => onSelect(conv.id)}
                  onDelete={() => onDelete(conv.id)}
                  onRename={(title) => onRename(conv.id, title)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1" />

      <div className="p-2 flex flex-col gap-1">
        <button
          onClick={onOpenCreateModal}
          className="flex items-center w-full gap-2 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white backdrop-blur-sm hover:bg-zinc-100 dark:hover:bg-white/8 px-3 py-2 rounded-full transition-colors cursor-pointer"
          title="Create model"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="w-5 h-5 shrink-0"
            fill="currentColor"
          >
            <path d="M280 88C280 57.1 254.9 32 224 32C193.1 32 168 57.1 168 88C168 118.9 193.1 144 224 144C254.9 144 280 118.9 280 88zM304 300.7L341 350.6C353.8 333.1 369.5 317.9 387.3 305.6L331.1 229.9C306 196 266.3 176 224 176C181.7 176 142 196 116.8 229.9L46.3 324.9C35.8 339.1 38.7 359.1 52.9 369.7C67.1 380.3 87.1 377.3 97.7 363.1L144 300.7L144 576C144 593.7 158.3 608 176 608C193.7 608 208 593.7 208 576L208 416C208 407.2 215.2 400 224 400C232.8 400 240 407.2 240 416L240 576C240 593.7 254.3 608 272 608C289.7 608 304 593.7 304 576L304 300.7zM496 608C575.5 608 640 543.5 640 464C640 384.5 575.5 320 496 320C416.5 320 352 384.5 352 464C352 543.5 416.5 608 496 608zM512 400L512 448L560 448C568.8 448 576 455.2 576 464C576 472.8 568.8 480 560 480L512 480L512 528C512 536.8 504.8 544 496 544C487.2 544 480 536.8 480 528L480 480L432 480C423.2 480 416 472.8 416 464C416 455.2 423.2 448 432 448L480 448L480 400C480 391.2 487.2 384 496 384C504.8 384 512 391.2 512 400z" />
          </svg>
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isExpanded ? "max-w-xs opacity-100" : "max-w-0 opacity-0"}`}
          >
            Crear Persona
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowTuning((v) => !v)}
            className="flex items-center w-full gap-2 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white backdrop-blur-sm hover:bg-zinc-100 dark:hover:bg-white/8 px-3 py-2 rounded-full transition-colors cursor-pointer"
            title="Inference tuning"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="w-5 h-5 shrink-0"
              fill="currentColor"
            >
              <path d="M415.9 274.5C428.1 271.2 440.9 277 446.4 288.3L465 325.9C475.3 327.3 485.4 330.1 494.9 334L529.9 310.7C540.4 303.7 554.3 305.1 563.2 314L582.4 333.2C591.3 342.1 592.7 356.1 585.7 366.5L562.4 401.4C564.3 406.1 566 411 567.4 416.1C568.8 421.2 569.7 426.2 570.4 431.3L608.1 449.9C619.4 455.5 625.2 468.3 621.9 480.4L614.9 506.6C611.6 518.7 600.3 526.9 587.7 526.1L545.7 523.4C539.4 531.5 532.1 539 523.8 545.4L526.5 587.3C527.3 599.9 519.1 611.3 507 614.5L480.8 621.5C468.6 624.8 455.9 619 450.3 607.7L431.7 570.1C421.4 568.7 411.3 565.9 401.8 562L366.8 585.3C356.3 592.3 342.4 590.9 333.5 582L314.3 562.8C305.4 553.9 304 540 311 529.5L334.3 494.5C332.4 489.8 330.7 484.9 329.3 479.8C327.9 474.7 327 469.6 326.3 464.6L288.6 446C277.3 440.4 271.6 427.6 274.8 415.5L281.8 389.3C285.1 377.2 296.4 369 309 369.8L350.9 372.5C357.2 364.4 364.5 356.9 372.8 350.5L370.1 308.7C369.3 296.1 377.5 284.7 389.6 281.5L415.8 274.5zM448.4 404C424.1 404 404.4 423.7 404.5 448.1C404.5 472.4 424.2 492 448.5 492C472.8 492 492.5 472.3 492.5 448C492.4 423.6 472.7 404 448.4 404zM224.9 18.5L251.1 25.5C263.2 28.8 271.4 40.2 270.6 52.7L267.9 94.5C276.2 100.9 283.5 108.3 289.8 116.5L331.8 113.8C344.3 113 355.7 121.2 359 133.3L366 159.5C369.2 171.6 363.5 184.4 352.2 190L314.5 208.6C313.8 213.7 312.8 218.8 311.5 223.8C310.2 228.8 308.4 233.8 306.5 238.5L329.8 273.5C336.8 284 335.4 297.9 326.5 306.8L307.3 326C298.4 334.9 284.5 336.3 274 329.3L239 306C229.5 309.9 219.4 312.7 209.1 314.1L190.5 351.7C184.9 363 172.1 368.7 160 365.5L133.8 358.5C121.6 355.2 113.5 343.8 114.3 331.3L117 289.4C108.7 283 101.4 275.6 95.1 267.4L53.1 270.1C40.6 270.9 29.2 262.7 25.9 250.6L18.9 224.4C15.7 212.3 21.4 199.5 32.7 193.9L70.4 175.3C71.1 170.2 72.1 165.2 73.4 160.1C74.8 155 76.4 150.1 78.4 145.4L55.1 110.5C48.1 100 49.5 86.1 58.4 77.2L77.6 58C86.5 49.1 100.4 47.7 110.9 54.7L145.9 78C155.4 74.1 165.5 71.3 175.8 69.9L194.4 32.3C200 21 212.7 15.3 224.9 18.5zM192.4 148C168.1 148 148.4 167.7 148.4 192C148.4 216.3 168.1 236 192.4 236C216.7 236 236.4 216.3 236.4 192C236.4 167.7 216.7 148 192.4 148z" />
            </svg>
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isExpanded ? "max-w-xs opacity-100" : "max-w-0 opacity-0"}`}
            >
              Configuración
            </span>
          </button>
          {showTuning && (
            <TuningPanel
              options={tuningOptions}
              onChange={setTuningOptions}
              popupClass="right-1/2 left-1/2 bottom-full mb-2"
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
        <span
          className={`whitespace-nowrap overflow-hidden transition-all duration-200 text-[10px] text-zinc-400 dark:text-zinc-600 ${isExpanded ? "max-w-xs opacity-100" : "max-w-0 opacity-0"}`}
        >
          Powered by Ollama
        </span>

        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-white/8 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white transition-colors"
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </aside>
  );
}
