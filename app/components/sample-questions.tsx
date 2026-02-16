"use client";

import { BarChart3, RefreshCw, Smartphone, Shield, Lock, FlaskConical } from "lucide-react";

const sampleQuestions = [
  {
    question: "What's our SLA for payment processing uptime?",
    description: "Contract & compliance info",
    icon: BarChart3,
    color: "hover:border-blue-300 hover:bg-blue-50/50",
  },
  {
    question: "How do we handle failed payment retries?",
    description: "Engineering docs & Jira tickets",
    icon: RefreshCw,
    color: "hover:border-emerald-300 hover:bg-emerald-50/50",
  },
  {
    question: "What did we decide about Apple Pay integration?",
    description: "Slack discussions & ADRs",
    icon: Smartphone,
    color: "hover:border-purple-300 hover:bg-purple-50/50",
  },
  {
    question: "Who owns the fraud detection system?",
    description: "Team assignments & tickets",
    icon: Shield,
    color: "hover:border-amber-300 hover:bg-amber-50/50",
  },
  {
    question: "What are the PCI compliance requirements?",
    description: "Wiki pages & contracts",
    icon: Lock,
    color: "hover:border-red-300 hover:bg-red-50/50",
  },
  {
    question: "How do I set up the test environment?",
    description: "Onboarding guides & Slack",
    icon: FlaskConical,
    color: "hover:border-teal-300 hover:bg-teal-50/50",
  },
];

interface SampleQuestionsProps {
  onQuestionClick?: (question: string) => void;
}

export function SampleQuestions({ onQuestionClick }: SampleQuestionsProps) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">
        Try asking
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sampleQuestions.map((q) => (
          <button
            key={q.question}
            onClick={() => onQuestionClick?.(q.question)}
            className={`text-left p-4 bg-white rounded-lg border border-slate-200 transition-all duration-200 ${q.color} group cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <q.icon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0 group-hover:text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 leading-snug">
                  {q.question}
                </p>
                <p className="text-xs text-slate-400 mt-1">{q.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
