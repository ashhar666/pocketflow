"use client"

import { motion, useReducedMotion } from 'framer-motion'
import { ContainerScroll, CardSticky } from "@/components/ui/cards-stack"

const PROCESS_PHASES = [
  {
    id: "process-1",
    title: "Account Setup",
    description:
      "Join the elite community by creating a secure account. Configure your profile with bank-level encryption and custom currency preferences.",
  },
  {
    id: "process-2",
    title: "Expense Protocol",
    description:
      "Effortlessly log every transaction. Our zero-latency engine categorizes spending instantly, giving you a real-time view of your capital dispersion.",
  },
  {
    id: "process-3",
    title: "Budget Mastery",
    description:
      "Take command by setting intelligent budget limits. Receive instant alerts as you approach thresholds, preventing unauthorized capital leaks.",
  },
  {
    id: "process-4",
    title: "Savings Velocity",
    description:
      "Accelerate your journey to legacy. Create dedicated growth milestones and track your progress with high-precision instruments.",
  },
  {
    id: "process-5",
    title: "Wealth Insights",
    description:
      "Unlock deep data visualizations. Our automated reports transform raw financial data into actionable strategies for true freedom.",
  },
]

export const ProcessSection = () => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div id="process" className="container min-h-svh place-content-center bg-[#030303] px-6 text-white xl:px-12 py-32 relative overflow-hidden">
      {/* Decorative Aurora Blob */}
      <div className="aurora-bg !opacity-10 dark:!opacity-20">
        <div className="aurora-blob w-[800px] h-[800px] bg-indigo-600/20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="grid md:grid-cols-2 md:gap-8 xl:gap-12 relative z-10">
        <div className="left-0 top-0 md:sticky md:h-svh md:py-12 flex flex-col justify-center">
          <motion.h5 
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 mb-6 italic"
          >
            Engineering Progress
          </motion.h5>
          <motion.h2 
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-5xl lg:text-[5.5rem] font-black tracking-tighter uppercase italic leading-none"
          >
            Absolute <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">Wealth Control</span>
          </motion.h2>
          <motion.p 
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-prose text-lg text-zinc-500 leading-relaxed font-medium"
          >
            A systematic architecture ensures every asset is accounted for. Guide your capital 
            from inception to legacy with mathematical clarity.
          </motion.p>
        </div>
        <ContainerScroll className="min-h-[400vh] space-y-12 py-12">
          {PROCESS_PHASES.map((phase, index) => (
            <CardSticky
              key={phase.id}
              index={index + 1}
              incrementY={shouldReduceMotion ? 0 : 60}
              incrementZ={shouldReduceMotion ? 0 : 10}
              className="glass-card p-12 md:p-16 hover:bg-white/[0.04] transition-colors duration-500"
            >
              <div className="flex items-center justify-between gap-4 mb-8 text-white">
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                  {phase.title}
                </h2>
                <h3 className="text-4xl font-black text-white/10">
                  {String(index + 1).padStart(2, "0")}
                </h3>
              </div>

              <p className="text-zinc-500 text-lg leading-relaxed font-medium">{phase.description}</p>
            </CardSticky>
          ))}
        </ContainerScroll>
      </div>
    </div>
  )
}
