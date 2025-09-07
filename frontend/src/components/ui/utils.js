/**
 * Creates a URL-friendly path from a page name.
 * This ensures all links are generated consistently.
 * @param page The name of the page (e.g., "Dashboard").
 * @returns A relative URL path (e.g., "/dashboard").
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const createPageUrl = (page) => {
  return `/${page.toLowerCase().replace(/\s+/g, '-')}`;
};