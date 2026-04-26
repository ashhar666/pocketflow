import type { Metadata } from "next";
import { Component as TapedFooter } from "@/components/ui/footer-taped-design";

export const metadata: Metadata = {
  title: "Footer Demo",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemoOne() {
  return (
    <main className="w-full min-h-screen mx-auto bg-base-100 flex flex-col justify-end">
      <div className="flex-1 flex items-center justify-center p-8">
        <h1 className="text-4xl font-display font-bold text-neutral">Taped Footer Demo</h1>
      </div>
      <TapedFooter />
    </main>
  );
}
