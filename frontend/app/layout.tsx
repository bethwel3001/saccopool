import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SaccoChain — Transparent SACCOs on Stellar",
  description:
    "On-chain micro-lending pool for African SACCOs. Deposit USDC, earn yield, borrow against your contribution — all on Stellar Soroban.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-block w-8 h-8 rounded-full bg-sacco" />
              <span className="font-bold text-lg text-sacco-dark">
                SaccoChain
              </span>
            </Link>
            <nav className="flex gap-4 text-sm font-medium">
              <Link href="/" className="hover:text-sacco">
                Home
              </Link>
              <Link href="/dashboard" className="hover:text-sacco">
                Dashboard
              </Link>
              <a
                href="https://github.com/blend-capital/blend-contracts-v2"
                target="_blank"
                rel="noreferrer"
                className="hover:text-sacco"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        <footer className="max-w-5xl mx-auto px-6 py-8 text-xs text-slate-500">
          Built on Stellar Soroban · Forked from Blend Protocol v2 · GDG UTAMU,
          Stellar GIVE Impact Bootcamp 2026
        </footer>
      </body>
    </html>
  );
}
