"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";

const sandboxCredentials = [
  { label: "Username", value: "user_good" },
  { label: "Password", value: "pass_good" },
  { label: "2FA", value: "1234 (when prompted)" },
];

export default function ConnectPage() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isFetchingToken, setIsFetchingToken] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setIsFetchingToken(true);
      setFetchError(null);

      try {
        const response = await fetch("/api/plaid/create-link-token", {
          method: "POST",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? "Unable to create link token");
        }
        if (!ignore) {
          setLinkToken(data.link_token);
        }
      } catch (error) {
        setFetchError(
          error instanceof Error ? error.message : "Failed to create link token",
        );
      } finally {
        if (!ignore) {
          setIsFetchingToken(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess: async (public_token) => {
      setIsExchanging(true);
      setExchangeError(null);

      try {
        const response = await fetch("/api/plaid/exchange-public-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_token }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? "Unable to exchange public token");
        }

        router.push("/dashboard");
      } catch (error) {
        setExchangeError(
          error instanceof Error
            ? error.message
            : "Failed to exchange public token",
        );
        setIsExchanging(false);
      }
    },
    onExit: (error) => {
      if (error) {
        setExchangeError(error.display_message ?? error.error_message ?? null);
      }
    },
  });

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md shadow-slate-900/5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f5ef2]">
            Plaid Sandbox Link
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Connect a test account
          </h1>
          <p className="mt-2 text-base text-slate-600">
            This page uses Plaid Link to issue a sandbox credential flow. Once
            you complete the Link experience, Plaid will return a public token,
            which we exchange for an access token and persist in Postgres.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => open?.()}
              disabled={
                !ready ||
                isFetchingToken ||
                Boolean(fetchError) ||
                typeof linkToken !== "string" ||
                isExchanging
              }
            >
              {isExchanging
                ? "Linking account..."
                : isFetchingToken
                ? "Preparing Link..."
                : "Launch Plaid Link"}
            </button>
            <div className="flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
              Sandbox mode &mdash; username: <strong className="ml-1">user_good</strong>
            </div>
          </div>

          {fetchError && (
            <p className="mt-4 text-sm text-red-600">{fetchError}</p>
          )}
          {exchangeError && (
            <p className="mt-2 text-sm text-red-600">{exchangeError}</p>
          )}

          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Sandbox credentials
            </h2>
            <dl className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              {sandboxCredentials.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-white/80 p-3 shadow-sm shadow-slate-900/5"
                >
                  <dt className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-500">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}
