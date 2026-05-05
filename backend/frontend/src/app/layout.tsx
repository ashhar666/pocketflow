import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientProviders from "./providers";
import FooterVisibility from "./FooterVisibility";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://www.pocket-flow.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PocketFlow | AI Expense Tracker & Money Manager",
    template: "%s | PocketFlow"
  },
  description: "Dominating personal finance with AI receipt scanning, real-time budgeting, and automated expense tracking. PocketFlow is the smartest free tool to manage your money.",
  keywords: ["free expense tracker", "AI receipt scanner", "budget tracker", "personal finance", "PocketFlow", "money manager", "YNAB alternative", "Rocket Money alternative"],
  authors: [{ name: "PocketFlow Team", url: SITE_URL }],
  creator: "PocketFlow",
  publisher: "PocketFlow",
  robots: { index: true, follow: true },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "PocketFlow",
    title: "PocketFlow | AI Expense Tracker & Smart Budgeting",
    description: "Track expenses effortlessly with AI. Automated receipt scanning, Telegram integration, and real-time financial insights.",
    images: [{ 
      url: "/og-image.png", 
      width: 1200, 
      height: 630, 
      alt: "PocketFlow AI Expense Tracker — Dashboard Overview" 
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PocketFlow | AI Expense Tracker & Smart Budgeting",
    description: "The smartest way to track your money. AI receipt scanning and automated budgeting for everyone.",
    images: ["/og-image.png"],
    creator: "@PocketFlowApp"
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "htrkUcdZSJHwdISooLS64FLe_GtyRZHHPL3mnk5Km8s",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PocketFlow",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web, iOS, Android",
  url: SITE_URL,
  description: "Advanced AI-powered expense tracking and budget management system with real-time Telegram integration. The smartest free tool for personal finance management.",
  softwareVersion: "1.4.0",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "AI Receipt Scanner",
    "Expense Tracking",
    "Budget Management",
    "Savings Goals",
    "Telegram Bot Integration",
    "Financial Reports",
    "Multi-currency Support"
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I log expenses with the Telegram bot?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Connect your account to @PaisaTrackerBot and send a text or receipt photo. The AI automatically parses the data and syncs it to your dashboard in real-time."
      }
    },
    {
      "@type": "Question",
      name: "Is my financial data secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PocketFlow uses bank-grade AES-256 encryption. We ensure your data is secure, private, and accessible only by you through our zero-trust architecture."
      }
    }
  ]
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PocketFlow",
  "url": SITE_URL,
  "logo": `${SITE_URL}/icon.png`,
  "sameAs": [
    "https://twitter.com/PocketFlowApp",
    "https://github.com/PocketFlow",
    "https://www.linkedin.com/company/pocketflow"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "support@pocket-flow.app",
    "contactType": "customer support"
  }
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to track an expense in PocketFlow",
  "description": "Learn how to easily log and categorize your spending using AI scanning.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Open the Dashboard",
      "text": "Log in to your PocketFlow account and navigate to the main dashboard."
    },
    {
      "@type": "HowToStep",
      "name": "Upload a Receipt",
      "text": "Click 'Add Expense' and upload a photo of your receipt for AI processing."
    },
    {
      "@type": "HowToStep",
      "name": "Verify and Save",
      "text": "Review the AI-extracted details (amount, category, date) and confirm the entry."
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              jsonLd,
              faqJsonLd,
              organizationJsonLd,
              howToJsonLd
            ])
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }
        }} />
        <ClientProviders>
          {children}
          <FooterVisibility />
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
