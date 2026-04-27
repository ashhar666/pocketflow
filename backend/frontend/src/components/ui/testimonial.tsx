"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = true,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = React.useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [autoplay, handleNext]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 font-sans antialiased md:px-8">
      <div className="flex flex-col items-center text-center">
        {/* Text Section */}
        <div className="w-full min-h-[220px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <div className="space-y-4">
                <blockquote className="text-2xl md:text-4xl font-black text-white italic tracking-tighter leading-[0.9] max-w-3xl mx-auto uppercase">
                  &quot;{testimonials[active].quote}&quot;
                </blockquote>
                
                <div className="pt-8">
                  <h3 className="text-lg font-black text-emerald-500 uppercase tracking-widest italic">
                    {testimonials[active].name}
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                    {testimonials[active].designation}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls Section */}
        <div className="flex gap-10 pt-16 items-center">
          <button
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="group flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition-all italic"
          >
            <span>PREV</span>
            <div className="h-0.5 w-4 bg-emerald-500/20 group-hover:w-8 group-hover:bg-emerald-500 transition-all duration-500" />
          </button>
          
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                 key={i}
                 onClick={() => setActive(i)}
                 className={cn(
                   "size-1 rounded-full transition-all duration-500",
                   active === i ? "bg-emerald-500 scale-150" : "bg-white/10 hover:bg-white/20"
                 )}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next testimonial"
            className="group flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition-all italic"
          >
            <span>NEXT</span>
            <div className="h-0.5 w-4 bg-emerald-500/20 group-hover:w-8 group-hover:bg-emerald-500 transition-all duration-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
