"use client";

import { useState } from "react";
import { MessageSquareText, Database } from "lucide-react";
import { Chat } from "./chat";
import { SourcesBrowser } from "./sources-browser";

export function MainTabs() {
  const [activeTab, setActiveTab] = useState<"chat" | "sources">("chat");

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "chat"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border hover:bg-slate-50"
          }`}
        >
          <MessageSquareText className="h-4 w-4" />
          Ask Questions
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "sources"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border hover:bg-slate-50"
          }`}
        >
          <Database className="h-4 w-4" />
          Browse Sources
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "chat" ? <Chat /> : <SourcesBrowser />}
    </div>
  );
}
