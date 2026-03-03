/**
 * Utility Functions
 * 
 * General-purpose helper functions used across the app.
 * The `cn` function is especially important — it's the standard way
 * to merge Tailwind CSS classes in shadcn/ui projects.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge CSS class names intelligently.
 * 
 * WHY THIS EXISTS:
 * When you combine Tailwind classes, conflicts can happen:
 *   cn("px-4", "px-2") → "px-2" (last one wins, no duplicates)
 * 
 * `clsx` handles conditional classes, `twMerge` resolves Tailwind conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
