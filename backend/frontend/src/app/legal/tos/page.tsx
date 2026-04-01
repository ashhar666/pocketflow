import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tighter uppercase">
          Terms of Service
        </h1>
        <p className="text-muted-foreground font-medium">
          Last Updated: March {new Date().getDate()}, {new Date() .getFullYear()}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
          1. Acceptance of Terms
        </h2>
        <p className="leading-relaxed">
          By accessing or using the Expense Tracker application, you agree to
          be bound by these Terms of Service. If you do not agree to all terms,
          please do not use our services.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
          2. Account Registration
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          To use our application, you must create an account. You agree to
          provide accurate information and maintain the security of your
          account credentials. You are responsible for all activities that
          occur under your account.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
          3. Subscriptions & Payments
        </h2>
        <p className="leading-relaxed">
          While we offer a free tier, certain premium features require
          subscriptions. You agree to the billing plan you select and
          acknowledge that payments are non-refundable unless specified
          otherwise.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
          4. Acceptable Use
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          You agree not to use Expense Tracker for any illegal purposes or to
          interfere with the application&apos;s performance. Financial data you
          input must be your own or data you have the legal right to manage.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-destructive">
          5. Limitation of Liability
        </h2>
        <div className="bg-destructive/10 border-l-4 border-destructive p-4 italic text-sm text-foreground space-y-2">
            <p>Expense Tracker provides financial tracking and visualization tools, but we ARE NOT financial advisors. We do not provide investment, accounting, or legal advice.</p>
            <p>We are not liable for any financial losses or damages resulting from the use of our services or reliance on the analytics generated.</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
          6. Modifications to Service
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          We reserve the right to modify or discontinue our services at any
          time with or without notice. We will not be liable to you or any
          third party for any modifications or suspensions.
        </p>
      </section>

      <section className="space-y-4 border-t pt-8">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
          Contact Support
        </h2>
        <p className="leading-relaxed">
          If you have any questions about these Terms, please contact us at:
          <br />
          <span className="font-bold text-foreground underline font-mono">
            legal@expensetracker.com
          </span>
        </p>
      </section>
    </div>
  );
}
