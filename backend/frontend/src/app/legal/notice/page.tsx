import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Notice | PocketFlow",
  description: "Official legal information and contact details for PocketFlow.",
};

export default function LegalNoticePage() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Legal Notice</h1>
        <p className="text-muted-foreground">Information according to statutory requirements.</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-tight">Operator Information</h2>
        <div className="space-y-2 text-zinc-400">
          <p className="font-bold text-foreground">PocketFlow Studio</p>
          <p>Kerala, India</p>
          <p>Email: pocketflow.app@gmail.com</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-tight">Responsible for Content</h2>
        <div className="space-y-2 text-zinc-400">
          <p>Ashhar Shahan</p>
          <p>PocketFlow Lead Developer</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-tight">Disclaimer</h2>
        <div className="space-y-4 text-zinc-400 leading-relaxed">
          <p>
            The contents of our pages were created with great care. However, we cannot guarantee the accuracy, completeness, or timeliness of the content. As a service provider, we are responsible for our own content on these pages in accordance with general laws.
          </p>
          <p>
            Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-tight">Copyright</h2>
        <p className="text-zinc-400 leading-relaxed">
          The content and works created by the site operators on these pages are subject to copyright law. The reproduction, processing, distribution, and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.
        </p>
      </section>
    </div>
  );
}
