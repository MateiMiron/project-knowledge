"use client";

import { useChat } from "ai/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { Message } from "./message";
import { SampleQuestions } from "./sample-questions";

interface Source {
  id: string;
  type: string;
  title: string;
  sourceId: string;
}

export function Chat({ onSourceClick }: { onSourceClick?: (source: { type: string; id: string }) => void }) {
  const [sourcesMap, setSourcesMap] = useState<Record<string, Source[]>>({});
  const [remaining, setRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, append } =
    useChat({
      api: "/api/chat",
      onResponse: (response) => {
        const sourcesHeader = response.headers.get("X-Sources");
        const remainingHeader = response.headers.get("X-Rate-Remaining");

        if (sourcesHeader) {
          try {
            const sources = JSON.parse(sourcesHeader) as Source[];
            // We'll associate sources with the next assistant message
            const msgId = `pending-${Date.now()}`;
            setSourcesMap((prev) => ({ ...prev, [msgId]: sources }));
          } catch {
            // ignore parse errors
          }
        }

        if (remainingHeader) {
          setRemaining(parseInt(remainingHeader, 10));
        }
      },
    });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Get sources for assistant messages in order
  const pendingSources = Object.values(sourcesMap);
  const getSourcesForMessage = (index: number): Source[] => {
    // Count assistant messages up to this index
    let assistantCount = 0;
    for (let i = 0; i <= index; i++) {
      if (messages[i].role === "assistant") assistantCount++;
    }
    return pendingSources[assistantCount - 1] || [];
  };

  const handleSampleQuestion = useCallback(
    (question: string) => {
      append({ role: "user", content: question });
    },
    [append]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden" role="region" aria-label="TeamBrain Chat">
      <div className="border-b px-4 py-3 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-sm font-semibold text-slate-700">
          TeamBrain Chat
        </h2>
        {remaining !== null && (
          <span className="text-xs text-slate-500">
            {remaining} queries remaining today
          </span>
        )}
      </div>

      <div className="h-[500px] overflow-y-auto p-4 space-y-4" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <p className="text-sm mb-6">
              Ask a question about the payments team&apos;s knowledge base
            </p>
            <div className="w-full max-w-2xl">
              <SampleQuestions onQuestionClick={handleSampleQuestion} />
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <Message
              key={msg.id}
              role={msg.role as "user" | "assistant"}
              content={msg.content}
              sources={
                msg.role === "assistant"
                  ? getSourcesForMessage(idx)
                  : undefined
              }
              onSourceClick={onSourceClick}
            />
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3" role="status" aria-label="Generating response">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" aria-hidden="true" />
            </div>
            <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSubmit} className="border-t p-3 flex gap-2" aria-label="Chat input">
        <label htmlFor="chat-input" className="sr-only">
          Ask a question about the payments team knowledge base
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything about the payments team..."
          maxLength={2000}
          className="flex-1 px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
