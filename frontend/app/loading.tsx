"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className="w-12 h-12 text-sacco" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="text-slate-500 font-medium"
      >
        Loading SaccoChain...
      </motion.p>
    </div>
  );
}
