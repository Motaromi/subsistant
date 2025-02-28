import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and Tailwind CSS classes efficiently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency amount as EUR
 */
export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(numAmount);
}

/**
 * Extracts the numeric value from a currency string if possible
 */
export function extractNumericValue(value: string): number | null {
  if (!value) return null;
  
  // Extract numbers and decimal points
  const matches = value.match(/\d+([.,]\d+)?/);
  if (matches && matches[0]) {
    // Replace comma with period for parsing
    return parseFloat(matches[0].replace(",", "."));
  }
  
  return null;
}

/**
 * Subsidy interface for type safety
 */
export interface Subsidy {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  industry: string[] | string;
  companySize: string[] | string;
  stage: string[] | string;
  deadline: string;
  applicationProcess: string;
  fundingAmount: string;
  website: string;
}

/**
 * Groups subsidies by industry for better visualization
 */
export function groupSubsidiesByIndustry(subsidies: Subsidy[]) {
  const grouped: Record<string, Subsidy[]> = {};
  
  subsidies.forEach((subsidy) => {
    const industries = Array.isArray(subsidy.industry) ? subsidy.industry : [subsidy.industry];
    
    industries.forEach((industry: string) => {
      if (!grouped[industry]) {
        grouped[industry] = [];
      }
      if (!grouped[industry].includes(subsidy)) {
        grouped[industry].push(subsidy);
      }
    });
  });
  
  return grouped;
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
} 