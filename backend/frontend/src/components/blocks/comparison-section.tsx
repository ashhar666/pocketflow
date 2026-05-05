"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const COMPARISON_DATA = [
  {
    feature: "AI Receipt Scanning",
    pocketflow: true,
    ynab: false,
    rocketmoney: true,
    spendee: true,
    wallet: false,
  },
  {
    feature: "Telegram Integration",
    pocketflow: true,
    ynab: false,
    rocketmoney: false,
    spendee: false,
    wallet: false,
  },
  {
    feature: "Data Sovereignty",
    pocketflow: true,
    ynab: false,
    rocketmoney: false,
    spendee: false,
    wallet: false,
  },
  {
    feature: "Zero-Trust Privacy",
    pocketflow: true,
    ynab: false,
    rocketmoney: false,
    spendee: false,
    wallet: false,
  },
  {
    feature: "Multi-Currency Sync",
    pocketflow: true,
    ynab: true,
    rocketmoney: false,
    spendee: true,
    wallet: true,
  },
  {
    feature: "Free Tier Available",
    pocketflow: true,
    ynab: false,
    rocketmoney: true,
    spendee: true,
    wallet: true,
  },
];

export const ComparisonSection = () => {
  return (
    <section id="comparison" className="bg-black py-24 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white uppercase mb-4">
            The <span className="text-emerald-500">Choice</span> is Clear
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
            See how PocketFlow stacks up against the industry leaders in personal finance.
          </p>
        </div>

        <div className="overflow-x-auto border border-white/10 rounded-2xl bg-zinc-950/50 backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <caption className="sr-only">
              PocketFlow vs Competitors Comparison: YNAB, Rocket Money, Spendee, and Wallet by BudgetBakers.
            </caption>
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-6 px-8 text-sm font-bold uppercase tracking-widest text-zinc-500">Features</th>
                <th className="py-6 px-8 text-sm font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/5">PocketFlow</th>
                <th className="py-6 px-8 text-sm font-bold uppercase tracking-widest text-zinc-400">YNAB</th>
                <th className="py-6 px-8 text-sm font-bold uppercase tracking-widest text-zinc-400">Rocket Money</th>
                <th className="py-6 px-8 text-sm font-bold uppercase tracking-widest text-zinc-400">Spendee</th>
                <th className="py-6 px-8 text-sm font-bold uppercase tracking-widest text-zinc-400">Wallet</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((row, index) => (
                <tr 
                  key={index} 
                  className={cn(
                    "border-b border-white/5 transition-colors hover:bg-white/[0.02]",
                    index === COMPARISON_DATA.length - 1 && "border-none"
                  )}
                >
                  <td className="py-6 px-8 font-medium text-white">{row.feature}</td>
                  <td className="py-6 px-8 bg-emerald-500/5 text-center">
                    {row.pocketflow ? <Check className="mx-auto text-emerald-500 size-5" /> : <X className="mx-auto text-zinc-800 size-5" />}
                  </td>
                  <td className="py-6 px-8 text-center">
                    {row.ynab ? <Check className="mx-auto text-zinc-500 size-5" /> : <X className="mx-auto text-zinc-800 size-5" />}
                  </td>
                  <td className="py-6 px-8 text-center">
                    {row.rocketmoney ? <Check className="mx-auto text-zinc-500 size-5" /> : <X className="mx-auto text-zinc-800 size-5" />}
                  </td>
                  <td className="py-6 px-8 text-center">
                    {row.spendee ? <Check className="mx-auto text-zinc-500 size-5" /> : <X className="mx-auto text-zinc-800 size-5" />}
                  </td>
                  <td className="py-6 px-8 text-center">
                    {row.wallet ? <Check className="mx-auto text-zinc-500 size-5" /> : <X className="mx-auto text-zinc-800 size-5" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-600 text-sm italic">
            * Comparison based on public feature availability as of May 2026.
          </p>
        </div>
      </div>
    </section>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
