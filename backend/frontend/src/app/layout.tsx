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
    default: "PocketFlow | Smart AI Expense Tracker",
    template: "%s | PocketFlow"
  },
  description: "Track your expenses effortlessly with AI receipt scanning, real-time budgeting, and savings goals.",
  keywords: ["expense tracker", "AI receipt scanner", "budget tracker", "personal finance", "PocketFlow", "money manager"],
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
    title: "PocketFlow | Smart AI Expense Tracker",
    description: "Track your expenses effortlessly with AI receipt scanning.",
    images: [{ 
      url: "/og-image.png", 
      width: 1200, 
      height: 630, 
      alt: "PocketFlow AI Expense Tracker Dashboard" 
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PocketFlow | Smart AI Expense Tracker",
    description: "Track your expenses effortlessly with AI receipt scanning.",
    images: ["/og-image.png"],
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
  description: "Advanced AI-powered expense tracking and budget management system with real-time Telegram integration.",
  softwareVersion: "1.0.0",
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
        text: "Just link your account to @PaisaTrackerBot and send a text message or photo of your receipt. The bot instantly syncs with your dashboard."
      }
    },
    {
      "@type": "Question",
      name: "Is my financial data secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we employ bank-grade AES-256 encryption and a secure architecture ensuring only you have access to your data."
      }
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
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "PocketFlow",
                url: SITE_URL,
                logo: `${SITE_URL}/favicon.png`,
              }
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
