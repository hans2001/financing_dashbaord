"use client";

import type { ButtonHTMLAttributes } from "react";
import { signOut } from "next-auth/react";

type LogoutButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function LogoutButton({ className = "", ...props }: LogoutButtonProps) {
  return (
    <button
      type="button"
      className={`rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-900/5 transition hover:bg-slate-50 ${className}`}
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      {...props}
    >
      Sign out
    </button>
  );
}
