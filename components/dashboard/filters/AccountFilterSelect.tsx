'use client'

import { useEffect, useMemo, useRef, useState } from "react";

import type { Account } from "../types";
import { formatBalanceValue } from "../dashboard-utils";

const MAX_VISIBLE_TAGS = 4;

type AccountFilterSelectProps = {
  accounts: Account[];
  selectedAccounts: string[];
  onSelectedAccountsChange: (value: string[]) => void;
};

type TagState = {
  isAllSelected: boolean;
  visibleAccounts: Account[];
  overflowCount: number;
};

const computeTagState = (
  accounts: Account[],
  normalizedIds: string[],
): TagState => {
  const hasAllSelected =
    accounts.length > 0 && normalizedIds.length === accounts.length;
  if (hasAllSelected) {
    return {
      isAllSelected: true,
      visibleAccounts: accounts.slice(0, MAX_VISIBLE_TAGS),
      overflowCount: Math.max(accounts.length - MAX_VISIBLE_TAGS, 0),
    };
  }
  const visibleAccounts = accounts.filter((account) =>
    normalizedIds.includes(account.id),
  );
  return {
    isAllSelected: false,
    visibleAccounts: visibleAccounts.slice(0, MAX_VISIBLE_TAGS),
    overflowCount: Math.max(visibleAccounts.length - MAX_VISIBLE_TAGS, 0),
  };
};

const normalizeSelectedAccountIds = (
  selectedAccounts: string[],
  accounts: Account[],
) => {
  const filtered = selectedAccounts.filter(Boolean);
  if (filtered.includes("all")) {
    return accounts.map((account) => account.id);
  }
  return Array.from(new Set(filtered));
};

export function AccountFilterSelect({
  accounts,
  selectedAccounts,
  onSelectedAccountsChange,
}: AccountFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const normalizedSelectedIds = useMemo(
    () => normalizeSelectedAccountIds(selectedAccounts, accounts),
    [accounts, selectedAccounts],
  );

  const tagState = useMemo(
    () => computeTagState(accounts, normalizedSelectedIds),
    [accounts, normalizedSelectedIds],
  );

  const showAllTag = tagState.isAllSelected;
  const hasSelection = normalizedSelectedIds.length > 0;
  const firstVisible =
    tagState.visibleAccounts.length > 0
      ? tagState.visibleAccounts
      : showAllTag
        ? accounts.slice(0, MAX_VISIBLE_TAGS)
        : [];

  const placeholder = accounts.length === 0
    ? "No linked accounts"
    : showAllTag
      ? "All accounts"
      : hasSelection
        ? "Accounts selected"
        : "Select accounts";

  const isDisabled = accounts.length === 0;
  const handleToggle = () => {
    if (isDisabled) {
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelectAll = () => {
    onSelectedAccountsChange(["all"]);
    setIsOpen(false);
  };

  const handleAccountToggle = (accountId: string) => {
    const nextSet = new Set(normalizedSelectedIds);
    if (nextSet.has(accountId)) {
      nextSet.delete(accountId);
    } else {
      nextSet.add(accountId);
    }
    const isAllSelected = nextSet.size === accounts.length;
    const next =
      nextSet.size === 0 || isAllSelected
        ? ["all"]
        : Array.from(nextSet);
    onSelectedAccountsChange(next);
    if (isAllSelected) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const containerClasses = [
    "flex flex-wrap items-center justify-between gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-left text-[0.6rem] text-slate-700 shadow-sm transition",
    isDisabled ? "opacity-60" : "hover:border-slate-300",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative flex flex-col gap-0.5" ref={containerRef}>
      <div className="flex justify-between text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
        <span>Accounts</span>
        <button
          type="button"
          className="text-[0.5rem] font-semibold uppercase tracking-[0.25em] text-slate-400 transition hover:text-slate-700"
          onClick={handleSelectAll}
          disabled={isDisabled}
        >
          Show all
        </button>
      </div>
      <div className={containerClasses}>
        <div className="flex flex-wrap gap-0.5 text-[0.6rem]">
          {firstVisible.length === 0 && !showAllTag ? (
            <span className="text-[0.55rem] text-slate-400">{placeholder}</span>
          ) : showAllTag ? (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">
              All accounts
            </span>
          ) : (
            firstVisible.map((account) => (
              <span
                key={account.id}
                className="flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-700"
              >
                <span className="truncate">{account.name}</span>
                <span className="text-[0.55rem] text-slate-500">
                  {formatBalanceValue(account.currentBalance ?? account.availableBalance)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${account.name}`}
                  className="text-slate-400 hover:text-slate-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAccountToggle(account.id);
                  }}
                >
                  &times;
                </button>
              </span>
            ))
          )}
          {!showAllTag && tagState.overflowCount > 0 && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[0.55rem] text-slate-500">
              +{tagState.overflowCount} more
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label="Toggle account selection"
          aria-expanded={isOpen}
          className="text-[0.5rem] font-semibold uppercase tracking-[0.25em] text-slate-400 transition hover:text-slate-700 disabled:text-slate-300"
          onClick={handleToggle}
          disabled={isDisabled}
        >
          {isOpen ? "Close" : "Open"}
        </button>
      </div>
      {isOpen && accounts.length > 0 && (
        <div className="absolute left-0 z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white/95 shadow-lg shadow-slate-900/10">
          <div className="max-h-64 overflow-y-auto p-2 text-[0.75rem]">
            {accounts.map((account) => {
              const isSelected = normalizedSelectedIds.includes(account.id);
              return (
                <label
                  key={account.id}
                  className="flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-0.5 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    value={account.id}
                    data-testid={`account-checkbox-${account.id}`}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    checked={isSelected}
                    onChange={() => handleAccountToggle(account.id)}
                  />
                  <div className="flex flex-1 flex-col text-[0.7rem]">
                    <span className="font-semibold text-slate-900">
                      {account.name}
                    </span>
                    <span className="text-[0.6rem] text-slate-500">
                      {account.institutionName ?? "Plaid"} · {account.type}
                    </span>
                    <span className="text-[0.55rem] text-slate-500">
                      {formatBalanceValue(
                        account.currentBalance ?? account.availableBalance,
                      )}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
