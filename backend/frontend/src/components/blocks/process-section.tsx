"use client"

import React from 'react'
import { ContainerScroll, CardSticky } from "@/components/ui/cards-stack"

const PROCESS_PHASES = [
  {
    id: "process-1",
    title: "Account Setup",
    description:
      "Join the community by creating a secure account. Set your currency preferences (₹) and configure your profile to start your wealth journey with bank-level encryption.",
  },
  {
    id: "process-2",
    title: "Expense Tracking",
    description:
      "Effortlessly log your daily spending. Categorize transactions instantly to see exactly where your money goes. No more manual spreadsheets—just real-time tracking.",
  },
  {
    id: "process-3",
    title: "Budget Mastery",
    description:
      "Take control by setting smart budget limits for groceries, entertainment, and more. Receive notifications as you approach your limits to prevent overspending before it happens.",
  },
  {
    id: "process-4",
    title: "Savings Goals",
    description:
      "Define your dreams. Whether it's a new car, a home, or retirement, create dedicated savings buckets and watch your progress grow as you consistently hit your targets.",
  },
  {
    id: "process-5",
    title: "Wealth Reports",
    description:
      "Unlock deep insights with automated financial reports. Our beautiful charts help you identify long-term trends and optimize your path to true financial freedom.",
  },
]

export const ProcessSection = () => {
  return (
    <div id="process" className="container min-h-svh place-content-center bg-[#030303] px-6 text-white xl:px-12 py-32">
      <div className="grid md:grid-cols-2 md:gap-8 xl:gap-12 relative">
        <div className="left-0 top-0 md:sticky md:h-svh md:py-12 flex flex-col justify-center">
          <h5 className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 mb-6 italic">Engineering Progress</h5>
          <h2 className="mb-8 text-5xl lg:text-[5.5rem] font-black tracking-tighter uppercase italic leading-none">
            Absolute <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">Wealth Control</span>
          </h2>
          <p className="max-w-prose text-lg text-zinc-500 leading-relaxed font-medium">
            A systematic architecture ensures every asset is accounted for. Guide your capital 
            from inception to legacy with mathematical clarity.
          </p>
        </div>
        <ContainerScroll className="min-h-[400vh] space-y-12 py-12">
          {PROCESS_PHASES.map((phase, index) => (
            <CardSticky
              key={phase.id}
              index={index + 1}
              incrementY={60}
              incrementZ={10}
              className="rounded-[2.5rem] border border-white/5 p-12 md:p-16 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] backdrop-blur-3xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-500"
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
