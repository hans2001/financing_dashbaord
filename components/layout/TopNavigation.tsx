"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

type NavigationLink = {
  href: string;
  label: string;
  exact?: boolean;
};

const navigationLinks: NavigationLink[] = [
  { href: "/dashboard", label: "Dashboard", exact: true },
];

const navFontFamily =
  "var(--font-geist-mono), var(--font-geist-sans), 'Space Grotesk', 'Inter', system-ui, sans-serif";

const LogoMark = () => (
  <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-slate-100 via-primary/20 to-primary/10 shadow-sm shadow-primary/30">
    <span className="flex h-6 w-6 items-center justify-center rounded-[14px] bg-white text-[0.65rem] leading-none font-semibold uppercase tracking-[0.35em] text-primary">
      PF
    </span>
  </span>
);

export function TopNavigation() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="border-b border-slate-200 bg-white/90 shadow-sm shadow-slate-900/5 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold text-slate-900"
        >
          <LogoMark />
          <span className="text-base leading-tight">Finance Dashboard</span>
        </Link>
        <nav
          className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em]"
          style={{ fontFamily: navFontFamily }}
        >
          {navigationLinks.map((link) => {
            const normalizedPath =
              pathname.endsWith("/") && pathname !== "/"
                ? pathname.slice(0, -1)
                : pathname;
            const normalizedHref =
              link.href.endsWith("/") && link.href !== "/"
                ? link.href.slice(0, -1)
                : link.href;
            const isActive = link.exact
              ? normalizedPath === normalizedHref
              : normalizedPath === normalizedHref ||
                normalizedPath.startsWith(`${normalizedHref}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors text-[0.65rem] tracking-[0.4em]",
                  isActive
                    ? "bg-slate-900/5 text-slate-900"
                    : "text-slate-500 hover:text-slate-900",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <LogoutButton className="px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.35em]" />
        </nav>
      </div>
    </header>
  );
}
