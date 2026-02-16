"use client";

import { Database } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-slate-900">
            Project Knowledge
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            GitHub
          </a>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            Demo
          </span>
        </div>
      </div>
    </header>
  );
}
