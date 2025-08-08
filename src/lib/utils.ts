import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRatio(ratio: number): string {
  if (isNaN(ratio) || !isFinite(ratio)) {
    return "0.0%";
  }
  return `${(ratio * 100).toFixed(1)}%`;
}
