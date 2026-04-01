"use client"

import React from "react"
import { ContainerScroll, CardSticky } from "@/components/ui/cards-stack"

const ACHIEVEMENTS = [
  {
    id: "achivement-1",
    title: "₹50k+",
    description: "Average Annual Savings per User",
    bg: "rgb(16, 185, 129)", // Emerald 500
  },
  {
    id: "achivement-2",
    title: "1M+",
    description: "Transactions Logged Securely",
    bg: "rgb(59, 130, 246)", // Blue 500
  },
  {
    id: "achivement-3",
    title: "100+",
    description: "Financial Institutions Supported",
    bg: "rgb(245, 158, 11)", // Amber 500
  },
  {
    id: "achivement-4",
    title: "4.9/5",
    description: "User Satisfaction Rating",
    bg: "rgb(139, 92, 246)", // Violet 500
  },
]

export const AchievementsSection = () => {
  return (
    <section id="achievements" className="bg-zinc-950 py-24">
       <div className="text-center mb-16 px-6">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Real Impact & <span className="text-indigo-500 underline decoration-indigo-500/20">Global Recognition</span>
        </h2>
      </div>
      
      <ContainerScroll className="min-h-[400vh] place-items-center space-y-8 p-12 text-center text-zinc-50">
        {ACHIEVEMENTS.map((achievement, index) => (
          <CardSticky
            key={achievement.id}
            incrementY={40}
            index={index + 2}
            className="flex h-80 w-full max-w-[440px] flex-col place-content-center justify-evenly rounded-3xl border border-white/10 p-12 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02]"
            style={{ rotate: index + 2, background: achievement.bg }}
          >
            <h1 className="text-left text-7xl font-bold opacity-90 drop-shadow-md">
              {achievement.title}
            </h1>
            <div className="place-items-end text-right">
              <h3 className="max-w-[12ch] text-wrap text-4xl font-bold capitalize tracking-tighter leading-tight italic">
                {achievement.description}
              </h3>
            </div>
          </CardSticky>
        ))}
      </ContainerScroll>
    </section>
  )
}
