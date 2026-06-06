"use client";

import "./globals.css";
import Link from "next/link";
import { Toaster } from "sonner";
import { Wallet, Github, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-[#f8fafc] overflow-x-hidden">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sacco flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-sacco/20">
                  <Wallet className="text-white w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="font-black text-xl sm:text-2xl tracking-tighter text-sacco-dark">
                  SaccoChain
                </span>
              </Link>
            </motion.div>
            
            <nav className="flex items-center">
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="https://github.com/Nuwahereza-eng/saccopool"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-slate-900 text-white text-sm sm:text-base font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 group"
                >
                  <Github className="w-5 h-5" />
                  <span className="hidden xs:block">GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              </motion.div>
            </nav>
          </div>
        </header>

        <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
              <div className="space-y-4 max-w-md">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sacco flex items-center justify-center shadow-md">
                    <Wallet className="text-white w-6 h-6" />
                  </div>
                  <span className="font-black text-2xl text-sacco-dark tracking-tighter">
                    SaccoChain
                  </span>
                </div>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  Empowering communities through transparent and trustless financial systems built on Stellar.
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12">
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 tracking-normal text-sm lowercase first-letter:uppercase">Platform</h4>
                  <ul className="space-y-3">
                    <li><Link href="/" className="text-slate-500 hover:text-sacco font-bold transition-colors text-sm">Home</Link></li>
                    <li><Link href="/dashboard" className="text-slate-500 hover:text-sacco font-bold transition-colors text-sm">Dashboard</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 tracking-normal text-sm lowercase first-letter:uppercase">Resources</h4>
                  <ul className="space-y-3">
                    <li><a href="https://github.com/Nuwahereza-eng/saccopool" className="text-slate-500 hover:text-sacco font-bold transition-colors text-sm">GitHub</a></li>
                    <li><a href="#" className="text-slate-500 hover:text-sacco font-bold transition-colors text-sm">Docs</a></li>
                  </ul>
                </div>
                <div className="space-y-4 col-span-2 sm:col-span-1">
                  <h4 className="font-black text-slate-900 tracking-normal text-sm lowercase first-letter:uppercase">Legal</h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-slate-500 hover:text-sacco font-bold transition-colors text-sm">Privacy</a></li>
                    <li><a href="#" className="text-slate-500 hover:text-sacco font-bold transition-colors text-sm">Terms</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-widest">
              <p>Built on Stellar Soroban</p>
              <p>© {new Date().getFullYear()} SaccoChain. All rights reserved.</p>
            </div>
          </div>
        </footer>

        <Toaster 
          position="bottom-right" 
          richColors 
          closeButton
          toastOptions={{
            duration: 3000,
            className: "rounded-2xl border-none shadow-2xl p-4 font-bold",
          }}
        />
      </body>
    </html>
  );
}
