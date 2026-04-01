import React from 'react'
import { 
  ShieldCheck, 
  BarChart3, 
  Target, 
  Wallet, 
  Zap,
  TrendingUp,
  Fingerprint
} from 'lucide-react'
import { StickyScroll } from '@/components/ui/sticky-scroll'

const content = [
  {
    title: "Elite Budgeting",
    description: "The most sophisticated expenditure engine ever conceived. Rule your cashflow with algorithmic precision and a zero-latency interface designed for performance.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white p-8">
        <Wallet className="size-24" />
      </div>
    ),
  },
  {
    title: "Legacy Goals",
    description: "Multi-generational wealth tracking. Define your milestones and let our prediction engine calculate the exact velocity required to reach them.",
    content: (
      <div className="h-full w-full  flex items-center justify-center text-white p-8 bg-[linear-gradient(to_bottom_right,var(--blue-500),var(--violet-500))]">
         <Target className="size-24" />
      </div>
    ),
  },
  {
    title: "Zero-Knowledge Privacy",
    description: "Your financial fingerprints stay yours. Military-grade encryption ensures that your legacy is secured behind a fortress of mathematical certainty.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white p-8">
        <Fingerprint className="size-24" />
      </div>
    ),
  },
  {
    title: "Predictive Analytics",
    description: "See the future before it settles. Our visual insights transform raw chaos into actionable strategies for wealth expansion.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--purple-500),var(--pink-500))] flex items-center justify-center text-white p-8">
        <BarChart3 className="size-24" />
      </div>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="pt-32 pb-0 bg-[#030303] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-8 uppercase italic">
                World-Class <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">Instruments</span>
            </h2>
            <p className="mt-4 text-xl text-zinc-500 max-w-2xl mx-auto font-medium">
                Engineered for the elite. A suite of tools designed to manage high-velocity capital with absolute clarity.
            </p>
        </div>

        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] overflow-hidden">
            <StickyScroll content={content} />
        </div>
      </div>
      
      {/* Subtle Depth */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[160px] -z-10" />
    </section>
  )
}
