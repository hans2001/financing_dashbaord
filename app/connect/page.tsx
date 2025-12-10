"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";

const environmentLabel = "Plaid Link";
const environmentTitle = "Connect a real account";
const environmentCopy =
"This page uses Plaid Link to open the production flow. After you authenticate with your bank, we swap the public token for an access token and store it securely in Postgres.";
const environmentStatusText =
"Production mode — authenticate with your bank when Link opens.";
const environmentNotes =
"Plaid never stores your banking password; we only keep the resulting access token tied to your family dashboard.";

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

const reportLinkExit = async (
  error: null | { error_code?: string; error_type?: string; display_message?: string },
  metadata: { link_session_id?: string; institution_id?: string },
) => {
  try {
    await fetch("/api/plaid/link-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error,
        metadata,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn("Unable to log Plaid Link exit", err);
  }
};

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
    onExit: (error, metadata) => {
      if (error) {
        setExchangeError(error.display_message ?? error.error_message ?? null);
      }
      reportLinkExit(error, metadata);
    },
  });

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md shadow-slate-900/5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f5ef2]">
            {environmentLabel} Plaid Link
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            {environmentTitle}
          </h1>
          <p className="mt-2 text-base text-slate-600">{environmentCopy}</p>

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
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
              <span className="text-sm font-semibold text-slate-900">
                Production mode
              </span>
              <span className="text-xs text-slate-500 sm:text-sm">
                {environmentStatusText}
              </span>
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
              Production notes
            </h2>
            <p className="mt-4 text-sm text-slate-600">{environmentNotes}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
