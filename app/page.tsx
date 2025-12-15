import { PlaidConnectPanel } from "@/components/connect/PlaidConnectPanel";

const instructions = [
  {
    title: "FAMILY VIEW",
    body: "Every visit shows Yuki & Hans's shared accounts, balances, and recent activity.",
  },
  {
    title: "QUICK CONNECT",
    body: "Launch Plaid Link, authorize a bank, and keep transactions in sync.",
  },
  {
    title: "FILTER INSIGHTS",
    body: "Use the dashboard filters to slice data by account, flow, or date range.",
  },
];

export default function HomePage() {
  return (
    <main className="px-4 py-8">
      <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg shadow-slate-900/5 backdrop-blur">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Yuki &amp; Hans Family Finance
            </p>
            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
              {instructions.map((instruction) => (
                <article
                  key={instruction.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 shadow-sm"
                >
                  <h2 className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    {instruction.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed sm:text-sm">
                    {instruction.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <PlaidConnectPanel />
          </div>
        </div>
      </section>
    </main>
  );
}
