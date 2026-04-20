"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export const Component = () => {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0, filter: 'blur(10px)' },
    visible: { 
      y: 0, 
      opacity: 1, 
      filter: 'blur(0px)',
      transition: { ease: [0.22, 1, 0.36, 1] as [number, number, number, number], duration: 0.8 }
    }
  }

  return (
    <footer className="bg-[#030303] pt-40 pb-12 px-6 relative overflow-hidden border-t border-white/5">
      {/* Mega Background Logo */}
      <div className="absolute inset-x-0 top-10 flex justify-center pointer-events-none select-none overflow-hidden h-[30vh]">
        <motion.span 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 0.03, y: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[25vw] font-black tracking-tighter text-white uppercase italic leading-none whitespace-nowrap"
        >
          POCKETFLOW
        </motion.span>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-20 lg:gap-8 mb-40">
          {/* Left Columns */}
          <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-2 gap-8 order-2 lg:order-1">
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Protocol</h4>
              <ul className="space-y-5">
                {['Dashboard', 'Analytics', 'Budgets', 'Savings'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="text-zinc-400 hover:text-white transition-all text-sm font-bold flex items-center group/link tracking-tight">
                      <span className="group-hover/link:translate-x-1 transition-transform duration-300">{item}</span>
                      <span className="ml-1 opacity-0 group-hover/link:opacity-100 transition-all duration-300 text-[10px] text-emerald-500 font-black italic">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Intelligence</h4>
              <ul className="space-y-5">
                {['Roadmap', 'Changelog', 'Status', 'Documentation'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-zinc-400 hover:text-white transition-all text-sm font-bold flex items-center group/link tracking-tight">
                      <span className="group-hover/link:translate-x-1 transition-transform duration-300">{item}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Centered Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col items-center justify-center space-y-8 order-1 lg:order-2 px-8 py-12 bg-white/[0.01] border border-white/5 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative group">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl -z-10 rounded-[3rem]" />
            <div className="size-20 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_-12px_rgba(255,255,255,0.4)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 overflow-hidden bg-white relative">
              <Image src="/logo.png" alt="PocketFlow Logo" fill className="object-cover" />
            </div>
            <div className="text-center space-y-4">
              <span className="block font-black text-2xl tracking-tighter text-white uppercase italic">PocketFlow</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 leading-tight">Elite Financial Instrument</p>
            </div>
          </motion.div>

          {/* Right Columns */}
          <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-2 gap-8 order-3">
            <div className="space-y-8 lg:pl-12">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Registry</h4>
              <ul className="space-y-5">
                {['Privacy', 'Service', 'Cookies', 'Security'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-zinc-400 hover:text-white transition-all text-sm font-bold flex items-center group/link tracking-tight">
                        <span className="group-hover/link:translate-x-1 transition-transform duration-300">{item}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Infrastructure</h4>
              <div className="flex flex-col gap-6">
                {[
                  { label: 'GitHub', code: 'HUB' },
                  { label: 'Network', code: 'NET' },
                  { label: 'Access', code: 'ACC' }
                ].map((social) => (
                  <Link key={social.label} href="#" className="text-zinc-500 hover:text-white transition-all flex items-center gap-3 group/soc">
                    <span className="text-[8px] font-black border border-white/10 px-1 py-0.5 rounded-sm opacity-50 group-hover/soc:opacity-100 group-hover/soc:border-emerald-500/50 group-hover/soc:text-emerald-500 transition-all">{social.code}</span>
                    <span className="text-[10px] font-black tracking-widest uppercase">{social.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* The Deep Scan Horizontal Separator */}
        <div className="h-px w-full bg-white/10 relative overflow-hidden group">
            <motion.div 
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 h-full w-40 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
        </div>

        {/* Bottom Bar: Systems Nominal Ticker */}
        <motion.div 
          variants={itemVariants}
          className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] text-emerald-500/80 font-black uppercase tracking-[0.2em] italic">Systems Nominal</span>
            </div>
            <div className="size-1 bg-zinc-800 rounded-full" />
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-none">
              Lat: 20.27 / Long: 85.34 / GMT+5:30
            </p>
          </div>

          <div className="flex items-center gap-12">
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">
              Built by Elite Digital Architects
            </p>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">© {currentYear}</span>
                <span className="text-[10px] text-white font-black uppercase tracking-widest italic">PocketFlow</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Extreme Bottom Noise/Glow Texture */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
    </footer>
  );
};
