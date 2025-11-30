import Link from "next/link";

const highlights = [
  "Connect to Plaid Sandbox using user_good / pass_good credentials.",
  "Persist users, items, accounts, and transactions in Postgres via Prisma.",
  "View accounts, recent activity, and spending summaries in one dashboard.",
];

export default function HomePage() {
  return (
    <main className="min-h-[80vh] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <section className="rounded-3xl border border-slate-200 bg-white/70 p-10 shadow-lg shadow-slate-900/5 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Personal Finance Dashboard
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 md:text-5xl">
            Sandbox-ready Plaid + Prisma wiring
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Sync your Plaid Sandbox data into Postgres, explore accounts and
            transactions, and visualize basic spending insights without leaving
            your browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/connect"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-black transition hover:bg-primary/90"
            >
              Connect your bank
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              View dashboard
            </Link>
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl bg-slate-900/90 px-6 py-8 text-white shadow-xl shadow-slate-900/30 sm:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item}
              className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm"
            >
              {item}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
