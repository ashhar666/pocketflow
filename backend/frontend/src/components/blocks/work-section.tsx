"use client"

import React from 'react'
import { ContainerScroll, CardSticky } from "@/components/ui/cards-stack"

const WORK_PROJECTS = [
  {
    id: "work-project-3",
    title: "YCF DEV",
    services: ["Portfolio", "Partnership", "UI UX Design"],
  },
  {
    id: "work-project-1",
    title: "Stridath Ecommerce",
    services: ["E-Commerce", "Branding", "UI UX Design", "Development"],
  },
  {
    id: "work-project-2",
    title: "Marketing Agency",
    services: ["Partnership", "UI UX Design", "Development"],
  },
]

export const WorkSection = () => {
  return (
    <div id="work" className="container min-h-svh place-content-center bg-slate-900 px-6 py-24 text-stone-50">
      <div className="text-center mb-16">
        <h5 className="text-xs uppercase tracking-wide opacity-70">latest projects</h5>
        <h2 className="mb-4 mt-2 text-4xl lg:text-5xl font-bold tracking-tight">
          Get a glimpse of <span className="text-indigo-500 underline decoration-indigo-500/20">our work</span>
        </h2>
        <p className="mx-auto max-w-prose text-lg text-stone-300">
          From ecommerce to startup landing pages and single/multi page websites,
          building fully responsive and functional websites that showcase your
          product and your unique identity.
        </p>
      </div>
      
      <ContainerScroll className="min-h-[400vh] py-12 max-w-4xl mx-auto space-y-12">
        {WORK_PROJECTS.map((project, index) => (
          <CardSticky
            key={project.id}
            index={index}
            className="w-full overflow-hidden rounded-2xl border border-white/10 bg-indigo-950 p-0 shadow-2xl"
            incrementY={60}
            incrementZ={10}
          >
            <div className="p-8 md:p-12">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h2 className="text-3xl font-bold tracking-tighter">
                  {project.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.services.map((service) => (
                    <div
                      key={service}
                      className="rounded-full bg-indigo-900/50 border border-indigo-500/30 px-3 py-1 text-xs font-medium tracking-tight text-indigo-200"
                    >
                      {service}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* No images per user request - using a styled placeholder instead */}
              <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-indigo-800 to-indigo-950 flex items-center justify-center border border-white/5 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-grid-white/5 mask-fade-out" />
                 <h3 className="text-4xl font-bold tracking-tighter opacity-10 uppercase italic">
                    {project.title}
                 </h3>
              </div>
            </div>
          </CardSticky>
        ))}
      </ContainerScroll>
    </div>
  )
}
