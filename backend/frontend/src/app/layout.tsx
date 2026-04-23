import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientProviders from "./providers";
import FooterVisibility from "./FooterVisibility";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://pocketflow-chi.vercel.app';

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
  description: "Track expenses, manage budgets, scan receipts with AI, and reach your savings goals.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "AI Receipt Scanner",
    "Expense Tracking",
    "Budget Management",
    "Savings Goals",
    "Telegram Bot Integration",
    "Financial Reports",
  ],
  screenshot: `${SITE_URL}/img/dashboard-preview.png`,
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
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "PocketFlow",
                url: SITE_URL,
                logo: `${SITE_URL}/favicon.png`,
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
      </body>
    </html>
  );
}
