import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientProviders from "./providers";
import { FooterWrapper } from "@/components/layout/FooterWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expense Tracker SaaS",
  description: "Track your expenses, manage budgets, and reach your savings goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }
        }} />
        <ClientProviders>
          {children}
          <FooterWrapper />
        </ClientProviders>
      </body>
    </html>
  );
}
