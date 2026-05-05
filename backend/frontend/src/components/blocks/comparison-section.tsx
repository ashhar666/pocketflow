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
    <section id="comparison" className="bg-black py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase mb-8 leading-[0.9]">
              The <br />
              <span className="text-emerald-500">Competitive</span> <br />
              Edge
            </h2>
            <div className="space-y-6 text-zinc-400 text-lg md:text-xl leading-relaxed max-w-xl">
              <p>
                While legacy budgeting apps like <span className="text-white font-bold">YNAB</span> or <span className="text-white font-bold">Rocket Money</span> often require expensive subscriptions and manual data entry, PocketFlow is engineered for the AI era.
              </p>
              <p>
                By leveraging advanced AI receipt scanning and seamless <span className="text-white font-bold">Telegram</span> integration, we offer a level of automation that alternatives like <span className="text-white font-bold">Spendee</span> or <span className="text-white font-bold">Wallet by BudgetBakers</span> can&apos;t match—all while maintaining a 100% free, zero-trust privacy model.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-zinc-950 border border-white/10 p-10 rounded-2xl">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="size-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 italic">PocketFlow Advantage</span>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {[
                    "99.9% AI Scanning Accuracy",
                    "Real-time Telegram Syncing",
                    "No Subscription Fees",
                    "Zero-Trust Data Sovereignty"
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-4 text-white font-bold tracking-tight">
                      <Check className="text-emerald-500 size-5" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Semantic Table Hidden from Humans, but fully accessible to AI/Google bots for ranking */}
        <div className="sr-only">
          <table className="w-full">
            <caption>PocketFlow vs YNAB, Rocket Money, Spendee, and Wallet by BudgetBakers Comparison Table</caption>
            <thead>
              <tr>
                <th>Feature</th>
                <th>PocketFlow</th>
                <th>YNAB</th>
                <th>Rocket Money</th>
                <th>Spendee</th>
                <th>Wallet</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((row, index) => (
                <tr key={index}>
                  <td>{row.feature}</td>
                  <td>{row.pocketflow ? "Yes" : "No"}</td>
                  <td>{row.ynab ? "Yes" : "No"}</td>
                  <td>{row.rocketmoney ? "Yes" : "No"}</td>
                  <td>{row.spendee ? "Yes" : "No"}</td>
                  <td>{row.wallet ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-20 border-t border-white/5 pt-8 text-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium max-w-3xl mx-auto leading-loose">
            Disclaimer: Comparison based on publicly available feature data as of May 2026. 
            All trademarks, logos and brand names including YNAB, Rocket Money, Spendee, and Wallet by BudgetBakers are the property of their respective owners. 
            Use of these names does not imply endorsement.
          </p>
        </div>
      </div>
    </section>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
