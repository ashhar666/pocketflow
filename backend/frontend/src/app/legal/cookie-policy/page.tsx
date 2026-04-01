import React from "react";

export default function CookiePolicyPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase-headers">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tighter uppercase">
          Cookie Policy
        </h1>
        <p className="text-muted-foreground font-medium">
          Last Updated: March {new Date().getDate()}, {new Date().getFullYear()}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
          1. What Are Cookies?
        </h2>
        <p className="leading-relaxed">
          Cookies are small text files placed on your device to store data that
          can be recalled by a web server. This data helps us provide a better
          experience for you as you use our application.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
          2. How We Use Cookies
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <h3 className="text-lg font-semibold text-foreground uppercase tracking-tight">Essential Cookies:</h3>
          <p>
            These are necessary for the application to function, such as
            managing your login session and security.
          </p>
          <h3 className="text-lg font-semibold text-foreground uppercase tracking-tight">Performance Cookies:</h3>
          <p>
            These allow us to count visits and traffic sources so we can measure
            and improve the performance of our site.
          </p>
          <h3 className="text-lg font-semibold text-foreground uppercase tracking-tight">Functional Cookies:</h3>
          <p>
            These enable the application to provide enhanced functionality and
            personalization, such as remembering your preferences.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
          3. Managing Cookies
        </h2>
        <p className="leading-relaxed">
          You can choose to disable cookies through your individual browser
          options. However, please note that disabling certain cookies may
          affect the functionality of Expense Tracker.
        </p>
      </section>

      <section className="space-y-4 border-t pt-8">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
          Consent
        </h2>
        <p className="leading-relaxed text-sm italic text-muted-foreground">
          By using our website and application, you hereby consent to our
          Cookie Policy and agree to its terms.
        </p>
      </section>
    </div>
  );
}
