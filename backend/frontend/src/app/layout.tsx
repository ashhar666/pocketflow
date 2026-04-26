import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientProviders from "./providers";
import FooterVisibility from "./FooterVisibility";
import { Analytics } from "@vercel/analytics/next";


const inter = Inter({ subsets: ["latin"] });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
  'https://pocketflow-chi.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PocketFlow - Smart Expense Tracker",
    template: "%s | PocketFlow",
  },
  description: "Track expenses, manage budgets, scan receipts with AI, and reach your savings goals. The smart way to manage your personal finances.",
  keywords: ["expense tracker", "budget manager", "savings goal", "receipt scanner", "AI finance", "personal finance", "money tracker", "expense management"],
  authors: [{ name: "PocketFlow" }],
  creator: "PocketFlow",
  publisher: "PocketFlow",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "PocketFlow",
    title: "PocketFlow - Smart Expense Tracker",
    description: "Track expenses, manage budgets, scan receipts with AI, and reach your savings goals. The smart way to manage your personal finances.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PocketFlow - Smart Expense Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PocketFlow - Smart Expense Tracker",
    description: "Track expenses, manage budgets, scan receipts with AI, and reach your savings goals.",
    images: ["/og-image.png"],
    creator: "@pocketflow",
  },
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png" },
    ],
  },
  manifest: "/manifest.json",
  category: "finance",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PocketFlow",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: "Advanced AI-powered expense tracking and budget management system with real-time Telegram integration.",
  softwareVersion: "1.0.0",
  datePublished: "2024-01-01",
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
    "Multi-currency support",
    "AES-256 Encryption",
  ],
  screenshot: `${SITE_URL}/img/dashboard-preview.png`,
  ratingValue: "4.9",
  reviewCount: "128",
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
    },
    {
      "@type": "Question",
      name: "How does multi-currency conversion work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We support over 150 global currencies, automatically fetching real-time exchange rates for accurate tracking."
      }
    }
  ]
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL
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
              breadcrumbJsonLd,
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "PocketFlow",
                url: SITE_URL,
                logo: `${SITE_URL}/favicon.png`,
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+1-000-000-0000",
                  contactType: "customer service"
                },
                sameAs: [
                  "https://twitter.com/pocketflow",
                  "https://github.com/pocketflow"
                ],
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
      </body>

    </html>
  );
}
