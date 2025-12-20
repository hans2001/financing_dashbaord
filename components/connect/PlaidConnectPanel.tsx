"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";

import { useLinkToken } from "./useLinkToken";

const environmentLabel = "Plaid Link";
const environmentTitle = "Connect a real account";
const environmentCopy =
"This page uses Plaid Link to open the production flow. After you authenticate with your bank, we swap the public token for an access token and store it securely in Postgres.";
const environmentStatusText =
"Production mode — authenticate with your bank when Link opens.";
const environmentNotes =
"Plaid never stores your banking password; we only keep the resulting access token tied to your family dashboard.";

type PlaidLinkExitError = {
  error_code?: string;
  error_type?: string;
  display_message?: string;
  error_message?: string;
};

type PlaidLinkExitMetadata = {
  link_session_id?: string;
  institution_id?: string;
};

const reportLinkExit = async (
  error: PlaidLinkExitError | null,
  metadata: PlaidLinkExitMetadata,
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

export function PlaidConnectPanel() {
  const router = useRouter();
  const {
    linkToken,
    isFetchingToken,
    fetchError,
    isUnauthorized,
  } = useLinkToken();
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

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
          error instanceof Error ? error.message : "Failed to exchange public token",
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
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600">
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
        {isUnauthorized && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-900">
            <p>Please sign in to launch Plaid Link.</p>
            <button
              type="button"
              className="mt-2 inline-flex items-center justify-center rounded-md border border-rose-300 bg-white px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm shadow-rose-900/10 transition hover:bg-rose-50"
              onClick={() => router.push("/auth/login")}
            >
              Go to login
            </button>
          </div>
        )}

        <div className="mt-8 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Production notes
          </h2>
          <p className="mt-4 text-sm text-slate-600">{environmentNotes}</p>
        </div>
      </section>
  );
}
