import { FileText, BookOpen, ScrollText, MessageSquare, Mail, Calendar, AlertTriangle, Headphones, FlaskConical, Route } from "lucide-react";

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
  email: {
    label: "Email",
    icon: Mail,
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
  meeting: {
    label: "Meeting",
    icon: Calendar,
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  postmortem: {
    label: "Postmortem",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-700 border-red-200",
  },
  support: {
    label: "Support",
    icon: Headphones,
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  "api-test": {
    label: "API Test",
    icon: FlaskConical,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  e2e: {
    label: "E2E",
    icon: Route,
    color: "bg-teal-100 text-teal-700 border-teal-200",
  },
};

export function SourcePanel({ sources, onSourceClick }: { sources: Source[]; onSourceClick?: (source: { type: string; id: string }) => void }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <p className="text-xs font-medium text-slate-400 mb-2">Sources used:</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => {
          const config = typeConfig[source.type] || typeConfig.jira;
          const Icon = config.icon;
          return (
            <button
              key={source.id}
              type="button"
              onClick={() => onSourceClick?.({ type: source.type, id: source.id })}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} hover:opacity-80 transition-opacity cursor-pointer`}
              title={`View ${source.sourceId} in Browse Sources`}
            >
              <Icon className="h-3 w-3" />
              <span>{source.sourceId}</span>
              <span className="opacity-60">-</span>
              <span className="opacity-80 truncate max-w-[150px]">
                {source.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
