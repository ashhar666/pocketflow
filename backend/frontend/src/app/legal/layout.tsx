import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal",
  description: "PocketFlow legal documents — Terms of Service, Privacy Policy, and Cookie Policy.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-indigo-500/30">
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all group italic"
          >
            <span className="group-hover:-translate-x-1 transition-transform">[BACK]</span>
            Home
          </Link>
          <div className="text-sm font-black uppercase tracking-tighter">
            PocketFlow
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          {children}
        </div>
        <footer className="mt-24 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PocketFlow. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
