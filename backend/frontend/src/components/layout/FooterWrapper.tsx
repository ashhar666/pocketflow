"use client";

import { usePathname } from "next/navigation";
import { Component as TapedFooter } from "@/components/ui/footer-taped-design";

export const FooterWrapper = () => {
  const pathname = usePathname();
  
  // Hide footer on dashboard, authentication and legal pages for a cleaner experience
  const hideFooterOn = [
    "/login", "/register", "/forgot-password", "/reset-password",
    "/dashboard", "/expenses", "/categories", "/budgets", "/savings", "/settings", "/income"
  ];
  const shouldHide = hideFooterOn.some(path => pathname.startsWith(path));

  if (shouldHide) return null;

  return <TapedFooter />;
};
