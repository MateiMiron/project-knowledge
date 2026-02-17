import { Header } from "./components/header";
import { StatsBar } from "./components/stats-bar";
import { MainTabs } from "./components/main-tabs";
import { Footer } from "./components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Project Knowledge
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Stop searching across 15 different tools. Ask questions about your
            team&apos;s Jira tickets, wiki pages, contracts, and Slack
            conversations in one place.
          </p>
        </div>
        <StatsBar />
        <MainTabs />
      </main>
      <Footer />
    </div>
  );
}
