export function Footer() {
  return (
    <footer className="border-t bg-white mt-16">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Built with{" "}
            <span className="font-medium text-slate-700">Next.js</span>,{" "}
            <span className="font-medium text-slate-700">Groq</span>,{" "}
            <span className="font-medium text-slate-700">
              Vercel Postgres + pgvector
            </span>
            , and{" "}
            <span className="font-medium text-slate-700">Transformers.js</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://github.com/MateiMiron/project-knowledge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              GitHub
            </a>
            <span className="text-slate-300">|</span>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              LinkedIn Post
            </a>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400">
            Demo knowledge base for an e-commerce payments team. All data is
            fictional. Powered by Llama 3.3 70B via Groq free tier.
          </p>
        </div>
      </div>
    </footer>
  );
}
