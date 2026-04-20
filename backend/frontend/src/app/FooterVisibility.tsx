'use client';

import { usePathname } from 'next/navigation';
import MinimalistFooter from '@/components/layout/MinimalistFooter';

const HIDE_FOOTER_PATHS = [
  '/login', 
  '/register', 
  '/forgot-password', 
  '/reset-password',
  '/dashboard',
  '/expenses',
  '/categories',
  '/budgets',
  '/savings',
  '/settings',
  '/income',
  '/telegram',
  '/reports'
];

export default function FooterVisibility() {
  const pathname = usePathname();
  
  // Check if current path matches or starts with any of the hidden paths
  const shouldHide = HIDE_FOOTER_PATHS.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  if (shouldHide) return null;
  
  return <MinimalistFooter />;
}
