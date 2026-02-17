"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  BookOpen,
  ScrollText,
  MessageSquare,
  Mail,
  Calendar,
  AlertTriangle,
  Headphones,
  FlaskConical,
  Route,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Resource {
  id: string;
  type: string;
  sourceId: string;
  title: string;
  content: string;
  metadata: Record<string, unknown> | null;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof FileText; color: string; bg: string }
> = {
  jira: {
    label: "Jira Tickets",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  wiki: {
    label: "Wiki Pages",
    icon: BookOpen,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  contract: {
    label: "Contracts",
    icon: ScrollText,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  slack: {
    label: "Slack Threads",
    icon: MessageSquare,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
  },
  email: {
    label: "Emails",
    icon: Mail,
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
  },
  meeting: {
    label: "Meetings",
    icon: Calendar,
    color: "text-cyan-600",
    bg: "bg-cyan-50 border-cyan-200",
  },
  postmortem: {
    label: "Postmortems",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
  support: {
    label: "Support",
    icon: Headphones,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
  },
  "api-test": {
    label: "API Tests",
    icon: FlaskConical,
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
  },
  e2e: {
    label: "E2E Scenarios",
    icon: Route,
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-200",
  },
};

const TYPE_ORDER = ["jira", "wiki", "contract", "slack", "email", "meeting", "postmortem", "support", "api-test", "e2e"];

function ResourceCard({
  resource,
  isExpanded,
  onToggle,
}: {
  resource: Resource;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = TYPE_CONFIG[resource.type];
  const Icon = config?.icon || FileText;

  return (
    <div className={`border rounded-lg overflow-hidden ${config?.bg || "bg-white"}`}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
        )}
        <Icon className={`h-4 w-4 flex-shrink-0 ${config?.color || "text-slate-600"}`} />
        <span className="text-xs font-mono text-slate-500 flex-shrink-0">
          {resource.sourceId}
        </span>
        <span className="text-sm font-medium text-slate-800 truncate">
          {resource.title}
        </span>
        {resource.metadata && (
          <MetadataBadges metadata={resource.metadata} type={resource.type} />
        )}
      </button>
      {isExpanded && (
        <div className="border-t bg-white px-4 py-4 max-h-[500px] overflow-y-auto">
          <div className="prose prose-sm prose-slate max-w-none">
            <ReactMarkdown>{resource.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

function MetadataBadges({
  metadata,
  type,
}: {
  metadata: Record<string, unknown>;
  type: string;
}) {
  const badges: string[] = [];

  if (type === "jira") {
    if (metadata.status) badges.push(String(metadata.status));
    if (metadata.priority) badges.push(String(metadata.priority));
    if (metadata.type) badges.push(String(metadata.type));
  } else if (type === "wiki") {
    if (metadata.category) badges.push(String(metadata.category));
  } else if (type === "contract") {
    if (metadata.vendor) badges.push(String(metadata.vendor));
  } else if (type === "slack") {
    if (metadata.channel) badges.push(`#${metadata.channel}`);
  } else if (type === "email") {
    if (metadata.from) badges.push(String(metadata.from).split("<")[0].trim());
  } else if (type === "meeting") {
    if (metadata.type) badges.push(String(metadata.type));
    if (metadata.duration) badges.push(String(metadata.duration));
  } else if (type === "postmortem") {
    if (metadata.severity) badges.push(String(metadata.severity));
    if (metadata.duration) badges.push(String(metadata.duration));
  } else if (type === "support") {
    if (metadata.priority) badges.push(String(metadata.priority));
    if (metadata.status) badges.push(String(metadata.status));
    if (metadata.category) badges.push(String(metadata.category));
  } else if (type === "api-test") {
    if (metadata.status) badges.push(String(metadata.status));
    if (metadata.coverage) badges.push(String(metadata.coverage));
    if (metadata.method) badges.push(String(metadata.method));
  } else if (type === "e2e") {
    if (metadata.priority) badges.push(String(metadata.priority));
    if (metadata.status) badges.push(String(metadata.status));
    if (metadata.duration) badges.push(String(metadata.duration));
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex gap-1 flex-shrink-0 ml-auto">
      {badges.slice(0, 3).map((badge) => (
        <span
          key={badge}
          className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 text-slate-500 border whitespace-nowrap"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}

interface SourcesBrowserProps {
  navigateTarget?: { type: string; id: string } | null;
  onNavigateComplete?: () => void;
}

export function SourcesBrowser({ navigateTarget, onNavigateComplete }: SourcesBrowserProps) {
  const [resources, setResources] = useState<Record<string, Resource[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("jira");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        setResources(data.resources || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Handle navigation from source badge click
  useEffect(() => {
    if (navigateTarget && !loading) {
      setActiveType(navigateTarget.type);
      setExpandedId(navigateTarget.id);
      onNavigateComplete?.();
      // Scroll to the card after render
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [navigateTarget, loading, onNavigateComplete]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-12 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
        <span className="ml-3 text-sm text-slate-500">Loading sources...</span>
      </div>
    );
  }

  const currentResources = resources[activeType] || [];

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="border-b px-4 py-3 bg-slate-50/50">
        <h2 className="text-sm font-semibold text-slate-700">
          Knowledge Base Sources
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Browse all {Object.values(resources).flat().length} documents loaded
          into the knowledge base
        </p>
      </div>

      {/* Type tabs */}
      <div className="border-b flex overflow-x-auto">
        {TYPE_ORDER.map((type) => {
          const config = TYPE_CONFIG[type];
          const Icon = config.icon;
          const count = (resources[type] || []).length;
          const isActive = activeType === type;

          return (
            <button
              key={type}
              onClick={() => {
                setActiveType(type);
                setExpandedId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? `${config.color} border-current`
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{config.label}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-slate-100" : "bg-slate-100"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Document list */}
      <div className="p-4 space-y-2 max-h-[500px] overflow-y-scroll">
        {currentResources.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No documents found for this type.
          </p>
        ) : (
          currentResources.map((resource) => (
            <div
              key={resource.id}
              ref={expandedId === resource.id ? highlightedRef : undefined}
            >
              <ResourceCard
                resource={resource}
                isExpanded={expandedId === resource.id}
                onToggle={() =>
                  setExpandedId(expandedId === resource.id ? null : resource.id)
                }
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
