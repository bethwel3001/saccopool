"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="relative">
          <div className="w-32 h-32 bg-sacco/10 rounded-full flex items-center justify-center mx-auto">
            <FileQuestion className="w-16 h-16 text-sacco" />
          </div>
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              y: [0, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4,
              ease: "easeInOut"
            }}
            className="absolute -top-2 -right-2 w-12 h-12 bg-sacco-accent rounded-2xl flex items-center justify-center shadow-lg text-sacco-dark font-bold text-xl"
          >
            404
          </motion.div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            Oops! It looks like you've wandered into uncharted territory. 
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="btn-primary flex items-center gap-2 px-8 py-3"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center gap-2 px-8 py-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-10 -z-10 w-64 h-64 bg-sacco/5 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-1/4 right-10 -z-10 w-64 h-64 bg-sacco-accent/5 rounded-full blur-3xl opacity-50" />
    </div>
  );
}
