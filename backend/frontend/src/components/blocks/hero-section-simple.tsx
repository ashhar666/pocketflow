"use client"

import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-24 md:py-32 lg:py-48">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 -z-10 h-full w-full">
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-600/5 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center rounded-full border border-emerald-500/10 bg-emerald-500/5 px-3 py-1 text-xs font-black uppercase italic tracking-widest text-emerald-500"
          >
            <span className="mr-2 border border-emerald-500/20 px-1 rounded-sm">NEW</span>
            <span>Intelligence v2.0 Release</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 text-5xl font-black uppercase italic leading-[0.85] tracking-[-0.08em] md:text-7xl lg:text-9xl"
          >
            Autonomous <br className="hidden md:block" />
            <span className="text-emerald-500">Wealth</span> Control
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12 max-w-[60ch] text-sm uppercase tracking-[0.2em] font-medium text-zinc-500 md:text-base leading-relaxed"
          >
            A high-density financial infrastructure for systematic capital tracking, 
            automated distribution, and strategic accumulation. No fluff. Just data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Initialize Account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Existing Citizen →
              </Button>
            </Link>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 gap-8 border-t border-black/5 dark:border-white/5 pt-12 sm:grid-cols-4"
          >
            {[
              { label: "Active Nodes", value: "12K+" },
              { label: "Assets Traced", value: "$4.2B" },
              { label: "System Uptime", value: "99.9%" },
              { label: "Response Latency", value: "40ms" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-black italic tracking-tighter md:text-2xl">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
