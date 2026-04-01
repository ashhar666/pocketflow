import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tighter uppercase">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground font-medium">
          Last Updated: March {new Date().getDate()}, {new Date().getFullYear()}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold">1. Introduction</h2>
        <p className="leading-relaxed">
          Welcome to Expense Tracker (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to
          protecting your personal information and your right to privacy. This
          Privacy Policy explains how we collect, use, and safeguard your data
          when you use our Expense Tracker application.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold">2. Information We Collect</h2>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">User Data:</h3>
          <p>
            When you register, we collect your name, email address, and
            encrypted password.
          </p>
          <h3 className="text-lg font-semibold">Financial Data:</h3>
          <p>
            The core of our service involves you inputting your expenses,
            income, and categories. This data is stored securely and used
            only to provide you with insights and analytics.
          </p>
          <h3 className="text-lg font-semibold">Device Data:</h3>
          <p>
            We may collect information about the device you use to access our
            services, such as IP addresses and browser types.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold">3. How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed text-muted-foreground">
          <li>To provide and manage your account.</li>
          <li>To generate financial reports and visualizations (Analytics).</li>
          <li>To notify you about changes to our application.</li>
          <li>To provide customer support.</li>
          <li>To improve and optimize your experience.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold">4. Data Security</h2>
        <p className="leading-relaxed">
          Security is our top priority. Your financial data is encrypted in
          transit (SSL) and at rest. We use industry-standard security
          protocols to ensure your information remains confidential and
          protected from unauthorized access.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold">5. Third-Party Services</h2>
        <p className="leading-relaxed">
          We do not sell your personal or financial data to third parties. We
          may use trusted third-party services for analytics (e.g., Google
          Analytics) or for hosting (e.g., Vercel), but always in a way that
          safeguards your privacy.
        </p>
      </section>

      <section className="space-y-4 border-t pt-8">
        <h2 className="text-2xl font-display font-bold">Contact Us</h2>
        <p className="leading-relaxed">
          If you have any questions about this Privacy Policy, please contact
          us at:
          <br />
          <span className="font-bold text-foreground underline font-mono">
            support@expensetracker.com
          </span>
        </p>
      </section>
    </div>
  );
}
