import { FileText, FolderOpen, Search, Zap } from "lucide-react";

const stats = [
  {
    label: "Documents",
    value: "27",
    icon: FileText,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Source Types",
    value: "4",
    icon: FolderOpen,
    color: "text-purple-600 bg-purple-50",
  },
  {
    label: "Searchable Chunks",
    value: "150+",
    icon: Search,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Avg Response",
    value: "<2s",
    icon: Zap,
    color: "text-amber-600 bg-amber-50",
  },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg border p-4 flex items-center gap-3"
        >
          <div className={`p-2 rounded-lg ${stat.color}`}>
            <stat.icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
