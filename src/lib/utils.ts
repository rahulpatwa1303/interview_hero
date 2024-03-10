import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isTimeExpired(expiryTimeString: string): boolean {
  // Create Date objects for both current and expiry times
  const now = new Date();
  const expiryTime = new Date(expiryTimeString);

  // Convert to timestamps for efficient comparison
  const nowTimestamp = now.getTime();
  const expiryTimestamp = expiryTime.getTime();

  // Check if expiry time is in the past (expired)
  return expiryTimestamp < nowTimestamp;
}