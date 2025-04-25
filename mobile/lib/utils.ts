import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 12).padStart(12, "0")
  );
}
