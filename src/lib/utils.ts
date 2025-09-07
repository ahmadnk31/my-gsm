import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Convert price to Euro format
 * @param price - The price in cents or as a number
 * @param fromCents - Whether the input price is in cents (default: false)
 * @returns Formatted Euro price string
 */
export function formatPriceToEuro(price: number, fromCents: boolean = false): string {
  // Convert from cents if needed
  const euroAmount = fromCents ? price / 100 : price;
  
  // Format to Euro with proper locale formatting
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(euroAmount);
}

/**
 * Convert price to Euro with custom formatting options
 * @param price - The price in cents or as a number
 * @param options - Formatting options
 * @returns Formatted Euro price string
 */
export function formatPriceToEuroAdvanced(
  price: number, 
  options: {
    fromCents?: boolean;
    locale?: string;
    showSymbol?: boolean;
    decimals?: number;
  } = {}
): string {
  const {
    fromCents = false,
    locale = 'de-DE',
    showSymbol = true,
    decimals = 2
  } = options;

  // Convert from cents if needed
  const euroAmount = fromCents ? price / 100 : price;
  
  if (showSymbol) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(euroAmount);
  } else {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(euroAmount) + ' €';
  }
}
