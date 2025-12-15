import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";
import { TopNavigation } from "@/components/layout/TopNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Personal Finance Dashboard",
    template: "%s | Personal Finance Dashboard",
  },
  description:
    "Connect Plaid production accounts, sync transactions, and view spending insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <TopNavigation />
            <div className="flex-1">{children}</div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
