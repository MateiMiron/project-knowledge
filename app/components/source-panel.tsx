import { FileText, BookOpen, ScrollText, MessageSquare } from "lucide-react";

interface Source {
  id: string;
  type: string;
  title: string;
  sourceId: string;
}

const typeConfig: Record<
  string,
  { label: string; icon: typeof FileText; color: string }
> = {
  jira: {
    label: "Jira",
    icon: FileText,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  wiki: {
    label: "Wiki",
    icon: BookOpen,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  contract: {
    label: "Contract",
    icon: ScrollText,
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  slack: {
    label: "Slack",
    icon: MessageSquare,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export function SourcePanel({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <p className="text-xs font-medium text-slate-400 mb-2">Sources used:</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => {
          const config = typeConfig[source.type] || typeConfig.jira;
          const Icon = config.icon;
          return (
            <div
              key={source.id}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
            >
              <Icon className="h-3 w-3" />
              <span>{source.sourceId}</span>
              <span className="opacity-60">-</span>
              <span className="opacity-80 truncate max-w-[150px]">
                {source.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
