/**
 * Public routes that do NOT require authentication.
 */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/legal/privacy-policy',
  '/legal/tos',
  '/legal/cookie-policy',
];

/**
 * Route prefixes that ALWAYS require authentication.
 */
export const PROTECTED_PREFIXES = [
  '/dashboard',
  '/settings',
  '/expenses',
  '/income',
  '/budgets',
  '/categories',
  '/savings',
  '/reports',
  '/telegram',
];
