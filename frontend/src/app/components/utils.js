/**
 * Creates a URL-friendly path from a page name.
 * This ensures all links are generated consistently.
 * @param page The name of the page (e.g., "Dashboard").
 * @returns A relative URL path (e.g., "/dashboard").
 */
export const createPageUrl = (page) => {
  return `/${page.toLowerCase().replace(/\s+/g, '-')}`;
};