import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(val: number | string | undefined | null, currencyCode: string = 'INR') {
  const num = typeof val === 'string' ? parseFloat(val) : (val || 0);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
    }).format(Number(num));
  } catch (e) {
    return `${currencyCode} ${Number(num).toLocaleString('en-IN')}`;
  }
}
