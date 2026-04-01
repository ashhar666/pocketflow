import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border mt-20 pt-16 pb-8 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Top CTA Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8 p-8 md:p-12 bg-muted/30 rounded-3xl border border-border/50">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
              Ready to take control of your finances?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of users who are growing their wealth today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full px-8 border-border hover:bg-accent text-foreground font-semibold">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Product</h3>
            <Link href="/" className="text-base font-medium hover:text-primary transition-colors">Home</Link>
            <Link href="#" className="text-base font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#" className="text-base font-medium hover:text-primary transition-colors">Pricing</Link>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Dashboard</h3>
            <Link href="/dashboard" className="text-base font-medium hover:text-primary transition-colors">Overview</Link>
            <Link href="/expenses" className="text-base font-medium hover:text-primary transition-colors">Expenses</Link>
            <Link href="/budgets" className="text-base font-medium hover:text-primary transition-colors">Budgets</Link>
            <Link href="/savings" className="text-base font-medium hover:text-primary transition-colors">Savings Goals</Link>
            <Link href="/categories" className="text-base font-medium hover:text-primary transition-colors">Categories</Link>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Account</h3>
            <Link href="/settings" className="text-base font-medium hover:text-primary transition-colors">Settings</Link>
            <Link href="/login" className="text-base font-medium hover:text-primary transition-colors">Login</Link>
            <Link href="/register" className="text-base font-medium hover:text-primary transition-colors">Register</Link>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Legal</h3>
            <Link href="#" className="text-base font-medium hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-base font-medium hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>

        {/* Hero Title Section */}
        <div className="w-full text-center py-20 overflow-hidden select-none border-t border-border/50">
          <div className="flex flex-col items-center justify-center leading-[0.75]">
            <span className="text-[22vw] md:text-[20vw] font-black tracking-tighter text-foreground uppercase opacity-10">
              Expense
            </span>
            <span className="text-[22vw] md:text-[20vw] font-black tracking-tighter text-foreground uppercase opacity-10">
              Tracker
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Expense Tracker</span>
            <span className="text-xs text-muted-foreground">© 2026. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Github</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Discord</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
