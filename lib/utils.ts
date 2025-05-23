import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SESSIONS_PER_DAY_LIMIT = 3;

export const ITEMS_PER_PAGE = 10; // Define how many items per page
