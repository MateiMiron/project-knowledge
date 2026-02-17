"use client";

import { useState, useCallback } from "react";
import { MessageSquareText, Database } from "lucide-react";
import { Chat } from "./chat";
import { SourcesBrowser } from "./sources-browser";

export interface SourceNavigationTarget {
  type: string;
  id: string;
}

export function MainTabs() {
  const [activeTab, setActiveTab] = useState<"chat" | "sources">("chat");
  const [navigateTarget, setNavigateTarget] = useState<SourceNavigationTarget | null>(null);

  const handleSourceClick = useCallback((source: { type: string; id: string }) => {
    setNavigateTarget(source);
    setActiveTab("sources");
  }, []);

  return (
    <div>
      {/* Tab switcher */}
      <div role="tablist" aria-label="Knowledge base navigation" className="flex gap-2 mb-4">
        <button
          role="tab"
          aria-selected={activeTab === "chat"}
          aria-controls="panel-chat"
          id="tab-chat"
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "chat"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border hover:bg-slate-50"
          }`}
        >
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          Ask Questions
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "sources"}
          aria-controls="panel-sources"
          id="tab-sources"
          onClick={() => setActiveTab("sources")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "sources"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border hover:bg-slate-50"
          }`}
        >
          <Database className="h-4 w-4" aria-hidden="true" />
          Browse Sources
        </button>
      </div>

      {/* Tab content */}
      <div
        role="tabpanel"
        id={activeTab === "chat" ? "panel-chat" : "panel-sources"}
        aria-labelledby={activeTab === "chat" ? "tab-chat" : "tab-sources"}
        className="min-h-[610px]"
      >
        {activeTab === "chat" ? (
          <Chat onSourceClick={handleSourceClick} />
        ) : (
          <SourcesBrowser
            navigateTarget={navigateTarget}
            onNavigateComplete={() => setNavigateTarget(null)}
          />
        )}
      </div>
    </div>
  );
}
