import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";
import { SourcePanel } from "./source-panel";

interface Source {
  id: string;
  type: string;
  title: string;
  sourceId: string;
}

interface MessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  onSourceClick?: (source: { type: string; id: string }) => void;
}

export function Message({ role, content, sources, onSourceClick }: MessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot className="h-4 w-4 text-blue-600" />
        </div>
      )}
      <div
        className={`max-w-[80%] ${
          isUser
            ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5"
            : "bg-white border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"
        }`}
      >
        {isUser ? (
          <p className="text-sm">{content}</p>
        ) : (
          <div className="prose prose-sm prose-slate max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-sm text-slate-700 leading-relaxed mb-2 last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="text-sm text-slate-700 list-disc pl-4 mb-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-sm text-slate-700 list-decimal pl-4 mb-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-900">
                    {children}
                  </strong>
                ),
                code: ({ children }) => (
                  <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
            {sources && sources.length > 0 && <SourcePanel sources={sources} onSourceClick={onSourceClick} />}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      )}
    </div>
  );
}
