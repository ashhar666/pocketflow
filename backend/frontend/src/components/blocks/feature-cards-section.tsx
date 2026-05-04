"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  AnimatedCard, 
  Heading, 
  Metric, 
  Paragraph 
} from '@/components/ui/animated-pricing-cards'

const features = [
  {
    title: "Smart AI",
    value: "99.9%",
    label: "accurate",
    description: "Scan any receipt. Our AI reads it and groups it automatically.",
    type: "crosses" as const,
    color: "bg-emerald-600"
  },
  {
    title: "Telegram App",
    value: "Instant",
    label: "sync",
    description: "Send a text or voice note to our Telegram bot to save an expense instantly.",
    type: "crosses" as const,
    color: "bg-blue-600"
  },
  {
    title: "Use Anywhere",
    value: "Realtime",
    label: "update",
    description: "See your money on your phone or computer. Everything stays in sync.",
    type: "crosses" as const,
    color: "bg-purple-600"
  }
]

export function FeatureCardsSection() {
  return (
    <section id="features" className="py-16 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-tight mb-6"
          >
            What <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20 text-glow">you get</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-zinc-500 max-w-2xl mx-auto font-medium"
          >
            Smart tools to help you track money and save more.
          </motion.p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-full max-w-sm"
            >
              <AnimatedCard 
                type={feature.type} 
                className={feature.color}
              >
                <Heading>{feature.title}</Heading>
                <Metric 
                  value={feature.value} 
                  label={feature.label} 
                />
                <Paragraph>
                  {feature.description}
                </Paragraph>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[160px] -z-10" />
    </section>
  )
}
