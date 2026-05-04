"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedTestimonials } from '@/components/ui/testimonial';

const testimonials = [
  {
    quote: "The receipt scanner is amazing. It captured a messy receipt from a small cafe perfectly. It is the best one I have ever used.",
    name: "Alex V.",
    designation: "Uses it every day"
  },
  {
    quote: "Telegram makes tracking my money so easy. I just send a quick text note and everything is updated in my app instantly.",
    name: "Sarah L.",
    designation: "Shop owner"
  },
  {
    quote: "Finally, a dashboard that is fast and simple to use. It is built for people who want to manage their money without any stress.",
    name: "Marcus T.",
    designation: "Smart saver"
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="relative py-16 bg-[#030303] overflow-hidden border-t border-white/5">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[140px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 text-emerald-500 mb-6"
          >
            <span className="text-[10px] font-black italic">[MSG]</span>
            <span className="text-xs font-black uppercase tracking-[0.4em] italic">What people think</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase italic"
          >
            User <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">reviews</span>
          </motion.h2>
        </div>

        {/* Animated Testimonial Component */}
        <div className="relative">
          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
        </div>
      </div>
    </section>
  );
};
